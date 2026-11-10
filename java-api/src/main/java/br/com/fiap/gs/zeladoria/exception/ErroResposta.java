package br.com.fiap.gs.zeladoria.exception;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Corpo JSON devolvido em qualquer erro da API.
 * campos: lista de erros de validacao (vazia quando o erro nao e de validacao).
 */
public record ErroResposta(
        LocalDateTime dataHora,
        int status,
        String erro,
        String mensagem,
        String caminho,
        List<String> campos) {
}
