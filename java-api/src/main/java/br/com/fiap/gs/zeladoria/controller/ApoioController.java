package br.com.fiap.gs.zeladoria.controller;

import br.com.fiap.gs.zeladoria.bo.ApoioBO;
import br.com.fiap.gs.zeladoria.model.Apoio;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Apoio nao tem PUT: ele so registra "este cidadao apoia esta ocorrencia".
 * Para desfazer, o cidadao remove o apoio (DELETE).
 */
@RestController
@RequestMapping("/apoios")
public class ApoioController {

    private final ApoioBO bo;

    public ApoioController(ApoioBO bo) {
        this.bo = bo;
    }

    @GetMapping
    public List<Apoio> listar() {
        return bo.listar(null);
    }

    @GetMapping("/{id}")
    public Apoio buscar(@PathVariable Long id) {
        return bo.buscar(id);
    }

    @Operation(summary = "\"Tambem me afeta\": registra o apoio e recalcula a prioridade da ocorrencia")
    @PostMapping
    public ResponseEntity<Apoio> cadastrar(@Valid @RequestBody Apoio a) {
        Apoio criado = bo.cadastrar(a);
        return ResponseEntity.created(URI.create("/apoios/" + criado.getIdApoio())).body(criado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        bo.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
