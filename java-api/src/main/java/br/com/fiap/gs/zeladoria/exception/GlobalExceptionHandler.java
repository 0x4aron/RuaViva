package br.com.fiap.gs.zeladoria.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Camada de tratamento de excecoes: transforma cada tipo de erro
 * em uma resposta HTTP com status correto e mensagem clara (ErroResposta).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 404 - registro nao existe
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> naoEncontrado(RecursoNaoEncontradoException e, HttpServletRequest req) {
        return resposta(HttpStatus.NOT_FOUND, e.getMessage(), req, List.of());
    }

    // 404 - rota que nao existe
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResposta> rotaInexistente(NoResourceFoundException e, HttpServletRequest req) {
        return resposta(HttpStatus.NOT_FOUND, "Endereço não encontrado", req, List.of());
    }

    // 422 - regra de negocio violada (camada BO)
    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResposta> regraNegocio(RegraNegocioException e, HttpServletRequest req) {
        return resposta(HttpStatus.UNPROCESSABLE_ENTITY, e.getMessage(), req, List.of());
    }

    // 400 - campos invalidos (@NotBlank, @Email, @Min...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> validacao(MethodArgumentNotValidException e, HttpServletRequest req) {
        List<String> campos = e.getBindingResult().getFieldErrors().stream()
                .map(erro -> erro.getField() + ": " + erro.getDefaultMessage())
                .toList();
        return resposta(HttpStatus.BAD_REQUEST, "Dados inválidos", req, campos);
    }

    // 400 - JSON mal formado ou valor invalido (ex.: status que nao existe)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResposta> jsonInvalido(HttpMessageNotReadableException e, HttpServletRequest req) {
        return resposta(HttpStatus.BAD_REQUEST, "JSON inválido ou com valor não aceito", req, List.of());
    }

    // 400 - parametro da URL com tipo errado (ex.: /ocorrencias/abc)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResposta> parametroInvalido(MethodArgumentTypeMismatchException e, HttpServletRequest req) {
        return resposta(HttpStatus.BAD_REQUEST, "Parâmetro inválido: " + e.getName(), req, List.of());
    }

    // 409 - o banco recusou por integridade (FK, UNIQUE, CHECK)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResposta> integridade(DataIntegrityViolationException e, HttpServletRequest req) {
        log.warn("Violação de integridade: {}", e.getMostSpecificCause().getMessage());
        return resposta(HttpStatus.CONFLICT,
                "Operação recusada pelo banco: o registro está em uso por outros dados ou repete um valor único",
                req, List.of());
    }

    // 503 - problema de acesso ao banco (fora do ar, senha errada...)
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErroResposta> banco(DataAccessException e, HttpServletRequest req) {
        log.error("Erro de acesso ao banco", e);
        return resposta(HttpStatus.SERVICE_UNAVAILABLE, "Banco de dados indisponível no momento", req, List.of());
    }

    // 500 - qualquer outro erro inesperado
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> inesperado(Exception e, HttpServletRequest req) {
        // Erros HTTP do proprio Spring (metodo nao permitido, Content-Type errado...) mantem o status certo
        if (e instanceof ErrorResponse erroHttp) {
            HttpStatus status = HttpStatus.valueOf(erroHttp.getStatusCode().value());
            return resposta(status, descricaoStatus(status), req, List.of());
        }
        log.error("Erro inesperado", e);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor", req, List.of());
    }

    private ResponseEntity<ErroResposta> resposta(HttpStatus status, String mensagem,
                                                  HttpServletRequest req, List<String> campos) {
        ErroResposta corpo = new ErroResposta(LocalDateTime.now(), status.value(),
                descricaoStatus(status), mensagem, req.getRequestURI(), campos);
        return ResponseEntity.status(status).body(corpo);
    }

    private String descricaoStatus(HttpStatus status) {
        return switch (status) {
            case BAD_REQUEST -> "Requisição inválida";
            case NOT_FOUND -> "Recurso não encontrado";
            case METHOD_NOT_ALLOWED -> "Método HTTP não permitido";
            case NOT_ACCEPTABLE -> "Formato de resposta não aceito";
            case CONFLICT -> "Conflito de dados";
            case UNSUPPORTED_MEDIA_TYPE -> "Tipo de conteúdo não aceito";
            case UNPROCESSABLE_ENTITY -> "Regra de negócio violada";
            case INTERNAL_SERVER_ERROR -> "Erro interno no servidor";
            case SERVICE_UNAVAILABLE -> "Serviço indisponível";
            default -> "Erro na requisição HTTP (" + status.value() + ")";
        };
    }
}
