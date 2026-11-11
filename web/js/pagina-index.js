let cidadaos = [];
async function carregarMoradores() {
  limparAviso();
  $("cidadao").disabled = true;
  $("entrar-morador").disabled = true;
  $("cidadao").innerHTML = '<option value="">Carregando moradores…</option>';
  try {
    cidadaos = await api.get("/cidadaos");
    $("cidadao").innerHTML = '<option value="">Escolha um morador</option>' + cidadaos.map((c) => `<option value="${c.idCidadao}">${esc(nomeExibido(c.nome))}${c.prioritario ? " (atendimento prioritário)" : ""}</option>`).join("");
    $("cidadao").disabled = !cidadaos.length;
    $("entrar-morador").disabled = !cidadaos.length;
    if (!cidadaos.length) avisar("Nenhum morador cadastrado na demonstração. Você ainda pode entrar como gestor.", "info");
  } catch (erro) {
    $("cidadao").innerHTML = '<option value="">Moradores indisponíveis</option>';
    erroComTentativa(erro, carregarMoradores);
  }
}
$("form-morador").addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!validarFormulario(evento.target)) return;
  const cidadao = cidadaos.find((c) => String(c.idCidadao) === $("cidadao").value);
  if (cidadao && sessao.salvar({ perfil: "cidadao", idCidadao: cidadao.idCidadao, nome: nomeExibido(cidadao.nome) })) location.href = "mapa.html";
});
$("entrar-gestor").addEventListener("click", () => {
  if (sessao.salvar({ perfil: "gestor" })) location.href = "gestor.html";
});
carregarMoradores();
