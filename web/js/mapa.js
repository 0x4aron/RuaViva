// Funcoes do mapa (Leaflet + OpenStreetMap), usadas nas paginas com mapa.

const COR_STATUS = {
  ABERTA: "#c8102e",
  EM_ANDAMENTO: "#d9a400",
  RESOLVIDA: "#1e7d4f",
  CANCELADA: "#6b7a82",
};

function criarMapa(idElemento, centro = CONFIG.MAPA_CENTRO, zoom = CONFIG.MAPA_ZOOM) {
  // scrollWheelZoom desligado: a rodinha do mouse rola a pagina, e o zoom fica nos botoes + e -
  const mapa = L.map(idElemento, { scrollWheelZoom: false }).setView(centro, zoom);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapa);
  return mapa;
}

// Bolinha colorida pelo status da ocorrencia
function marcadorOcorrencia(o) {
  return L.circleMarker([o.latitude, o.longitude], {
    radius: 10,
    color: "#ffffff",
    weight: 3,
    fillColor: COR_STATUS[o.status],
    fillOpacity: 1,
  });
}
