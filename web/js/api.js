class ErroApi extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem);
    this.status = status;
    this.campos = campos || [];
  }
}

// No plano gratuito do Render a API "dorme" sem uso e leva até um minuto para acordar.
// Enquanto nenhuma resposta chegou, as chamadas esperam mais; depois disso o limite volta a 15 s.
let servidorAcordado = false;

async function chamarApi(metodo, caminho, corpo) {
  const opcoes = { method: metodo, headers: {} };
  if (corpo !== undefined) {
    opcoes.headers["Content-Type"] = "application/json";
    opcoes.body = JSON.stringify(corpo);
  }

  const controle = new AbortController();
  opcoes.signal = controle.signal;
  const limite = setTimeout(() => controle.abort(), servidorAcordado ? 15000 : 75000);
  let avisouLentidao = false;
  const avisoLento = servidorAcordado ? null : setTimeout(() => {
    avisouLentidao = true;
    avisar("O servidor está ligando depois de um tempo parado. Isso pode levar até um minuto.");
  }, 5000);
  try {
    const resposta = await fetch(CONFIG.API_URL + caminho, opcoes);
    servidorAcordado = true;
    if (avisouLentidao) limparAviso();
    if (resposta.status === 204) return null;
    const dados = await resposta.json().catch(() => null);
    if (controle.signal.aborted) throw new Error();
    if (!resposta.ok) {
      throw new ErroApi(resposta.status, dados?.mensagem || "Erro " + resposta.status, dados?.campos);
    }
    return dados;
  } catch (erro) {
    if (controle.signal.aborted) throw new ErroApi(0, "A conexão demorou demais. Tente de novo.");
    if (erro instanceof ErroApi) throw erro;
    throw new ErroApi(0, "Não foi possível falar com o servidor. Confira a internet e tente de novo.");
  } finally {
    clearTimeout(limite);
    clearTimeout(avisoLento);
  }
}

const api = {
  get: (caminho) => chamarApi("GET", caminho),
  post: (caminho, corpo) => chamarApi("POST", caminho, corpo),
  put: (caminho, corpo) => chamarApi("PUT", caminho, corpo),
  delete: (caminho) => chamarApi("DELETE", caminho),
};
