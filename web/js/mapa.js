// Leaflet 1.9.4 e OpenStreetMap.
const COR_STATUS = { ABERTA: "#C8102E", EM_ANDAMENTO: "#7A5C00", RESOLVIDA: "#1E7D4F", CANCELADA: "#4A5961" };
function criarMapa(idElemento, centro = CONFIG.MAPA_CENTRO, zoom = CONFIG.MAPA_ZOOM) {
  if (!window.L) {
    $(idElemento).innerHTML = '<p class="vazio">Mapa indisponível. Confira sua conexão e recarregue a página.</p>';
    return null;
  }
  const mapa = L.map(idElemento, { scrollWheelZoom: false, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false }).setView(centro, zoom);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapa);
  mapa.zoomControl.setPosition("topleft");
  mapa.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
  $(idElemento).querySelector(".leaflet-control-zoom-in").innerHTML = icone("mais");
  $(idElemento).querySelector(".leaflet-control-zoom-out").innerHTML = icone("menos");
  mapa.on("popupopen", (evento) => {
    const fechar = evento.popup.getElement().querySelector(".leaflet-popup-close-button");
    if (fechar) {
      fechar.innerHTML = icone("fechar");
      fechar.setAttribute("aria-label", "Fechar detalhes do ponto");
    }
  });
  $(idElemento).querySelector(".leaflet-control-zoom-in").setAttribute("aria-label", "Aproximar mapa");
  $(idElemento).querySelector(".leaflet-control-zoom-out").setAttribute("aria-label", "Afastar mapa");
  return mapa;
}
function iconeMarcador(status, numero) {
  return L.divIcon({ className: "pino", html: `<span style="--cor:${COR_STATUS[status] || "#1A4D8F"}">${esc(numero)}</span>`, iconSize: [36, 36], iconAnchor: [18, 36] });
}
function marcadorOcorrencia(o, numero = 1) {
  return L.marker([o.latitude, o.longitude], { icon: iconeMarcador(o.status, numero), title: `${numero}. ${endereco(o)} — ${STATUS_TEXTO[o.status]}`, alt: `${numero}. ${endereco(o)}` });
}
// Projeta sempre as coordenadas originais: o deslocamento não se acumula no zoom.
function separarMarcadores(mapa, entradas, ligacoes) {
  ligacoes.clearLayers();
  const pontos = entradas.map(({ origem }) => mapa.latLngToLayerPoint(origem));
  const grupos = pontos.map((_, i) => [i]);
  const distribuir = (grupo) => {
    if (grupo.length === 1) return [pontos[grupo[0]]];
    const centro = grupo.reduce((soma, i) => soma.add(pontos[i]), L.point(0, 0)).divideBy(grupo.length);
    const arco = grupo.length <= 5 ? Math.PI : 2 * Math.PI;
    const passo = arco / (grupo.length <= 5 ? grupo.length - 1 : grupo.length);
    const raio = Math.max(44, 44 / (2 * Math.sin(passo / 2)));
    return grupo.map((_, i) => centro.add(L.point(Math.cos(-Math.PI + i * passo) * raio, Math.sin(-Math.PI + i * passo) * raio)));
  };
  // 40 px também protege a borda dos pinos de 36 px. Une grupos se o leque
  // alcançar outro pino, inclusive quando três ou mais endereços coincidem.
  let mudou = true;
  while (mudou) {
    mudou = false;
    const posicoes = grupos.map(distribuir);
    for (let a = 0; a < grupos.length && !mudou; a++) {
      for (let b = a + 1; b < grupos.length; b++) {
        const proximos = grupos[a].some((i) => grupos[b].some((j) => pontos[i].distanceTo(pontos[j]) < 40));
        const sobrepostos = posicoes[a].some((p) => posicoes[b].some((q) => p.distanceTo(q) < 40));
        if (proximos || sobrepostos) {
          grupos[a] = grupos[a].concat(grupos[b]).sort((i, j) => i - j);
          grupos.splice(b, 1);
          mudou = true;
          break;
        }
      }
    }
  }
  grupos.forEach((grupo) => distribuir(grupo).forEach((ponto, indice) => {
    const { marcador, origem } = entradas[grupo[indice]];
    const destino = mapa.layerPointToLatLng(ponto);
    marcador.setLatLng(destino);
    if (grupo.length > 1) L.polyline([origem, destino], {
      color: "#4A5961", weight: 1, opacity: .7, interactive: false,
    }).addTo(ligacoes);
  }));
}
function distancia(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(h));
}
// A busca é limitada à região da Liberdade. Não há busca enquanto se digita.
const REGIAO_LIBERDADE = { oeste: -46.65, norte: -23.548, leste: -46.619, sul: -23.58 };
async function geocodificar(rota, parametros) {
  const regiao = REGIAO_LIBERDADE;
  const busca = new URLSearchParams({ format: "jsonv2", "accept-language": "pt-BR", countrycodes: "br", bounded: "1",
    viewbox: `${regiao.oeste},${regiao.norte},${regiao.leste},${regiao.sul}`, addressdetails: "1", ...parametros });
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 12000);
  try {
    const resposta = await fetch(`https://nominatim.openstreetmap.org/${rota}?${busca}`, { signal: controle.signal });
    if (!resposta.ok) throw new Error("Serviço de endereço indisponível.");
    const dados = await resposta.json();
    if (dados.error) throw new Error(dados.error);
    return dados;
  } finally { clearTimeout(limite); }
}
function enderecoGeografico(resultado) {
  const a = resultado.address || {};
  return { logradouro: nomeProprio(a.road || a.pedestrian || a.footway || ""), numero: a.house_number || "", bairro: nomeProprio(a.suburb || a.city_district || "Liberdade") };
}
