package br.com.fiap.gs.zeladoria.controller;

import br.com.fiap.gs.zeladoria.bo.CidadaoBO;
import br.com.fiap.gs.zeladoria.model.Cidadao;
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
@RequestMapping("/cidadaos")
public class CidadaoController {

    private final CidadaoBO bo;

    public CidadaoController(CidadaoBO bo) {
        this.bo = bo;
    }

    @GetMapping
    public List<Cidadao> listar() {
        return bo.listar();
    }

    @GetMapping("/{id}")
    public Cidadao buscar(@PathVariable Long id) {
        return bo.buscar(id);
    }

    @PostMapping
    public ResponseEntity<Cidadao> cadastrar(@Valid @RequestBody Cidadao c) {
        Cidadao criado = bo.cadastrar(c);
        return ResponseEntity.created(URI.create("/cidadaos/" + criado.getIdCidadao())).body(criado);
    }

    @PutMapping("/{id}")
    public Cidadao atualizar(@PathVariable Long id, @Valid @RequestBody Cidadao c) {
        return bo.atualizar(id, c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        bo.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
