package br.com.fiap.gs.zeladoria.controller;

import br.com.fiap.gs.zeladoria.bo.CategoriaBO;
import br.com.fiap.gs.zeladoria.dto.ReguaPesoDTO;
import br.com.fiap.gs.zeladoria.model.Categoria;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaBO bo;

    public CategoriaController(CategoriaBO bo) {
        this.bo = bo;
    }

    @GetMapping
    public List<Categoria> listar() {
        return bo.listar();
    }

    @Operation(summary = "Regua sugerida ao gestor para escolher o peso (1 a 5) de uma categoria")
    @GetMapping("/regua-peso")
    public List<ReguaPesoDTO> reguaPeso() {
        return bo.reguaPeso();
    }

    @GetMapping("/{id}")
    public Categoria buscar(@PathVariable Long id) {
        return bo.buscar(id);
    }

    @PostMapping
    public ResponseEntity<Categoria> cadastrar(@Valid @RequestBody Categoria c) {
        Categoria criada = bo.cadastrar(c);
        return ResponseEntity.created(URI.create("/categorias/" + criada.getIdCategoria())).body(criada);
    }

    @PutMapping("/{id}")
    public Categoria atualizar(@PathVariable Long id, @Valid @RequestBody Categoria c) {
        return bo.atualizar(id, c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        bo.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
