const usuario = sessao.exigir("cidadao");
montarCabecalho(LINKS_CIDADAO("minhas"));
$("buscar-registro").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparErros(evento.target);
  if (!validarFormulario(evento.target)) return;
  const id = Number($("numero-registro").value);
  if (!Number.isSafeInteger(id) || id < 1) {
    erroCampo($("numero-registro"), "Digite um número de registro válido.");
    avisar("Confira o número do registro.", "erro");
    return;
  }
  await enviarComBotao($("acompanhar-registro"), async () => {
    try {
      await api.get(`/ocorrencias/${id}`);
    } catch (erro) {
      if (erro.status !== 404) throw erro;
      erroCampo($("numero-registro"), `Não encontramos o registro nº ${String(id).padStart(4, "0")}. Confira o número.`);
      $("numero-registro").focus();
      return;
    }
    location.href = `ocorrencia.html?id=${id}`;
  });
});
async function carregar() {
  limparAviso();
  $("lista").innerHTML = $("apoiados").innerHTML = '<li class="carregando">Carregando…</li>';
  try {
    const [apoio, ocorrencias, apoios] = await Promise.all([carregarApoio(), api.get("/ocorrencias"), api.get("/apoios")]);
    const contagem = contarApoios(apoios);
    const minhas = ocorrencias.filter((o) => o.idCidadao === usuario.idCidadao).sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura));
    const ids = new Set(apoios.filter((a) => a.idCidadao === usuario.idCidadao).map((a) => a.idOcorrencia));
    const apoiadas = ocorrencias.filter((o) => ids.has(o.idOcorrencia));
    const linha = (o) => linhaOcorrencia(o, apoio.categoria[o.idCategoria], contagem[o.idOcorrencia] || 0, null, true);
    $("lista").innerHTML = minhas.length ? minhas.map(linha).join("") : '<li class="vazio">Você ainda não registrou nenhum problema. <a href="registrar.html">Registrar agora</a></li>';
    $("apoiados").innerHTML = apoiadas.length ? apoiadas.map(linha).join("") : '<li class="vazio">Você ainda não apoiou nenhum registro. <a href="mapa.html">Ver problemas no bairro</a></li>';
  } catch (erro) {
    $("lista").innerHTML = $("apoiados").innerHTML = '<li class="vazio">Não foi possível carregar os registros.</li>';
    erroComTentativa(erro, carregar);
  }
}
if (usuario) carregar();
