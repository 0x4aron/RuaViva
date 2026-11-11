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

  let resposta;
  try {
    resposta = await fetch(CONFIG.API_URL + caminho, opcoes);
  } catch (e) {
    throw new ErroApi(0, "Não foi possível falar com o servidor. Confira a internet e tente de novo.");
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    // A API devolve { mensagem, campos } em todo erro (GlobalExceptionHandler)
    throw new ErroApi(resposta.status, dados?.mensagem || "Erro " + resposta.status, dados?.campos);
  }
  return dados;
}

const api = {
  get: (caminho) => chamarApi("GET", caminho),
  post: (caminho, corpo) => chamarApi("POST", caminho, corpo),
  put: (caminho, corpo) => chamarApi("PUT", caminho, corpo),
  delete: (caminho) => chamarApi("DELETE", caminho),
};
