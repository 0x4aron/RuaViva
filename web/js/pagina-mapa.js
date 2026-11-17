sessao.exigir("cidadao");
montarCabecalho(LINKS_CIDADAO("mapa"));
const mapa = criarMapa("mapa");
const camada = mapa ? L.layerGroup().addTo(mapa) : null;
const ligacoes = mapa ? L.layerGroup().addTo(mapa) : null;
let marcadores = [];
let ocorrencias = [], apoio, contagem = {}, filtro = "pendentes", pontosVisiveis = [];
let listaComMouse = null, listaComFoco = null, pinoComMouse = null, pinoComFoco = null;
function atualizarDestaques() {
  const idsAtivos = new Set([listaComMouse, listaComFoco, pinoComMouse, pinoComFoco].filter(Boolean).map(String));
  $("lista").querySelectorAll(".item[data-ocorrencia]").forEach((linha) => {
    linha.querySelector(".cobrir")?.classList.toggle("item-ativo", idsAtivos.has(linha.dataset.ocorrencia));
  });
  marcadores.forEach(({ id, marcador }) => {
    const ativo = idsAtivos.has(String(id));
    marcador.setZIndexOffset(ativo ? 1000 : 0);
    marcador.getElement()?.classList.toggle("pino-ativo", ativo);
  });
}
function linhaAlvo(alvo) {
  return alvo instanceof Element ? alvo.closest("#lista .item[data-ocorrencia]") : null;
}
function pinoAlvo(alvo) {
  return alvo instanceof Element ? alvo.closest(".leaflet-marker-icon[data-ocorrencia]") : null;
}
function contem(linha, alvo) {
  return alvo instanceof Node && linha.contains(alvo);
}
$("lista").addEventListener("pointerover", (evento) => {
  const linha = linhaAlvo(evento.target);
  if (!linha || contem(linha, evento.relatedTarget)) return;
  listaComMouse = linha.dataset.ocorrencia;
  atualizarDestaques();
});
$("lista").addEventListener("pointerout", (evento) => {
  const linha = linhaAlvo(evento.target);
  if (!linha || contem(linha, evento.relatedTarget)) return;
  listaComMouse = null;
  atualizarDestaques();
});
$("lista").addEventListener("focusin", (evento) => {
  const linha = linhaAlvo(evento.target);
  if (!linha) return;
  listaComFoco = linha.dataset.ocorrencia;
  atualizarDestaques();
});
$("lista").addEventListener("focusout", (evento) => {
  const linha = linhaAlvo(evento.target);
  if (!linha || contem(linha, evento.relatedTarget)) return;
  listaComFoco = null;
  atualizarDestaques();
});
if (mapa) {
  const areaMapa = $("mapa");
  areaMapa.addEventListener("pointerover", (evento) => {
    const pino = pinoAlvo(evento.target);
    if (!pino || contem(pino, evento.relatedTarget)) return;
    pinoComMouse = pino.dataset.ocorrencia;
    atualizarDestaques();
  });
  areaMapa.addEventListener("pointerout", (evento) => {
    const pino = pinoAlvo(evento.target);
    if (!pino || contem(pino, evento.relatedTarget)) return;
    pinoComMouse = null;
    atualizarDestaques();
  });
  areaMapa.addEventListener("focusin", (evento) => {
    const pino = pinoAlvo(evento.target);
    if (!pino) return;
    pinoComFoco = pino.dataset.ocorrencia;
    atualizarDestaques();
  });
  areaMapa.addEventListener("focusout", (evento) => {
    const pino = pinoAlvo(evento.target);
    if (!pino || contem(pino, evento.relatedTarget)) return;
    pinoComFoco = null;
    atualizarDestaques();
  });
}
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
  listaComMouse = listaComFoco = pinoComMouse = pinoComFoco = null;
  const visiveis = ocorrencias.filter((o) => filtro === "todos" || (filtro === "pendentes" ? ["ABERTA", "EM_ANDAMENTO"].includes(o.status) : o.status === filtro));
  const termo = filtro === "pendentes" ? "não resolvidos" : filtro === "RESOLVIDA" ? "resolvidos" : "registrados";
  $("resumo").textContent = `${visiveis.length} ${visiveis.length === 1 ? "problema" : "problemas"} ${visiveis.length === 1 ? termo.replace("resolvidos", "resolvido").replace("registrados", "registrado") : termo} na Liberdade`;
  $("lista").innerHTML = visiveis.length ? visiveis.map((o, i) => linhaOcorrencia(o, apoio.categoria[o.idCategoria], contagem[o.idOcorrencia] || 0, i + 1)).join("") : `<li class="vazio">${icone("info")} Nenhum problema nesta lista. <a href="registrar.html">Registrar um problema</a></li>`;
  camada?.clearLayers();
  ligacoes?.clearLayers();
  marcadores = [];
  if (mapa) {
    marcadores = visiveis.map((o, i) => {
      const marcador = marcadorOcorrencia(o, i + 1)
        .bindPopup(`<strong>${esc(nomeExibido(apoio.categoria[o.idCategoria]?.nome))}</strong><br>${esc(endereco(o))}<br><a href="ocorrencia.html?id=${o.idOcorrencia}">Ver registro</a>`)
        .addTo(camada);
      const elemento = marcador.getElement();
      if (elemento) elemento.dataset.ocorrencia = String(o.idOcorrencia);
      return { id: o.idOcorrencia, origem: L.latLng(o.latitude, o.longitude), marcador };
    });
    pontosVisiveis = visiveis.map((o) => [o.latitude, o.longitude]);
    ajustarMapa();
  }
  atualizarDestaques();
}
async function carregar() {
  limparAviso();
  $("lista").innerHTML = esqueletoListaHTML();
  try {
    const [dados, lista, apoios] = await Promise.all([carregarApoio(), api.get("/ocorrencias"), api.get("/apoios")]);
    apoio = dados;
    ocorrencias = lista.filter((o) => chave(apoio.distrito[o.idDistrito]?.nome || "") === "liberdade");
    contagem = contarApoios(apoios);
    desenhar();
  } catch (erro) {
    $("lista").innerHTML = `<li class="vazio">${icone("alerta")} Não foi possível carregar os problemas.</li>`;
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
