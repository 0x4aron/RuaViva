const $ = (id) => document.getElementById(id);
const sessao = {
  ler() {
    try { return JSON.parse(localStorage.getItem("sessao")) || null; }
    catch { return null; }
  },
  salvar(dados) {
    try {
      localStorage.setItem("sessao", JSON.stringify(dados));
      return true;
    } catch {
      avisar("O navegador bloqueou o armazenamento. Permita o armazenamento neste navegador para continuar.", "erro");
      return false;
    }
  },
  sair() {
    try {
      localStorage.removeItem("sessao");
      location.href = "index.html";
    } catch {
      avisar("O navegador bloqueou o armazenamento. Não foi possível trocar o perfil.", "erro");
    }
  },
  exigir(perfil) {
    const usuario = this.ler();
    if (!usuario || usuario.perfil !== perfil) {
      location.replace("index.html");
      return null;
    }
    return usuario;
  },
};

const STATUS_TEXTO = { ABERTA: "Aberto", EM_ANDAMENTO: "Em andamento", RESOLVIDA: "Resolvido", CANCELADA: "Cancelado" };
const LINKS_CIDADAO = (atual) => [
  { href: "mapa.html", texto: "Bairro", atual: atual === "mapa" },
  { href: "registrar.html", texto: "Registrar", atual: atual === "registrar" },
  { href: "minhas.html", texto: "Meus registros", curto: "Meus", atual: atual === "minhas" },
];
const LINKS_GESTOR = (atual) => [
  { href: "gestor.html", texto: "Fila de trabalho", atual: atual === "fila" },
  { href: "categorias.html", texto: "Categorias", atual: atual === "categorias" },
];

function esc(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (letra) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[letra]);
}

