const usuario = sessao.exigir("cidadao");
montarCabecalho(LINKS_CIDADAO("registrar"));
const mapa = criarMapa("mapa");
let apoio, pendentes = [], apoios = [], contagem = {};
let passo = 1, local = null, marcador = null, resultados = [];
let esperaReversa, versaoLocal = 0, avisoRascunho = false;
const chaveRascunho = `ruaviva-rascunho-${usuario?.idCidadao}`;

function categoriaEscolhida() { return document.querySelector('input[name="categoria"]:checked'); }
function salvarRascunho() {
  if (!apoio) return;
  const dados = { categoria: categoriaEscolhida()?.value, local, passo,
    logradouro: $("logradouro").value, numero: $("numero").value,
    distrito: $("distrito").value, descricao: $("descricao").value,
    busca: $("busca-endereco").value, confirmacao: $("local-escolhido").textContent };
  try { sessionStorage.setItem(chaveRascunho, JSON.stringify(dados)); }
  catch {
    if (!avisoRascunho) {
      avisoRascunho = true;
      avisar("O navegador bloqueou o rascunho. Se sair desta página, os dados não serão guardados.", "info");
    }
  }
}
function restaurarRascunho() {
  let dados;
  try { dados = JSON.parse(sessionStorage.getItem(chaveRascunho)); }
  catch { return; }
  if (!dados) return;
  document.querySelectorAll('input[name="categoria"]').forEach((campo) => { campo.checked = campo.value === dados.categoria; });
  ["logradouro", "numero", "distrito", "descricao"].forEach((id) => { $(id).value = dados[id] || ""; });
  $("busca-endereco").value = dados.busca || "";
  if (dados.local && Number.isFinite(dados.local.lat) && Number.isFinite(dados.local.lng)) {
    marcar(dados.local.lat, dados.local.lng, false);
    $("local-escolhido").textContent = dados.confirmacao || textoCoordenadas();
  }
  mostrarPasso(Math.min(3, Math.max(1, Number(dados.passo) || 1)), false);
  atualizarContador();
}
function textoCoordenadas() {
  return `Local escolhido: ponto marcado no mapa, perto de ${local.lat.toFixed(4).replace(".", ",")}, ${local.lng.toFixed(4).replace(".", ",")}.`;
}
function marcar(lat, lng, buscar = true) {
  local = { lat, lng };
  versaoLocal++;
  clearTimeout(esperaReversa);
  if (mapa) {
    if (marcador) marcador.setLatLng(local);
    else marcador = L.marker(local, { draggable: true, icon: iconeMarcador("LOCAL", "1"), title: "Local escolhido. Arraste para ajustar." }).addTo(mapa)
      .on("dragend", (evento) => { const ponto = evento.target.getLatLng(); marcar(ponto.lat, ponto.lng); });
  }
  if (buscar) {
    $("logradouro").value = "";
    $("numero").value = "";
  }
  $("local-escolhido").textContent = textoCoordenadas();
  verificarParecidas();
  salvarRascunho();
  if (buscar) {
    const versao = versaoLocal;
    esperaReversa = setTimeout(() => buscarReverso(versao), 600);
  }
}
function preencherEndereco(resultado) {
  const endereco = enderecoGeografico(resultado);
  $("logradouro").value = nomeProprio(endereco.logradouro).slice(0, 120);
  $("numero").value = endereco.numero.slice(0, 10);
  $("local-escolhido").textContent = endereco.logradouro
    ? `Local escolhido: ${nomeProprio(endereco.logradouro)}${endereco.numero ? ", " + endereco.numero : ""} — ${nomeProprio(endereco.bairro)}`
    : textoCoordenadas();
  salvarRascunho();
}
async function buscarReverso(versao) {
  const ponto = { ...local };
  try {
    const resultado = await geocodificar("reverse", { lat: String(ponto.lat), lon: String(ponto.lng) });
    if (versao === versaoLocal) preencherEndereco(resultado);
  } catch {
    if (versao !== versaoLocal) return;
    $("local-escolhido").textContent = textoCoordenadas() + " Endereço indisponível; informe a rua abaixo.";
    salvarRascunho();
  }
}
async function buscarEndereco() {
  limparErros($("form"));
  const consulta = $("busca-endereco").value.trim();
  if (!consulta) {
    erroCampo($("busca-endereco"), "Informe a rua e o número para buscar.");
    return avisar("Informe o endereço que deseja buscar.", "erro");
  }
  const botao = $("buscar-endereco");
  botao.disabled = true;
  botao.textContent = "Buscando…";
  $("busca-estado").textContent = "Buscando endereço…";
  $("resultados-grupo").hidden = true;
  try {
    resultados = await geocodificar("search", { q: consulta, limit: "5" });
    $("resultados").innerHTML = resultados.map((r, i) => `<label class="opcao"><input type="radio" name="endereco-buscado" value="${i}"><span>${esc(nomeProprio(r.display_name))}</span></label>`).join("");
    $("resultados-grupo").hidden = !resultados.length;
    $("busca-estado").textContent = resultados.length ? (resultados.length === 1 ? "1 endereço encontrado. Confira e escolha." : `${resultados.length} endereços encontrados. Escolha uma opção.`) : "Nenhum endereço encontrado. Confira a rua ou marque o ponto no mapa.";
  } catch {
    avisar("Não foi possível buscar o endereço. Tente de novo ou marque o ponto no mapa.", "erro");
    $("busca-estado").textContent = "Não foi possível buscar. Tente de novo em Buscar endereço ou marque o ponto no mapa.";
  } finally {
    botao.disabled = false;
    botao.textContent = "Buscar endereço";
  }
}
function verificarParecidas() {
  const area = $("parecidas");
  const categoria = categoriaEscolhida()?.value;
  if (!local || !categoria || !apoio) { area.hidden = true; return; }
  const perto = pendentes.filter((o) => String(o.idCategoria) === categoria && distancia(local, { lat: o.latitude, lng: o.longitude }) <= 60);
  area.hidden = !perto.length;
  if (!perto.length) return;
  area.className = "bloco";
  area.innerHTML = `<h3>Alguém já registrou isso?</h3><p>Há um problema da mesma categoria a até 60 m. Se for o mesmo, você pode apoiar o registro existente.</p>
    <ul class="lista">${perto.map((o) => linhaOcorrencia(o, apoio.categoria[o.idCategoria], contagem[o.idOcorrencia] || 0)).join("")}</ul>
    ${perto.map((o) => {
      const meuApoio = apoios.some((a) => a.idOcorrencia === o.idOcorrencia && a.idCidadao === usuario.idCidadao);
      if (o.idCidadao === usuario.idCidadao) return '<p>Você já registrou este problema.</p>';
      if (meuApoio) return '<p>Você já apoiou este problema.</p>';
      return `<button type="button" class="botao" data-apoiar="${o.idOcorrencia}">Apoiar este em vez de registrar<span class="visualmente-oculto">: ${esc(endereco(o))}</span></button>`;
    }).join("")}`;
}
function validarPasso() {
  limparErros($("form"));
  if (passo === 1 && !categoriaEscolhida()) {
    const primeiro = document.querySelector('input[name="categoria"]');
    if (primeiro) erroCampo(primeiro, "Escolha uma categoria.");
    avisar("Escolha qual é o problema.", "erro");
    return false;
  }
  if (passo === 2) {
    const erros = [];
    if (!local) { erroCampo($("marcar-centro"), "Marque o local no mapa ou escolha um endereço."); erros.push("Escolha o local do problema."); }
    ["logradouro", "distrito"].forEach((id) => {
      const campo = $(id);
      if (!campo.value.trim()) { erroCampo(campo, id === "logradouro" ? "Informe a rua." : "Escolha o bairro."); erros.push("Confira o endereço informado."); }
    });
    if (erros.length) { avisar("Falta pouco para continuar:", "erro", [...new Set(erros)]); return false; }
  }
  return true;
}
function atualizarResumo() {
  const categoria = apoio?.categoria[categoriaEscolhida()?.value];
  $("resumo-registro").innerHTML = `<p><strong>${esc(nomeExibido(categoria?.nome))}</strong></p>${placaDeRua({ logradouro: $("logradouro").value, numero: $("numero").value })}
    <p>${esc(nomeProprio(apoio?.distrito[$("distrito").value]?.nome))}</p>
    <p>${esc($("descricao").value.trim() || "Sem descrição adicional. Será enviado o nome da categoria como descrição.")}</p>`;
}
function mostrarPasso(numero, focar = true) {
  passo = numero;
  [1, 2, 3].forEach((n) => {
    $("passo-" + n).hidden = n !== passo;
    if (n === passo) $("etapa-" + n).setAttribute("aria-current", "step");
    else $("etapa-" + n).removeAttribute("aria-current");
  });
  $("passo-atual").textContent = `Passo ${passo} de 3`;
  $("voltar").hidden = passo === 1;
  $("continuar").hidden = passo === 3;
  $("enviar").hidden = passo !== 3;
  if (passo === 2) mapa?.invalidateSize({ animate: false });
  if (passo === 3) atualizarResumo();
  if (focar) $("titulo-passo-" + passo).focus();
  salvarRascunho();
}
function atualizarContador() {
  $("contador").textContent = `${$("descricao").value.length} de 500 caracteres`;
  if (passo === 3) atualizarResumo();
}
async function carregar() {
  limparAviso();
  $("continuar").disabled = true;
  try {
    const [dados, ocorrencias, todosApoios] = await Promise.all([carregarApoio(), api.get("/ocorrencias"), api.get("/apoios")]);
    apoio = dados;
    pendentes = ocorrencias.filter((o) => ["ABERTA", "EM_ANDAMENTO"].includes(o.status));
    apoios = todosApoios;
    contagem = contarApoios(apoios);
    $("categorias").innerHTML = apoio.categorias.map((c) => {
      const visual = categoriaVisual(c);
      return `<label class="opcao"><input id="categoria-${c.idCategoria}" type="radio" name="categoria" value="${c.idCategoria}" aria-describedby="exemplo-${c.idCategoria}"><span>${icone(visual.icone)}<span>${esc(nomeExibido(c.nome))}</span><small id="exemplo-${c.idCategoria}">${esc(visual.exemplo)}</small></span></label>`;
    }).join("") || '<p>Nenhuma categoria disponível para registro.</p>';
    $("distrito").innerHTML = '<option value="">Escolha o bairro</option>' + apoio.distritos.map((d) => `<option value="${d.idDistrito}" ${chave(d.nome) === "liberdade" ? "selected" : ""}>${esc(nomeProprio(d.nome))}</option>`).join("");
    $("continuar").disabled = !apoio.categorias.length || !apoio.distritos.length;
    restaurarRascunho();
    verificarParecidas();
  } catch (erro) {
    $("categorias").innerHTML = '<p>Não foi possível carregar as categorias.</p>';
    erroComTentativa(erro, carregar);
  }
}

