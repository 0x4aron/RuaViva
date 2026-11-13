sessao.exigir("gestor");
montarCabecalho(LINKS_GESTOR("categorias"));
function marcarRegua() {
  $("regua").querySelectorAll("[data-peso]").forEach((botao) => botao.setAttribute("aria-pressed", String(botao.dataset.peso === $("peso").value)));
}
async function carregarTabela() {
  limparAviso();
  $("tabela-estado").innerHTML = `<span class="carregando">${icone("relogio")} Carregando categorias…</span>`;
  try {
    const categorias = await api.get("/categorias");
    $("tabela").innerHTML = categorias.sort((a, b) => b.pesoGravidade - a.pesoGravidade).map((c) => `<tr><td data-label="Categoria">${esc(nomeExibido(c.nome))}</td><td data-label="Peso">Peso ${c.pesoGravidade}</td><td data-label="Prazo">${textoPrazo(c.prazoDias)}</td><td data-label="Horas">${c.horasEstimadas} h</td></tr>`).join("");
    $("tabela-estado").innerHTML = categorias.length ? `${categorias.length} categorias cadastradas` : `<span class="vazio">${icone("info")} Nenhuma categoria cadastrada. Use o formulário para criar a primeira.</span>`;
    return true;
  } catch (erro) {
    $("tabela-estado").innerHTML = `<span class="vazio">${icone("alerta")} Categorias indisponíveis.</span>`;
    erroComTentativa(erro, carregarTabela);
    return false;
  }
}
async function carregarRegua() {
  try {
    const regua = await api.get("/categorias/regua-peso");
    $("regua").innerHTML = regua.map((r) => `<li><button type="button" data-peso="${r.peso}" aria-pressed="false"><span class="regua-peso">${r.peso}</span><span>${esc(nomeExibido(r.criterio))}<small>Ex.: ${esc(nomeExibido(r.exemplos))}</small></span></button></li>`).join("") || `<li class="vazio">${icone("info")} Sem sugestões disponíveis. Digite o peso abaixo.</li>`;
    marcarRegua();
    return true;
  } catch {
    $("regua").innerHTML = `<li class="vazio">${icone("alerta")} Sugestões indisponíveis. Você pode digitar o peso.<button class="botao-texto" type="button" id="tentar-regua">Tentar de novo</button></li>`;
    $("tentar-regua").addEventListener("click", async () => {
      $("tentar-regua").disabled = true;
      if (await carregarRegua()) focarTitulo($("regua"));
      else $("tentar-regua").focus();
    });
    return false;
  }
}
$("regua").addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-peso]");
  if (!botao) return;
  $("peso").value = botao.dataset.peso;
  marcarRegua();
});
$("peso").addEventListener("input", marcarRegua);
$("form").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparAviso();
  $("nome").value = $("nome").value.trim();
  if (!validarFormulario(evento.target)) return;
  await enviarComBotao($("cadastrar"), async () => {
    const criada = await api.post("/categorias", {
      nome: $("nome").value, descricao: $("descricao").value.trim() || null,
      prazoDias: Number($("prazo").value), pesoGravidade: Number($("peso").value), horasEstimadas: Number($("horas").value),
    });
    evento.target.reset();
    marcarRegua();
    if (await carregarTabela()) avisar(`Categoria “${nomeExibido(criada.nome)}” cadastrada. Os moradores já podem escolher essa opção.`);
  });
});
carregarTabela();
carregarRegua();
