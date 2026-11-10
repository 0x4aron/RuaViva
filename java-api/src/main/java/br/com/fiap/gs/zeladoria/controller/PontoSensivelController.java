package br.com.fiap.gs.zeladoria.controller;

import br.com.fiap.gs.zeladoria.bo.PontoSensivelBO;
import br.com.fiap.gs.zeladoria.model.PontoSensivel;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/pontos-sensiveis")
public class PontoSensivelController {

    private final PontoSensivelBO bo;

    public PontoSensivelController(PontoSensivelBO bo) {
        this.bo = bo;
    }

    @GetMapping
    public List<PontoSensivel> listar() {
        return bo.listar();
    }

    @GetMapping("/{id}")
    public PontoSensivel buscar(@PathVariable Long id) {
        return bo.buscar(id);
    }

    @PostMapping
    public ResponseEntity<PontoSensivel> cadastrar(@Valid @RequestBody PontoSensivel p) {
        PontoSensivel criado = bo.cadastrar(p);
        return ResponseEntity.created(URI.create("/pontos-sensiveis/" + criado.getIdPontoSensivel())).body(criado);
    }

    @PutMapping("/{id}")
    public PontoSensivel atualizar(@PathVariable Long id, @Valid @RequestBody PontoSensivel p) {
        return bo.atualizar(id, p);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        bo.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