mapa?.on("click", (evento) => marcar(evento.latlng.lat, evento.latlng.lng));
if (mapa) {
  const mira = document.createElement("span");
  mira.className = "mira";
  mira.innerHTML = icone("alvo");
  $("mapa").append(mira);
}
$("marcar-centro").disabled = !mapa;
$("marcar-centro").addEventListener("click", () => { const centro = mapa.getCenter(); marcar(centro.lat, centro.lng); });
$("buscar-endereco").addEventListener("click", buscarEndereco);
$("busca-endereco").addEventListener("keydown", (evento) => { if (evento.key === "Enter") evento.preventDefault(); });
$("resultados").addEventListener("change", (evento) => {
  const resultado = resultados[Number(evento.target.value)];
  if (!resultado) return;
  marcar(Number(resultado.lat), Number(resultado.lon), false);
  preencherEndereco(resultado);
  mapa?.setView(local, 18, { animate: false });
});
$("minha-localizacao").addEventListener("click", () => {
  if (!navigator.geolocation) return avisar("Seu navegador não informa a localização. Busque o endereço ou marque no mapa.", "erro");
  const botao = $("minha-localizacao");
  botao.disabled = true;
  botao.textContent = "Localizando…";
  navigator.geolocation.getCurrentPosition((posicao) => {
    marcar(posicao.coords.latitude, posicao.coords.longitude);
    mapa?.setView(local, 18, { animate: false });
    botao.disabled = false;
    botao.textContent = "Usar minha localização";
  }, () => {
    botao.disabled = false;
    botao.textContent = "Usar minha localização";
    avisar("Não conseguimos sua localização. Busque o endereço ou marque o ponto no mapa.", "erro");
  }, { timeout: 12000 });
});
$("categorias").addEventListener("change", () => { verificarParecidas(); salvarRascunho(); });
$("form").addEventListener("input", salvarRascunho);
$("descricao").addEventListener("input", atualizarContador);
["logradouro", "numero"].forEach((id) => $(id).addEventListener("input", () => {
  // Uma correção manual não deve ser sobrescrita pela busca em andamento.
  versaoLocal++;
  clearTimeout(esperaReversa);
  if (local) $("local-escolhido").textContent = $("logradouro").value.trim() ? `Local escolhido: ${endereco({ logradouro: $("logradouro").value, numero: $("numero").value })} — ${nomeProprio(apoio?.distrito[$("distrito").value]?.nome)}` : textoCoordenadas();
  salvarRascunho();
}));
$("continuar").addEventListener("click", () => { if (validarPasso()) { limparAviso(); mostrarPasso(passo + 1); } });
$("voltar").addEventListener("click", () => mostrarPasso(passo - 1));
$("parecidas").addEventListener("click", async (evento) => {
  salvarRascunho();
  const botao = evento.target.closest("[data-apoiar]");
  if (!botao) return;
  await enviarComBotao(botao, async () => {
    await api.post("/apoios", { idOcorrencia: Number(botao.dataset.apoiar), idCidadao: usuario.idCidadao });
    location.href = `ocorrencia.html?id=${botao.dataset.apoiar}`;
  });
});
$("form").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (passo !== 3) return;
  const categoria = categoriaEscolhida();
  if (!categoria || !local || !$("logradouro").value.trim() || !$("distrito").value) return avisar("Confira a categoria e o endereço nos passos anteriores.", "erro");
  salvarRascunho();
  await enviarComBotao($("enviar"), async () => {
    const criada = await api.post("/ocorrencias", {
      idCidadao: usuario.idCidadao, idCategoria: Number(categoria.value), idDistrito: Number($("distrito").value),
      // A API exige descrição; o nome da categoria resume o registro sem texto adicional.
      descricao: $("descricao").value.trim() || nomeExibido(apoio.categoria[categoria.value].nome),
      logradouro: $("logradouro").value.trim(), numero: $("numero").value.trim() || null,
      latitude: local.lat, longitude: local.lng,
    });
    clearTimeout(esperaReversa);
    versaoLocal++;
    try { sessionStorage.removeItem(chaveRascunho); } catch { /* O envio já foi concluído. */ }
    limparAviso();
    $("registro").hidden = true;
    $("titulo-pagina").textContent = "Problema registrado";
    $("confirmacao").innerHTML = `${placaDeRua(criada, true)}<h2>O que acontece agora</h2><p>Seu registro entrou na fila da subprefeitura. Você acompanha o atendimento em Meus registros.</p><div class="acoes"><a class="botao botao-principal" href="ocorrencia.html?id=${criada.idOcorrencia}">Acompanhar este registro</a><a class="botao" href="minhas.html">Meus registros</a></div>`;
    $("confirmacao").hidden = false;
    $("titulo-pagina").setAttribute("tabindex", "-1");
    $("titulo-pagina").focus();
  });
});
window.addEventListener("pagehide", () => { if (!$("registro").hidden) salvarRascunho(); });
if (usuario) carregar();
