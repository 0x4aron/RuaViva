package br.com.fiap.gs.zeladoria.exception;

/** Lancada quando uma regra de negocio (camada BO) e violada. Vira HTTP 422. */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
