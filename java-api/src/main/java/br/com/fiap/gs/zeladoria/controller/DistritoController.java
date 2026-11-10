package br.com.fiap.gs.zeladoria.controller;

import br.com.fiap.gs.zeladoria.bo.DistritoBO;
import br.com.fiap.gs.zeladoria.model.Distrito;
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
@RequestMapping("/distritos")
public class DistritoController {

    private final DistritoBO bo;

    public DistritoController(DistritoBO bo) {
        this.bo = bo;
    }

    @GetMapping
    public List<Distrito> listar() {
        return bo.listar();
    }

    @GetMapping("/{id}")
    public Distrito buscar(@PathVariable Long id) {
        return bo.buscar(id);
    }

    @PostMapping
    public ResponseEntity<Distrito> cadastrar(@Valid @RequestBody Distrito d) {
        Distrito criado = bo.cadastrar(d);
        return ResponseEntity.created(URI.create("/distritos/" + criado.getIdDistrito())).body(criado);
    }

    @PutMapping("/{id}")
    public Distrito atualizar(@PathVariable Long id, @Valid @RequestBody Distrito d) {
        return bo.atualizar(id, d);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        bo.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
