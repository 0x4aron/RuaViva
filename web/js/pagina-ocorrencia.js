const usuario = sessao.ler();
if (!usuario) location.replace("index.html");
const ehCidadao = usuario?.perfil === "cidadao";
montarCabecalho(ehCidadao ? LINKS_CIDADAO("") : LINKS_GESTOR(""));
const id = Number(new URLSearchParams(location.search).get("id"));
let mapa;
function eventosDaOcorrencia(o, atendimentos, equipes) {
  const eventos = [{ data: o.dataAbertura, texto: "Problema registrado" }];
  atendimentos.forEach((a) => {
    const equipe = nomeExibido(equipes.find((e) => e.idEquipe === a.idEquipe)?.nome || "equipe não informada");
    if (a.status === "AGENDADO") eventos.push({ data: a.dataAgendada, texto: `Visita agendada com ${equipe}`, agendado: true });
    if (a.status === "CONCLUIDO") eventos.push({ data: a.dataExecucao, texto: `Visita concluída por ${equipe}${a.observacao ? ": " + a.observacao : ""}` });
    // A API não informa quando ocorreu o cancelamento.
    if (a.status === "CANCELADO") eventos.push({ data: null, texto: `Visita prevista para ${formatarData(a.dataAgendada)} cancelada. Data do cancelamento não informada.` });
  });
  if (o.status === "RESOLVIDA" && !eventos.some((e) => e.data === o.dataResolucao && e.texto.startsWith("Visita concluída"))) eventos.push({ data: o.dataResolucao, texto: "Problema resolvido" });
  if (o.status === "CANCELADA") eventos.push({ data: null, texto: "Registro cancelado. Data do cancelamento não informada." });
  return eventos.sort((a, b) => (a.data || "9999").localeCompare(b.data || "9999"));
}
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
async function carregar() {
  limparAviso();
  if (!Number.isInteger(id) || id <= 0) {
    $("detalhe").innerHTML = '<h1>Registro não encontrado</h1><p>Escolha um registro na lista do bairro ou na fila de trabalho.</p>';
    return;
  }
  try {
    const [o, apoios, atendimentos, apoio, equipes] = await Promise.all([
      api.get(`/ocorrencias/${id}`), api.get(`/ocorrencias/${id}/apoios`), api.get(`/ocorrencias/${id}/atendimentos`), carregarApoio(), api.get("/equipes"),
    ]);
    const categoria = apoio.categoria[o.idCategoria];
    const pendente = ["ABERTA", "EM_ANDAMENTO"].includes(o.status);
    const minha = ehCidadao && o.idCidadao === usuario.idCidadao;
    const meuApoio = apoios.find((a) => a.idCidadao === usuario.idCidadao);
    const visita = atendimentos.find((a) => a.status === "AGENDADO");
    const eventos = eventosDaOcorrencia(o, atendimentos, equipes);
    const atual = situacao(o, visita, equipes);
    const ultima = eventos.at(-1);
    const dias = diasDesde(o.dataAbertura, o.dataResolucao || hoje());
    const atrasado = pendente && dias > categoria.prazoDias;
    const nivel = nivelPrioridade(o.prioridade);
    let acao = "";
    if (ehCidadao && pendente && !minha) acao = meuApoio
      ? '<p>Você apoiou este registro.</p><button id="retirar" class="botao" type="button">Retirar meu apoio</button>'
      : '<button id="apoiar" class="botao botao-principal" type="button">Isso também me afeta</button>';
    if (minha) acao = '<p>Este registro é seu. Vizinhos afetados podem apoiá-lo; cada apoio entra no cálculo da prioridade.</p>';
    if (!pendente) acao += '<p class="texto-suave">Este registro está encerrado e não recebe novos apoios.</p>';
    mapa?.remove();
    $("detalhe").innerHTML = `<h1>${placaDeRua(o, true)}</h1>
      <div class="item-topo"><strong>${icone(categoriaVisual(categoria).icone)} ${esc(nomeExibido(categoria.nome))}</strong>${seloStatus(o.status)}</div>
      <p>${esc(nomeExibido(o.descricao))}</p>
      <section class="bloco situacao" aria-labelledby="titulo-situacao"><h2 id="titulo-situacao">Situação do registro</h2>
        <p class="situacao-frase">${esc(atual.frase)}</p><p><strong>Última movimentação:</strong> ${esc(ultima.texto)}${ultima.data ? ` · ${formatarData(ultima.data)}` : ""}</p>
        <p><strong>Próxima etapa:</strong> ${esc(atual.proxima)}</p>
        <p class="${atrasado ? "atrasado" : "texto-suave"}">${atrasado ? icone("relogio") + " Passou do prazo de referência. " : ""}Prazo de referência da categoria: ${categoria.prazoDias} dias.${pendente ? ` Aberto há ${dias} dias.` : ""}</p>
      </section>
      <section aria-labelledby="titulo-historico"><h2 id="titulo-historico">O que já aconteceu</h2><ol class="linha-tempo">${eventos.map((evento) => `<li>${esc(evento.texto)}${evento.data ? `<time datetime="${evento.data}">${evento.agendado ? "Data prevista: " : ""}${formatarData(evento.data)}</time>` : ""}</li>`).join("")}</ol></section>
      <section class="bloco" aria-labelledby="titulo-apoio"><h2 id="titulo-apoio">Isso também me afeta</h2>
        <p>${icone("pessoas")} <strong>${textoApoios(apoios.length)}</strong> de vizinhos neste registro.</p>
        ${minha ? "" : '<p>Apoios ajudam a subprefeitura a ver quantas pessoas são afetadas. Cada apoio entra no cálculo da prioridade.</p>'}${acao}
      </section>
      ${!ehCidadao ? `<section class="bloco"><h2>Prioridade</h2><p class="prioridade ${nivel.classe}"><span class="prioridade-valor">${o.prioridade}</span>${nivel.texto}</p><button id="por-que" class="botao-texto" aria-expanded="false" aria-controls="composicao" type="button">Por que ${o.prioridade} pontos?</button><div id="composicao" hidden aria-live="polite"></div></section>` : ""}
      <section aria-labelledby="titulo-local"><h2 id="titulo-local">Local do problema</h2><p>${esc(endereco(o))} — ${esc(nomeProprio(apoio.distrito[o.idDistrito]?.nome))}</p><div id="mapa" class="mapa mapa-pequeno" role="region" aria-label="Local do problema no mapa"></div></section>`;
    mapa = criarMapa("mapa", [o.latitude, o.longitude], 18);
    if (mapa) marcadorOcorrencia(o).addTo(mapa);
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
    $("detalhe").innerHTML = '<h1>Problema registrado</h1><p>Não foi possível carregar este registro.</p>';
    erroComTentativa(erro, carregar);
    return false;
  }
}
if (usuario) carregar();
