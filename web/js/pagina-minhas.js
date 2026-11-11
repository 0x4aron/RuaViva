const usuario = sessao.exigir("cidadao");
montarCabecalho(LINKS_CIDADAO("minhas"));
async function carregar() {
  limparAviso();
  $("lista").innerHTML = $("apoiados").innerHTML = '<li class="carregando">Carregando…</li>';
  try {
    const [apoio, ocorrencias, apoios] = await Promise.all([carregarApoio(), api.get("/ocorrencias"), api.get("/apoios")]);
    const contagem = contarApoios(apoios);
    const minhas = ocorrencias.filter((o) => o.idCidadao === usuario.idCidadao).sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura));
    const ids = new Set(apoios.filter((a) => a.idCidadao === usuario.idCidadao).map((a) => a.idOcorrencia));
    const apoiadas = ocorrencias.filter((o) => ids.has(o.idOcorrencia));
    const linha = (o) => linhaOcorrencia(o, apoio.categoria[o.idCategoria], contagem[o.idOcorrencia] || 0);
    $("lista").innerHTML = minhas.length ? minhas.map(linha).join("") : '<li class="vazio">Você ainda não registrou nenhum problema. <a href="registrar.html">Registrar agora</a></li>';
    $("apoiados").innerHTML = apoiadas.length ? apoiadas.map(linha).join("") : '<li class="vazio">Você ainda não apoiou nenhum registro. <a href="mapa.html">Ver problemas no bairro</a></li>';
  } catch (erro) {
    $("lista").innerHTML = $("apoiados").innerHTML = '<li class="vazio">Não foi possível carregar os registros.</li>';
    erroComTentativa(erro, carregar);
  }
}
if (usuario) carregar();
