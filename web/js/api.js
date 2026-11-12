// Comunicacao com a API Java. Todas as paginas usam estas funcoes.

class ErroApi extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem);
    this.status = status;
    this.campos = campos || [];
  }
}

async function chamarApi(metodo, caminho, corpo) {
  const opcoes = { method: metodo, headers: {} };
  if (corpo !== undefined) {
    opcoes.headers["Content-Type"] = "application/json";
    opcoes.body = JSON.stringify(corpo);
  }

  const controle = new AbortController();
  opcoes.signal = controle.signal;
  const limite = setTimeout(() => controle.abort(), 15000);
  try {
    const resposta = await fetch(CONFIG.API_URL + caminho, opcoes);
    if (resposta.status === 204) return null;
    const dados = await resposta.json().catch(() => null);
    if (controle.signal.aborted) throw new Error();
    if (!resposta.ok) {
      // A API informa a mensagem e os campos inválidos.
      throw new ErroApi(resposta.status, dados?.mensagem || "Erro " + resposta.status, dados?.campos);
    }
    return dados;
  } catch (erro) {
    if (controle.signal.aborted) throw new ErroApi(0, "A conexão demorou demais. Tente de novo.");
    if (erro instanceof ErroApi) throw erro;
    throw new ErroApi(0, "Não foi possível falar com o servidor. Confira a internet e tente de novo.");
  } finally {
    clearTimeout(limite);
  }
}

const api = {
  get: (caminho) => chamarApi("GET", caminho),
  post: (caminho, corpo) => chamarApi("POST", caminho, corpo),
  put: (caminho, corpo) => chamarApi("PUT", caminho, corpo),
  delete: (caminho) => chamarApi("DELETE", caminho),
};
