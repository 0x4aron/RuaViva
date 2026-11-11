sessao.exigir("gestor");
montarCabecalho(LINKS_GESTOR("categorias"));
function marcarRegua() {
  $("regua").querySelectorAll("[data-peso]").forEach((botao) => botao.setAttribute("aria-pressed", String(botao.dataset.peso === $("peso").value)));
}
async function carregarTabela() {
  limparAviso();
  $("tabela-estado").textContent = "Carregando categorias…";
  try {
    const categorias = await api.get("/categorias");
    $("tabela").innerHTML = categorias.sort((a, b) => b.pesoGravidade - a.pesoGravidade).map((c) => `<tr><td data-label="Categoria">${esc(nomeExibido(c.nome))}</td><td data-label="Peso">Peso ${c.pesoGravidade}</td><td data-label="Prazo">${c.prazoDias} dias</td><td data-label="Horas">${c.horasEstimadas} h</td></tr>`).join("");
    $("tabela-estado").textContent = categorias.length ? `${categorias.length} categorias cadastradas` : "Nenhuma categoria cadastrada. Use o formulário para criar a primeira.";
    return true;
  } catch (erro) {
    $("tabela-estado").textContent = "Categorias indisponíveis.";
    erroComTentativa(erro, carregarTabela);
    return false;
  }
}
async function carregarRegua() {
  try {
    const regua = await api.get("/categorias/regua-peso");
    $("regua").innerHTML = regua.map((r) => `<li><button type="button" data-peso="${r.peso}" aria-pressed="false"><span class="regua-peso">${r.peso}</span><span>${esc(nomeExibido(r.criterio))}<small>Ex.: ${esc(nomeExibido(r.exemplos))}</small></span></button></li>`).join("") || '<li>Sem sugestões disponíveis. Digite o peso abaixo.</li>';
    marcarRegua();
  } catch {
    $("regua").innerHTML = '<li>Sugestões indisponíveis. Você pode digitar o peso.<button class="botao-texto" type="button" id="tentar-regua">Tentar de novo</button></li>';
    $("tentar-regua").addEventListener("click", carregarRegua);
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
