package br.com.fiap.gs.zeladoria.controller;

import br.com.fiap.gs.zeladoria.bo.SubprefeituraBO;
import br.com.fiap.gs.zeladoria.model.Subprefeitura;
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
@RequestMapping("/subprefeituras")
public class SubprefeituraController {

    private final SubprefeituraBO bo;

    public SubprefeituraController(SubprefeituraBO bo) {
        this.bo = bo;
    }

    @GetMapping
    public List<Subprefeitura> listar() {
        return bo.listar();
    }

    @GetMapping("/{id}")
    public Subprefeitura buscar(@PathVariable Long id) {
        return bo.buscar(id);
    }

    @PostMapping
    public ResponseEntity<Subprefeitura> cadastrar(@Valid @RequestBody Subprefeitura s) {
        Subprefeitura criada = bo.cadastrar(s);
        return ResponseEntity.created(URI.create("/subprefeituras/" + criada.getIdSubprefeitura())).body(criada);
    }

    @PutMapping("/{id}")
    public Subprefeitura atualizar(@PathVariable Long id, @Valid @RequestBody Subprefeitura s) {
        return bo.atualizar(id, s);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        bo.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