function nomeExibido(texto) {
  if (String(texto).toUpperCase() === "SE") return "Sé";
  const palavras = {
    barao: "Barão", remocao: "Remoção", calcada: "Calçada", calcadas: "Calçadas",
    varricao: "Varrição", publica: "pública", publico: "público",
    republica: "República", sao: "São", joao: "João", jose: "José",
  };
  return String(texto ?? "").replace(/\b(Barao|Remocao|Calcada|Calcadas|Varricao|Publica|Publico|Republica|Sao|Joao|Jose)\b/gi,
    (palavra) => palavras[palavra.toLowerCase()]);
}
function chave(texto) {
  return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function nomeProprio(texto) {
  return nomeExibido(texto).toLocaleLowerCase("pt-BR").replace(/\p{L}+/gu, (palavra, indice) =>
    indice > 0 && ["de", "da", "do", "dos", "das", "e"].includes(palavra)
      ? palavra : palavra[0].toLocaleUpperCase("pt-BR") + palavra.slice(1));
}
function icone(nome) {
  return `<svg class="icone" aria-hidden="true" focusable="false"><use href="img/icones.svg#${nome}"></use></svg>`;
}
function iconeCategoria(nome, tamanho = "lista") {
  return `<span class="icone-categoria icone-categoria-${tamanho}">${icone(nome)}</span>`;
}
function categoriaVisual(categoria) {
  const nome = chave(categoria?.nome || "");
  const tipos = [
    ["buraco", "buraco", "buraco no asfalto da rua"],
    ["bueiro", "bueiro", "bueiro entupido ou com água acumulada"],
    ["calcada", "calcada", "piso quebrado no caminho de pedestres"],
    ["entulho", "entulho", "restos de obra ou objetos na rua"],
    ["guia", "guia", "guia ou sarjeta quebrada"],
    ["varri", "varricao", "folhas e lixo acumulados na rua"],
    ["lixeira", "lixeira", "lixeira quebrada, cheia ou ausente"],
  ];
  const tipo = tipos.find(([termo]) => nome.includes(termo));
  return { icone: tipo?.[1] || "info", exemplo: tipo?.[2] || categoria?.descricao || "problema de manutenção na rua" };
}
function hoje() {
  const data = new Date();
  return new Date(data.getTime() - data.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function formatarData(iso) {
  if (!iso) return "Data não informada";
  return iso.slice(0, 10).split("-").reverse().join("/");
}
function diasDesde(iso, fim = hoje()) {
  return Math.max(0, Math.floor((Date.parse(fim + "T12:00:00Z") - Date.parse(iso + "T12:00:00Z")) / 86400000));
}
function textoTempoDesde(iso, fim = hoje()) {
  const dias = diasDesde(iso, fim);
  if (dias === 0) return "hoje";
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}
function textoPrazo(dias) {
  const valor = Number(dias);
  if (valor === 0) return "hoje";
  return `${valor} ${valor === 1 ? "dia" : "dias"}`;
}
function numeroRegistro(o) {
  return `Registro nº ${String(o.idOcorrencia).padStart(4, "0")}`;
}
function nivelPrioridade(valor) {
  if (valor >= 60) return { classe: "alta", texto: "Alta" };
  if (valor >= 40) return { classe: "media", texto: "Média" };
  return { classe: "baixa", texto: "Baixa" };
}
function endereco(o) {
  return nomeProprio(o.logradouro) + (o.numero ? `, ${o.numero}` : "");
}
function abreviarRua(nome) {
  return nome.replace(/^Doutor\s/, "Dr. ").replace(/^Professor\s/, "Prof. ").replace(/^Conselheiro\s/, "Cons. ").replace(/^Senador\s/, "Sen. ").replace(/^General\s/, "Gen. ");
}
function placaDeRua(o, grande = false) {
  if (grande) return `<span class="placa placa-grande"><span class="placa-rua">${esc(nomeProprio(o.logradouro))}</span>${o.numero ? `<span class="placa-num">${esc(o.numero)}</span>` : ""}</span>`;
  const rua = abreviarRua(nomeProprio(o.logradouro).replace(/^Rua\s+/i, ""));
  return `<span class="placa placa-compacta" title="${esc(endereco(o))}"><span class="placa-nome">${esc(rua)}</span>${o.numero ? `<span class="placa-num">${esc(o.numero)}</span>` : ""}</span>`;
}
function seloStatus(status) {
  return `<span class="selo selo-${esc(status.toLowerCase())}">${STATUS_TEXTO[status] || esc(status)}</span>`;
}
function textoApoios(numero) { return Number(numero) === 0 ? "nenhum apoio" : `${numero} ${Number(numero) === 1 ? "apoio" : "apoios"}`; }
function contarApoios(apoios) {
  const contagem = {};
  apoios.forEach((a) => { contagem[a.idOcorrencia] = (contagem[a.idOcorrencia] || 0) + 1; });
  return contagem;
}
function linhaOcorrencia(o, categoria, apoios = 0, numero = null, mostrarRegistro = false, linhaMini = "") {
  return `<li class="item"><a class="cobrir" href="ocorrencia.html?id=${o.idOcorrencia}">
    <span class="item-icone">${iconeCategoria(categoriaVisual(categoria).icone)}${numero ? `<span class="numero numero-mapa numero-${esc(String(o.status).toLowerCase())}">${numero}<span class="visualmente-oculto"> na lista do mapa</span></span>` : ""}</span>
    <div class="item-corpo"><div class="item-topo"><strong>${esc(nomeExibido(categoria?.nome || "Problema registrado"))}</strong>${seloStatus(o.status)}</div>
    ${placaDeRua(o)}<p class="item-descricao">${esc(nomeExibido(o.descricao))}</p>
    <p class="item-meta">${mostrarRegistro ? `${numeroRegistro(o)} · ` : ""}${textoTempoDesde(o.dataAbertura)} · ${textoApoios(apoios)}</p>${linhaMini}</div></a></li>`;
}
function linhaDoAtendimento(o, atendimentos = [], equipes = [], mini = false) {
  const relacionados = atendimentos.filter((a) => a.idOcorrencia === o.idOcorrencia);
  const visita = relacionados.find((a) => a.status === "AGENDADO");
  const concluido = relacionados.find((a) => a.status === "CONCLUIDO");
  const cancelada = o.status === "CANCELADA";
  let atual = 1;
  let nomeAtual = "Na fila";
  if (cancelada) {
    nomeAtual = "Cancelado";
  } else if (o.status === "RESOLVIDA") {
    atual = 3;
    nomeAtual = "Resolvido";
  } else if (visita) {
    atual = 2;
    nomeAtual = "Visita agendada";
  } else if (o.status === "EM_ANDAMENTO") {
    atual = 2;
    nomeAtual = "Em atendimento";
  }

  const atendimentoVisivel = visita || concluido;
  const equipe = atendimentoVisivel
    ? equipes.find((e) => e.idEquipe === atendimentoVisivel.idEquipe)
    : null;
  const terceiraEstacao = atendimentoVisivel
    ? `<span class="estacao-nome">Visita agendada</span><small>${esc(formatarData(atendimentoVisivel.dataAgendada))}</small><small>${esc(nomeExibido(equipe?.nome || "equipe não informada"))}</small>`
    : `<span class="estacao-nome">${o.status === "EM_ANDAMENTO" ? "Em atendimento" : "Visita agendada"}</span>`;
  const estacoes = [
    { nome: "Registrado", conteudo: `<span class="estacao-nome">Registrado</span><small>${esc(formatarData(o.dataAbertura))}</small>` },
    { nome: "Na fila", conteudo: '<span class="estacao-nome">Na fila</span>' },
    { nome: "Visita agendada", conteudo: terceiraEstacao },
    { nome: "Resolvido", conteudo: `<span class="estacao-nome">Resolvido</span>${o.dataResolucao ? `<small>${esc(formatarData(o.dataResolucao))}</small>` : ""}` },
  ];
  const caminho = cancelada && !mini ? estacoes.slice(0, 2) : estacoes;
  const itens = caminho.map((estacao, indice) => {
    const estado = cancelada
      ? (indice < 2 ? "percorrida" : "futura")
      : indice < atual ? "percorrida" : indice === atual ? "atual" : "futura";
    let trecho = "futuro";
    if (indice < atual) trecho = o.status === "RESOLVIDA" && indice === 2 ? "resolvido" : "percorrido";
    if (cancelada && !mini && indice === caminho.length - 1) trecho = "cancelado";
    const ehAtual = !cancelada && indice === atual;
    const atualAtributo = ehAtual ? ' aria-current="step"' : "";
    const resolvida = o.status === "RESOLVIDA" && indice === 3 ? " estacao-resolvida" : "";
    const duracao = Math.round(600 / atual);
    const tempoAnimacao = !mini && (trecho === "percorrido" || trecho === "resolvido")
      ? ` style="--duracao-linha:${duracao}ms;--atraso-linha:${duracao * indice}ms"`
      : "";
    return `<li class="estacao estacao-${estado}${resolvida}" data-trecho="${trecho}"${tempoAnimacao}${atualAtributo}><span class="estacao-ponto"><span class="visualmente-oculto">${esc(estacao.nome)}</span></span>${mini ? "" : `<span class="estacao-conteudo">${estacao.conteudo}</span>`}</li>`;
  });
  if (cancelada && !mini) {
    itens.push('<li class="estacao estacao-terminal" aria-current="step"><span class="estacao-ponto"><span class="visualmente-oculto">Cancelado</span></span><span class="estacao-conteudo"><span class="estacao-nome">Cancelado</span></span></li>');
  } else if (cancelada && mini) {
    itens.push('<li class="visualmente-oculto" aria-current="step">Cancelado</li>');
  }
  const classe = mini ? "linha-atendimento linha-atendimento-mini" : "linha-atendimento";
  return `<div class="${mini ? "linha-atendimento-resumo" : "linha-atendimento-bloco"}"><ol class="${classe}" aria-label="Linha do atendimento">${itens.join("")}</ol>${mini ? `<span class="linha-atendimento-nome">${esc(nomeAtual)}</span>` : ""}</div>`;
}
function montarCabecalho(links) {
  const usuario = sessao.ler();
  $("cabecalho").innerHTML = `<div class="cabecalho-linha"><a class="marca" href="index.html">${icone("local")}<span class="marca-placa">${esc(CONFIG.APP_NOME)}</span></a>
    ${usuario ? '<button class="botao-texto" id="botao-sair" type="button">Trocar perfil</button>' : ""}</div>
    <p class="quem">${esc(usuario?.perfil === "gestor" ? "Subprefeitura Sé · São Paulo" : usuario?.nome || "Liberdade · Sé · São Paulo")}</p>
    ${links.length ? `<nav class="abas ${links.length === 2 ? "abas-gestor" : ""}" aria-label="Páginas">${links.map((link) => `<a href="${link.href}" ${link.atual ? 'aria-current="page"' : ""}${link.curto ? ` aria-label="${esc(link.texto)}"` : ""}>${link.curto ? `<span class="aba-completa">${esc(link.texto)}</span><span class="aba-curta" aria-hidden="true">${esc(link.curto)}</span>` : esc(link.texto)}</a>`).join("")}</nav>` : ""}`;
  $("botao-sair")?.addEventListener("click", () => sessao.sair());
  document.title = document.title.replace("{app}", CONFIG.APP_NOME);
}
function avisar(mensagem, tipo = "sucesso", detalhes = []) {
  const area = $("aviso");
  area.className = `aviso aviso-${tipo}`;
  area.innerHTML = `${icone(tipo === "erro" ? "alerta" : tipo === "sucesso" ? "check" : "info")}<div><p>${esc(mensagem)}</p>${detalhes.length ? `<ul>${detalhes.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}</div>`;
  area.hidden = false;
  area.focus();
}
function avisarErro(erro) { avisar(erro.message || "Não foi possível concluir. Tente de novo.", "erro", erro.campos || []); }
function limparAviso() { $("aviso").hidden = true; }
function focarTitulo(area) {
  const titulo = area?.closest("section")?.querySelector("h2, h3") || document.querySelector("main h1");
  if (!titulo) return;
  titulo.setAttribute("tabindex", "-1");
  titulo.focus();
}
function erroComTentativa(erro, tentar) {
  avisarErro(erro);
  const botao = document.createElement("button");
  botao.className = "botao";
  botao.type = "button";
  botao.textContent = "Tentar de novo";
  botao.addEventListener("click", async () => {
    botao.disabled = true;
    await tentar();
    if ($("aviso").hidden) focarTitulo();
  });
  $("aviso").lastElementChild.append(botao);
}
async function enviarComBotao(botao, acao) {
  const texto = botao.textContent;
  botao.disabled = true;
  botao.textContent = "Enviando…";
  try { await acao(); }
  catch (erro) { avisarErro(erro); }
  finally { botao.disabled = false; botao.textContent = texto; }
}
function limparErros(form) {
  form.querySelectorAll(".erro-campo").forEach((erro) => erro.remove());
  form.querySelectorAll('[aria-invalid="true"]').forEach((campo) => {
    campo.removeAttribute("aria-invalid");
    const ids = (campo.getAttribute("aria-describedby") || "").split(" ").filter((id) => !id.endsWith("-erro"));
    if (ids.length) campo.setAttribute("aria-describedby", ids.join(" "));
    else campo.removeAttribute("aria-describedby");
  });
}
function erroCampo(campo, mensagem) {
  const id = campo.id + "-erro";
  campo.setAttribute("aria-invalid", "true");
  campo.setAttribute("aria-describedby", `${campo.getAttribute("aria-describedby") || ""} ${id}`.trim());
  const erro = document.createElement("p");
  erro.id = id;
  erro.className = "erro-campo";
  erro.innerHTML = `${icone("alerta")} ${esc(mensagem)}`;
  campo.insertAdjacentElement("afterend", erro);
}
function validarFormulario(form) {
  limparErros(form);
  let valido = true;
  form.querySelectorAll("input, select, textarea").forEach((campo) => {
    if (!campo.validity.valid) {
      erroCampo(campo, campo.validationMessage);
      valido = false;
    }
  });
  if (!valido) avisar("Confira os campos indicados antes de continuar.", "erro");
  return valido;
}
async function carregarApoio() {
  const [categorias, distritos] = await Promise.all([api.get("/categorias"), api.get("/distritos")]);
  return { categorias, distritos,
    categoria: Object.fromEntries(categorias.map((c) => [c.idCategoria, c])),
    distrito: Object.fromEntries(distritos.map((d) => [d.idDistrito, d])),
  };
}
async function mostrarComposicao(id, area) {
  area.innerHTML = '<p class="texto-suave">Carregando composição…</p>';
  try {
    const dados = await api.get(`/ocorrencias/${id}/prioridade`);
    if (!Array.isArray(dados?.itens) || !Number.isFinite(dados.total)) throw new Error("Composição inválida");
    area.innerHTML = `<dl class="composicao">${dados.itens.map((item) => `<div><dt>${esc(nomeExibido(item.motivo))}</dt><dd>${esc(item.pontos)}</dd></div>`).join("")}<div><dt><strong>Total</strong></dt><dd>${dados.total}</dd></div></dl>`;
    return true;
  } catch {
    area.innerHTML = `<p>${icone("info")} Composição indisponível</p><button type="button" class="botao-texto">Tentar de novo</button>`;
    area.querySelector("button").addEventListener("click", async () => {
      if (await mostrarComposicao(id, area)) focarTitulo(area);
      else area.querySelector("button").focus();
    });
    return false;
  }
}
