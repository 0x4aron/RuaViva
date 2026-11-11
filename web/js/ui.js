// Funcoes de interface usadas em todas as paginas: sessao, cabecalho, textos e avisos.

// ---------- Sessao (quem esta usando o site) ----------
// MVP sem login: o perfil escolhido na entrada fica guardado no navegador.
const sessao = {
  ler() {
    try {
      return JSON.parse(localStorage.getItem("sessao")) || null;
    } catch {
      return null;
    }
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
    localStorage.removeItem("sessao");
    location.href = "index.html";
  },
  // Manda para a entrada se o perfil da pagina nao for o da sessao
  exigir(perfil) {
    const s = this.ler();
    if (!s || s.perfil !== perfil) {
      location.href = "index.html";
      return null;
    }
    return s;
  },
};

// ---------- Textos ----------
const STATUS_TEXTO = {
  ABERTA: "Aberta",
  EM_ANDAMENTO: "Em andamento",
  RESOLVIDA: "Resolvida",
  CANCELADA: "Cancelada",
};

const ATENDIMENTO_TEXTO = {
  AGENDADO: "Visita agendada",
  CONCLUIDO: "Visita concluida",
  CANCELADO: "Visita cancelada",
};

function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function diasDesde(iso) {
  const inicio = new Date(iso + "T00:00:00");
  return Math.max(0, Math.floor((Date.now() - inicio) / 86400000));
}

function nivelPrioridade(valor) {
  if (valor >= 60) return { classe: "alta", texto: "Alta" };
  if (valor >= 40) return { classe: "media", texto: "Media" };
  return { classe: "baixa", texto: "Baixa" };
}

function endereco(o) {
  return o.numero ? `${o.logradouro}, ${o.numero}` : o.logradouro;
}

// Evita que texto digitado pelo usuario vire HTML
function esc(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

// ---------- Componentes ----------
function placaDeRua(o) {
  return `<span class="placa"><span class="placa-rua">${esc(o.logradouro)}</span>${
    o.numero ? `<span class="placa-num">${esc(o.numero)}</span>` : ""
  }</span>`;
}

function seloStatus(status) {
  return `<span class="selo selo-${status.toLowerCase()}">${STATUS_TEXTO[status]}</span>`;
}

// Cabecalho comum. links: [{ href, texto, atual }]
function montarCabecalho(links) {
  const s = sessao.ler();
  const quem = s ? (s.perfil === "gestor" ? "Gestor da subprefeitura" : s.nome) : "";
  document.getElementById("cabecalho").innerHTML = `
    <div class="cabecalho-linha">
      <a class="marca" href="index.html">${CONFIG.APP_NOME}</a>
      ${s ? `<button class="botao-texto" id="botao-sair" type="button">Trocar perfil</button>` : ""}
    </div>
    ${quem ? `<p class="quem">${esc(quem)}</p>` : ""}
    ${
      links
        ? `<nav class="abas" aria-label="Paginas">${links
            .map((l) => `<a href="${l.href}" ${l.atual ? 'aria-current="page"' : ""}>${l.texto}</a>`)
            .join("")}</nav>`
        : ""
    }`;
  document.getElementById("botao-sair")?.addEventListener("click", () => sessao.sair());
  document.title = document.title.replace("{app}", CONFIG.APP_NOME);
}

const LINKS_CIDADAO = (atual) => [
  { href: "mapa.html", texto: "Mapa", atual: atual === "mapa" },
  { href: "registrar.html", texto: "Registrar", atual: atual === "registrar" },
  { href: "minhas.html", texto: "Meus registros", atual: atual === "minhas" },
];

const LINKS_GESTOR = (atual) => [
  { href: "gestor.html", texto: "Fila de trabalho", atual: atual === "fila" },
  { href: "categorias.html", texto: "Categorias", atual: atual === "categorias" },
];

// ---------- Avisos ----------
// Mostra um aviso no topo da pagina (tipo: "sucesso" ou "erro")
function avisar(mensagem, tipo = "sucesso", detalhes = []) {
  const area = document.getElementById("aviso");
  area.className = "aviso aviso-" + tipo;
  area.innerHTML = `<p>${esc(mensagem)}</p>${
    detalhes.length ? `<ul>${detalhes.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` : ""
  }`;
  area.hidden = false;
  area.focus();
}

function avisarErro(erro) {
  avisar(erro.message, "erro", erro.campos || []);
}

function limparAviso() {
  document.getElementById("aviso").hidden = true;
}

// Carrega categorias e distritos uma vez e devolve mapas id -> objeto
async function carregarApoio() {
  const [categorias, distritos] = await Promise.all([api.get("/categorias"), api.get("/distritos")]);
  return {
    categorias,
    distritos,
    categoria: Object.fromEntries(categorias.map((c) => [c.idCategoria, c])),
    distrito: Object.fromEntries(distritos.map((d) => [d.idDistrito, d])),
  };
}
