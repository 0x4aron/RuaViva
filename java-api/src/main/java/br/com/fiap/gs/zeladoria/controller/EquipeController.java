package br.com.fiap.gs.zeladoria.controller;

import br.com.fiap.gs.zeladoria.bo.EquipeBO;
import br.com.fiap.gs.zeladoria.model.Equipe;
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
@RequestMapping("/equipes")
public class EquipeController {

    private final EquipeBO bo;

    public EquipeController(EquipeBO bo) {
        this.bo = bo;
    }

    @GetMapping
    public List<Equipe> listar() {
        return bo.listar();
    }

    @GetMapping("/{id}")
    public Equipe buscar(@PathVariable Long id) {
        return bo.buscar(id);
    }

    @PostMapping
    public ResponseEntity<Equipe> cadastrar(@Valid @RequestBody Equipe e) {
        Equipe criada = bo.cadastrar(e);
        return ResponseEntity.created(URI.create("/equipes/" + criada.getIdEquipe())).body(criada);
    }

    @PutMapping("/{id}")
    public Equipe atualizar(@PathVariable Long id, @Valid @RequestBody Equipe e) {
        return bo.atualizar(id, e);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        bo.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
