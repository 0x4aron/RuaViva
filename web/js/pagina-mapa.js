sessao.exigir("cidadao");
montarCabecalho(LINKS_CIDADAO("mapa"));
const mapa = criarMapa("mapa");
const camada = mapa ? L.layerGroup().addTo(mapa) : null;
const ligacoes = mapa ? L.layerGroup().addTo(mapa) : null;
let marcadores = [];
let ocorrencias = [], apoio, contagem = {}, filtro = "pendentes", pontosVisiveis = [];
function reposicionarMarcadores() {
  if (mapa && $("mapa").clientWidth) separarMarcadores(mapa, marcadores, ligacoes);
}
mapa?.on("zoomend", reposicionarMarcadores);
function ajustarMapa() {
  if (!mapa || !$("mapa").clientWidth) return;
  mapa.invalidateSize({ animate: false });
  if (pontosVisiveis.length) mapa.fitBounds(pontosVisiveis, { padding: [80, 80], maxZoom: 17, animate: false });
  reposicionarMarcadores();
}
function desenhar() {
  if (!apoio) return;
  const visiveis = ocorrencias.filter((o) => filtro === "todos" || (filtro === "pendentes" ? ["ABERTA", "EM_ANDAMENTO"].includes(o.status) : o.status === filtro));
  const termo = filtro === "pendentes" ? "não resolvidos" : filtro === "RESOLVIDA" ? "resolvidos" : "registrados";
  $("resumo").textContent = `${visiveis.length} ${visiveis.length === 1 ? "problema" : "problemas"} ${visiveis.length === 1 ? termo.replace("resolvidos", "resolvido").replace("registrados", "registrado") : termo} na Liberdade`;
  $("lista").innerHTML = visiveis.length ? visiveis.map((o, i) => linhaOcorrencia(o, apoio.categoria[o.idCategoria], contagem[o.idOcorrencia] || 0, i + 1)).join("") : '<li class="vazio">Nenhum problema nesta lista. <a href="registrar.html">Registrar um problema</a></li>';
  camada?.clearLayers();
  ligacoes?.clearLayers();
  marcadores = [];
  if (mapa) {
    marcadores = visiveis.map((o, i) => ({
      origem: L.latLng(o.latitude, o.longitude),
      marcador: marcadorOcorrencia(o, i + 1).bindPopup(`<strong>${esc(nomeExibido(apoio.categoria[o.idCategoria]?.nome))}</strong><br>${esc(endereco(o))}<br>${STATUS_TEXTO[o.status]}<br><a href="ocorrencia.html?id=${o.idOcorrencia}">Ver registro ${i + 1}</a>`).addTo(camada),
    }));
    pontosVisiveis = visiveis.map((o) => [o.latitude, o.longitude]);
    ajustarMapa();
  }
}
async function carregar() {
  limparAviso();
  $("lista").innerHTML = '<li class="carregando">Carregando…</li>';
  try {
    const [dados, lista, apoios] = await Promise.all([carregarApoio(), api.get("/ocorrencias"), api.get("/apoios")]);
    apoio = dados;
    ocorrencias = lista.filter((o) => chave(apoio.distrito[o.idDistrito]?.nome || "") === "liberdade");
    contagem = contarApoios(apoios);
    desenhar();
  } catch (erro) {
    $("lista").innerHTML = '<li class="vazio">Não foi possível carregar os problemas.</li>';
    $("resumo").textContent = "Problemas indisponíveis no momento.";
    erroComTentativa(erro, carregar);
  }
}
$("filtros").addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-filtro]");
  if (!botao) return;
  filtro = botao.dataset.filtro;
  $("filtros").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === botao)));
  desenhar();
});
$("alternancia").addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-vista]");
  if (!botao) return;
  $("alternancia").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === botao)));
  $("lista-painel").hidden = botao.dataset.vista !== "lista";
  $("mapa-painel").hidden = botao.dataset.vista !== "mapa";
  ajustarMapa();
});
window.addEventListener("resize", ajustarMapa);
carregar();
