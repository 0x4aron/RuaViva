const usuario = sessao.ler();
const ehCidadao = usuario?.perfil === "cidadao";
const ehGestor = usuario?.perfil === "gestor";
montarCabecalho(ehCidadao ? LINKS_CIDADAO("") : ehGestor ? LINKS_GESTOR("") : []);
const id = Number(new URLSearchParams(location.search).get("id"));
let mapa;
function eventosDaOcorrencia(o, atendimentos, equipes) {
  const eventos = [{ data: o.dataAbertura, texto: "Problema registrado" }];
  atendimentos.forEach((a) => {
    const equipe = nomeExibido(equipes.find((e) => e.idEquipe === a.idEquipe)?.nome || "equipe não informada");
    if (a.status === "AGENDADO") eventos.push({ data: a.dataAgendada, texto: `Visita agendada com ${equipe}`, agendado: true });
    if (a.status === "CONCLUIDO") eventos.push({ data: a.dataExecucao, texto: `Visita concluída por ${equipe}${a.observacao ? ": " + a.observacao : ""}` });
    // A API não guarda a data do cancelamento.
    if (a.status === "CANCELADO") eventos.push({ data: null, texto: `Visita prevista para ${formatarData(a.dataAgendada)} cancelada. Data do cancelamento não informada.` });
  });
  if (o.status === "RESOLVIDA" && !eventos.some((e) => e.data === o.dataResolucao && e.texto.startsWith("Visita concluída"))) eventos.push({ data: o.dataResolucao, texto: "Problema resolvido" });
  if (o.status === "CANCELADA") eventos.push({ data: null, texto: "Registro cancelado. Data do cancelamento não informada." });
  const datados = eventos.filter(temData).sort((a, b) => Date.parse(a.data) - Date.parse(b.data));
  return datados.concat(eventos.filter((evento) => !temData(evento)));
}
function temData(evento) { return Number.isFinite(Date.parse(evento.data)); }
function situacao(o, visita, equipes) {
  if (o.status === "RESOLVIDA") return { frase: o.dataResolucao ? `Resolvido em ${formatarData(o.dataResolucao).slice(0, 5)}` : "Problema resolvido", proxima: "Atendimento encerrado. O histórico permanece disponível." };
  if (o.status === "CANCELADA") return { frase: "Registro cancelado", proxima: "Este registro está encerrado." };
  if (visita) {
    const equipe = equipes.find((e) => e.idEquipe === visita.idEquipe);
    return { frase: `Visita agendada para ${formatarData(visita.dataAgendada).slice(0, 5)}`, proxima: `Visita agendada para ${formatarData(visita.dataAgendada)} com ${nomeExibido(equipe?.nome || "equipe não informada")}. A conclusão ainda não foi registrada.` };
  }
  if (o.status === "EM_ANDAMENTO") return { frase: "Atendimento em andamento", proxima: "Nenhuma visita agendada consta no sistema neste momento." };
  return { frase: "Aguardando equipe", proxima: "O registro está na fila da subprefeitura. Ainda não há visita agendada." };
}
function resumoApoios(total) {
  if (total === 0) return "Ainda não há apoios de vizinhos neste registro.";
  return `${total} ${total === 1 ? "vizinho apoia" : "vizinhos apoiam"} este registro.`;
}
async function copiarLink() {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Cópia indisponível");
    await navigator.clipboard.writeText(location.href);
    $("compartilhamento-estado").textContent = "Link copiado.";
  } catch {
    const campo = document.createElement("textarea");
    campo.value = location.href;
    campo.setAttribute("readonly", "");
    campo.style.position = "fixed";
    campo.style.left = "-1000px";
    document.body.append(campo);
    campo.select();
    let copiado = false;
    try { copiado = document.execCommand?.("copy") === true; } catch {}
    campo.remove();
    $("compartilhamento-estado").textContent = copiado ? "Link copiado." : "Não foi possível copiar. Selecione o endereço na barra do navegador.";
  }
}
async function carregar() {
  limparAviso();
  if (!Number.isInteger(id) || id <= 0) {
    $("detalhe").innerHTML = `<h1>Registro não encontrado</h1><p class="vazio">${icone("info")} Escolha um registro na lista do bairro ou na fila de trabalho.</p>`;
    return;
  }
  try {
    const [o, apoios, atendimentos, apoio, equipes] = await Promise.all([
      api.get(`/ocorrencias/${id}`), api.get(`/ocorrencias/${id}/apoios`), api.get(`/ocorrencias/${id}/atendimentos`), carregarApoio(), api.get("/equipes"),
    ]);
    const categoria = apoio.categoria[o.idCategoria];
    const pendente = ["ABERTA", "EM_ANDAMENTO"].includes(o.status);
    const minha = ehCidadao && o.idCidadao === usuario.idCidadao;
    const meuApoio = ehCidadao ? apoios.find((a) => a.idCidadao === usuario.idCidadao) : null;
    const visita = atendimentos.find((a) => a.status === "AGENDADO");
    const eventos = eventosDaOcorrencia(o, atendimentos, equipes);
    const atual = situacao(o, visita, equipes);
    const ultima = eventos.filter(temData).at(-1);
    const dias = diasDesde(o.dataAbertura, o.dataResolucao || hoje());
    const atrasado = pendente && dias > categoria.prazoDias;
    const nivel = nivelPrioridade(o.prioridade);
    let acao = "";
    if (ehCidadao && pendente && !minha) acao = meuApoio
      ? '<p>Você apoiou este registro.</p><button id="retirar" class="botao" type="button">Retirar meu apoio</button>'
      : '<button id="apoiar" class="botao botao-principal" type="button">Isso também me afeta</button>';
    if (minha) acao = '<p>Este registro é seu. Vizinhos afetados podem apoiá-lo; cada apoio entra no cálculo da prioridade.</p>';
    if (!pendente) acao += '<p class="texto-suave">Este registro está encerrado e não recebe novos apoios.</p>';
    if (!usuario && pendente) acao = '<p><a href="index.html">Escolha um perfil de morador</a> para apoiar este registro.</p>';
    mapa?.remove();
    const linkWhatsapp = `https://wa.me/?text=${encodeURIComponent(`${numeroRegistro(o)}: ${location.href}`)}`;
    $("detalhe").innerHTML = `<h1>${placaDeRua(o, true)}</h1>
      <p class="protocolo">${esc(numeroRegistro(o))}</p>
      <div class="item-topo"><strong>${iconeCategoria(categoriaVisual(categoria).icone, "detalhe")} ${esc(nomeExibido(categoria.nome))}</strong>${seloStatus(o.status)}</div>
      <p>${esc(nomeExibido(o.descricao))}</p>
      <div class="acoes acoes-comprovante" aria-label="Ações do registro"><button id="copiar-link" class="botao" type="button">Copiar link</button><a class="botao" href="${linkWhatsapp}" target="_blank" rel="noopener noreferrer">Enviar pelo WhatsApp</a><button id="imprimir" class="botao" type="button">Imprimir</button></div>
      <p id="compartilhamento-estado" class="texto-suave" aria-live="polite"></p>
      <section class="bloco situacao" aria-labelledby="titulo-situacao"><h2 id="titulo-situacao">Situação do registro</h2>
        ${linhaDoAtendimento(o, atendimentos, equipes)}
        <p class="situacao-frase">${esc(atual.frase)}</p><p><strong>Última movimentação:</strong> ${ultima ? `${esc(ultima.texto)} · ${formatarData(ultima.data)}` : "Nenhuma movimentação com data informada."}</p>
        <p><strong>Próxima etapa:</strong> ${esc(atual.proxima)}</p>
        <p class="${atrasado ? "atrasado" : "texto-suave"}">${atrasado ? icone("relogio") + " Passou do prazo de referência. " : ""}Prazo de referência da categoria: ${textoPrazo(categoria.prazoDias)}.${pendente ? ` Aberto ${textoTempoDesde(o.dataAbertura)}.` : ""}</p>
      </section>
      ${atrasado ? `<aside class="aviso aviso-ouvidoria"><svg class="icone" aria-hidden="true"><use href="img/icones.svg#info"></use></svg><div><p>Fez um pedido oficial no SP156 e ele também não foi atendido? Você pode reclamar na <a href="https://sp156.prefeitura.sp.gov.br/portal/servicos/informacao?servico=2630" target="_blank" rel="noopener noreferrer">Ouvidoria Geral do Município</a>.</p><p class="texto-suave">O número RuaViva não substitui o protocolo do SP156.</p></div></aside>` : ""}
      <section aria-labelledby="titulo-historico"><h2 id="titulo-historico">O que já aconteceu</h2><ol class="linha-tempo">${eventos.map((evento) => `<li>${esc(evento.texto)}${evento.data ? `<time datetime="${evento.data}">${evento.agendado ? "Data prevista: " : ""}${formatarData(evento.data)}</time>` : ""}</li>`).join("")}</ol></section>
      <section class="bloco" aria-labelledby="titulo-apoio"><h2 id="titulo-apoio">Isso também me afeta</h2>
        <p>${icone("pessoas")} ${resumoApoios(apoios.length)}</p>
        ${minha ? "" : '<p>Apoios ajudam a subprefeitura a ver quantas pessoas são afetadas. Cada apoio entra no cálculo da prioridade.</p>'}${acao}
      </section>
      ${ehGestor ? `<section class="bloco"><h2>Prioridade</h2><p class="prioridade ${nivel.classe}"><span class="prioridade-valor">${o.prioridade}</span>${nivel.texto}</p><button id="por-que" class="botao-texto" aria-expanded="false" aria-controls="composicao" type="button">Por que ${o.prioridade} pontos?</button><div id="composicao" hidden aria-live="polite"></div></section>` : ""}
      <section aria-labelledby="titulo-local"><h2 id="titulo-local">Local do problema</h2><p>${esc(endereco(o))} — ${esc(nomeProprio(apoio.distrito[o.idDistrito]?.nome))}</p><div id="mapa" class="mapa mapa-pequeno" role="region" aria-label="Local do problema no mapa"></div></section>`;
    mapa = criarMapa("mapa", [o.latitude, o.longitude], 18);
    if (mapa) marcadorOcorrencia(o).addTo(mapa);
    $("copiar-link").addEventListener("click", copiarLink);
    $("imprimir").addEventListener("click", () => window.print());
    $("apoiar")?.addEventListener("click", (evento) => enviarComBotao(evento.currentTarget, async () => {
      await api.post("/apoios", { idOcorrencia: id, idCidadao: usuario.idCidadao });
      if (await carregar()) avisar("Apoio registrado. Obrigado por avisar que isso também afeta você.");
    }));
    $("retirar")?.addEventListener("click", (evento) => enviarComBotao(evento.currentTarget, async () => {
      await api.delete(`/apoios/${meuApoio.idApoio}`);
      if (await carregar()) avisar("Seu apoio foi retirado.");
    }));
    $("por-que")?.addEventListener("click", () => {
      const area = $("composicao");
      area.hidden = !area.hidden;
      $("por-que").setAttribute("aria-expanded", String(!area.hidden));
      if (!area.hidden) mostrarComposicao(id, area);
    });
    return true;
  } catch (erro) {
    $("detalhe").innerHTML = `<h1>Problema registrado</h1><p class="vazio">${icone("alerta")} Não foi possível carregar este registro.</p>`;
    erroComTentativa(erro, carregar);
    return false;
  }
}
if (usuario) carregar();
