sessao.exigir("gestor");
montarCabecalho(LINKS_GESTOR("fila"));
let apoio, equipes = [], fila = [], agendados = [], contagem = {};
let painelAberto = null, botaoAberto = null;
function fecharPainel() {
  if (painelAberto) painelAberto.hidden = true;
  if (botaoAberto) botaoAberto.setAttribute("aria-expanded", "false");
  painelAberto = null;
  botaoAberto = null;
}
function abrirPainel(painel, botao) {
  const jaAberto = painel === painelAberto;
  fecharPainel();
  if (jaAberto) return false;
  painel.hidden = false;
  botao.setAttribute("aria-expanded", "true");
  painelAberto = painel;
  botaoAberto = botao;
  return true;
}
function equipesDaOcorrencia(o) {
  const subprefeitura = apoio.distrito[o.idDistrito]?.idSubprefeitura;
  return equipes.filter((e) => e.ativa === true && subprefeitura != null && e.idSubprefeitura === subprefeitura);
}
function prazo(o) {
  const dias = diasDesde(o.dataAbertura);
  const referencia = apoio.categoria[o.idCategoria]?.prazoDias;
  const complemento = referencia == null ? "prazo não informado" : dias > referencia ? `${dias - referencia} além do prazo` : `prazo ${referencia} dias`;
  return `<span class="prazo"><strong>${dias} ${dias === 1 ? "dia" : "dias"}</strong><span class="${dias > referencia ? "atrasado" : "texto-suave"}">${complemento}</span></span>`;
}
function desenharFila() {
  $("fila").innerHTML = fila.length ? fila.map((o) => {
    const nivel = nivelPrioridade(o.prioridade);
    const disponiveis = equipesDaOcorrencia(o);
    return `<article role="listitem"><div class="fila-linha">
      <div class="prioridade ${nivel.classe}"><span class="prioridade-valor">${o.prioridade}</span><span>${nivel.texto}</span></div>
      <div><a href="ocorrencia.html?id=${o.idOcorrencia}"><strong>${esc(nomeExibido(apoio.categoria[o.idCategoria]?.nome))}</strong></a><p class="item-meta">${esc(nomeExibido(o.descricao))}</p></div>
      <div>${placaDeRua(o)}</div><span class="item-meta">${textoApoios(contagem[o.idOcorrencia] || 0)}</span><div class="item-meta">${prazo(o)}</div>
      <button class="botao" type="button" data-abrir="${o.idOcorrencia}" aria-expanded="false" aria-controls="agendar-${o.idOcorrencia}">Agendar<span class="visualmente-oculto">: ${esc(endereco(o))}</span></button>
      </div><div id="agendar-${o.idOcorrencia}" class="form-inline" hidden>
      <h3>Agendar visita</h3><button type="button" class="botao-texto" data-composicao="${o.idOcorrencia}" aria-expanded="false" aria-controls="composicao-${o.idOcorrencia}">Por que ${o.prioridade} pontos?</button>
      <div id="composicao-${o.idOcorrencia}" hidden aria-live="polite"></div>
      <form data-agendar="${o.idOcorrencia}" novalidate><div class="linha-campos">
      <div class="campo"><label for="equipe-${o.idOcorrencia}">Equipe</label><p class="dica" id="equipe-dica-${o.idOcorrencia}">${disponiveis.length ? "Equipes ativas da subprefeitura deste registro." : "Nenhuma equipe ativa nesta subprefeitura."}</p>
        <select id="equipe-${o.idOcorrencia}" name="equipe" required aria-describedby="equipe-dica-${o.idOcorrencia}" ${!disponiveis.length ? "disabled" : ""}><option value="">Escolha a equipe</option>${disponiveis.map((e) => `<option value="${e.idEquipe}">${esc(nomeExibido(e.nome))}</option>`).join("")}</select></div>
      <div class="campo"><label for="data-${o.idOcorrencia}">Dia da visita</label><p class="dica" id="data-dica-${o.idOcorrencia}">Escolha hoje ou uma data futura.</p><input id="data-${o.idOcorrencia}" name="data" type="date" min="${hoje()}" required aria-describedby="data-dica-${o.idOcorrencia}"></div></div>
      <button class="botao botao-principal" type="submit" ${!disponiveis.length ? "disabled" : ""}>Agendar visita</button></form></div></article>`;
  }).join("") : '<p class="vazio">Nenhum problema aguardando equipe.</p>';
}
function desenharVisitas(ocorrencias) {
  $("andamento").innerHTML = agendados.length ? agendados.map((visita) => {
    const o = ocorrencias.find((item) => item.idOcorrencia === visita.idOcorrencia);
    if (!o) return '<li class="visita">Registro da visita indisponível.</li>';
    const equipe = equipes.find((e) => e.idEquipe === visita.idEquipe);
    return `<li class="item visita"><div class="item-topo"><a href="ocorrencia.html?id=${o.idOcorrencia}"><strong>${esc(nomeExibido(apoio.categoria[o.idCategoria]?.nome))}</strong></a>${seloStatus(o.status)}</div>
      ${placaDeRua(o)}<p class="item-meta">${esc(nomeExibido(o.descricao))}</p>
      <p>${icone("relogio")} Visita agendada para ${formatarData(visita.dataAgendada)} com ${esc(nomeExibido(equipe?.nome || "equipe não informada"))}.</p>
      <p class="item-meta">${prazo(o)}</p><div class="acoes">
      <button class="botao botao-principal" type="button" data-confirmar="${visita.idAtendimento}" aria-expanded="false" aria-controls="concluir-${visita.idAtendimento}">Marcar como resolvido</button>
      <button class="botao botao-perigo" type="button" data-abrir-cancelar="${visita.idAtendimento}" aria-expanded="false" aria-controls="cancelar-${visita.idAtendimento}">Cancelar visita</button></div>
      <form id="concluir-${visita.idAtendimento}" class="form-inline" data-concluir="${visita.idAtendimento}" hidden novalidate>
        <h3>Confirmar resolução</h3><div class="campo"><label for="obs-${visita.idAtendimento}">O que foi feito (opcional)</label><textarea id="obs-${visita.idAtendimento}" name="observacao" maxlength="500"></textarea></div>
        <p>A conclusão será registrada em ${formatarData(hoje())}.</p><button class="botao botao-principal" type="submit">Confirmar resolução</button>
        <button class="botao-texto" type="button" data-fechar>Voltar</button></form>
      <div id="cancelar-${visita.idAtendimento}" class="form-inline" hidden><h3>Cancelar esta visita?</h3><p>O problema volta para a fila de trabalho.</p>
        <button class="botao botao-perigo" type="button" data-cancelar="${visita.idAtendimento}">Confirmar cancelamento</button><button class="botao-texto" type="button" data-fechar>Manter visita</button></div></li>`;
  }).join("") : '<li class="vazio">Nenhuma visita agendada no momento.</li>';
}
async function carregar(limpar = true) {
  if (limpar) limparAviso();
  fecharPainel();
  $("fila").innerHTML = '<p class="carregando">Carregando fila…</p>';
  $("andamento").innerHTML = '<li class="carregando">Carregando visitas…</li>';
  try {
    const [dados, todasEquipes, aguardando, ocorrencias, atendimentos, apoios] = await Promise.all([
      carregarApoio(), api.get("/equipes"), api.get("/ocorrencias/fila"), api.get("/ocorrencias"), api.get("/atendimentos"), api.get("/apoios"),
    ]);
    apoio = dados;
    equipes = todasEquipes;
    fila = aguardando.sort((a, b) => b.prioridade - a.prioridade);
    agendados = atendimentos.filter((a) => a.status === "AGENDADO").sort((a, b) => a.dataAgendada.localeCompare(b.dataAgendada));
    contagem = contarApoios(apoios);
    const atrasadas = ocorrencias.filter((o) => ["ABERTA", "EM_ANDAMENTO"].includes(o.status) && diasDesde(o.dataAbertura) > apoio.categoria[o.idCategoria]?.prazoDias);
    $("resumo").textContent = `${fila.length} aguardando equipe · ${atrasadas.length} ${atrasadas.length === 1 ? "passou" : "passaram"} do prazo · ${agendados.length} ${agendados.length === 1 ? "visita agendada" : "visitas agendadas"}`;
    desenharFila();
    desenharVisitas(ocorrencias);
    return true;
  } catch (erro) {
    $("fila").innerHTML = '<p class="vazio">Fila indisponível.</p>';
    $("andamento").innerHTML = '<li class="vazio">Visitas indisponíveis.</li>';
    $("resumo").textContent = "Não foi possível atualizar a fila e as visitas.";
    erroComTentativa(erro, carregar);
    return false;
  }
}
$("fila").addEventListener("click", (evento) => {
  const abrir = evento.target.closest("[data-abrir]");
  if (abrir) {
    const area = $("agendar-" + abrir.dataset.abrir);
    if (abrirPainel(area, abrir)) area.querySelector("button").focus();
  }
  const botao = evento.target.closest("[data-composicao]");
  if (botao) {
    const area = $("composicao-" + botao.dataset.composicao);
    area.hidden = !area.hidden;
    botao.setAttribute("aria-expanded", String(!area.hidden));
    if (!area.hidden) mostrarComposicao(botao.dataset.composicao, area);
  }
});
$("fila").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const form = evento.target;
  form.elements.data.min = hoje();
  if (!validarFormulario(form)) return;
  const ocorrencia = fila.find((o) => o.idOcorrencia === Number(form.dataset.agendar));
  const equipe = equipesDaOcorrencia(ocorrencia).find((e) => e.idEquipe === Number(form.elements.equipe.value));
  if (!equipe) return avisar("Escolha uma equipe ativa da subprefeitura deste registro.", "erro");
  const data = form.elements.data.value;
  await enviarComBotao(form.querySelector('[type="submit"]'), async () => {
    await api.post("/atendimentos", { idOcorrencia: ocorrencia.idOcorrencia, idEquipe: equipe.idEquipe, dataAgendada: data });
    if (await carregar(false)) avisar(`Visita agendada para ${formatarData(data)} com ${nomeExibido(equipe.nome)}.`);
  });
});
$("andamento").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const form = evento.target;
  if (!validarFormulario(form)) return;
  const visita = agendados.find((a) => a.idAtendimento === Number(form.dataset.concluir));
  await enviarComBotao(form.querySelector('[type="submit"]'), async () => {
    await api.put(`/atendimentos/${visita.idAtendimento}`, { ...visita, status: "CONCLUIDO", dataExecucao: hoje(), observacao: form.elements.observacao.value.trim() || null });
    if (await carregar(false)) avisar("Problema marcado como resolvido.");
  });
});
$("andamento").addEventListener("click", async (evento) => {
  const botao = evento.target.closest("button");
  if (!botao) return;
  if (botao.hasAttribute("data-fechar")) {
    const voltar = botaoAberto;
    fecharPainel();
    voltar?.focus();
  }
  if (botao.dataset.confirmar) {
    const area = $("concluir-" + botao.dataset.confirmar);
    if (abrirPainel(area, botao)) area.querySelector("textarea").focus();
  }
  if (botao.dataset.abrirCancelar) abrirPainel($("cancelar-" + botao.dataset.abrirCancelar), botao);
  if (botao.dataset.cancelar) {
    const visita = agendados.find((a) => a.idAtendimento === Number(botao.dataset.cancelar));
    await enviarComBotao(botao, async () => {
      await api.put(`/atendimentos/${visita.idAtendimento}`, { ...visita, status: "CANCELADO" });
      if (await carregar(false)) avisar("Visita cancelada. O problema voltou para a fila.");
    });
  }
});
carregar();
