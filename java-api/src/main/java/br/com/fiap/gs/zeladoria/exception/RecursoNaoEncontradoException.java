package br.com.fiap.gs.zeladoria.exception;

/** Lancada quando um registro procurado pelo ID nao existe. Vira HTTP 404. */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String recurso, Long id) {
        super("Registro não encontrado: " + recurso + " com ID " + id);
    }
}
