package br.com.fiap.gs.zeladoria.controller;

import br.com.fiap.gs.zeladoria.bo.AtendimentoBO;
import br.com.fiap.gs.zeladoria.model.Atendimento;
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
@RequestMapping("/atendimentos")
public class AtendimentoController {

    private final AtendimentoBO bo;

    public AtendimentoController(AtendimentoBO bo) {
        this.bo = bo;
    }

    @GetMapping
    public List<Atendimento> listar() {
        return bo.listar(null);
    }

    @GetMapping("/{id}")
    public Atendimento buscar(@PathVariable Long id) {
        return bo.buscar(id);
    }

    @Operation(summary = "Agenda uma visita de equipe; a ocorrencia passa para EM_ANDAMENTO")
    @PostMapping
    public ResponseEntity<Atendimento> cadastrar(@Valid @RequestBody Atendimento a) {
        Atendimento criado = bo.cadastrar(a);
        return ResponseEntity.created(URI.create("/atendimentos/" + criado.getIdAtendimento())).body(criado);
    }

    @Operation(summary = "Atualiza o atendimento; com status CONCLUIDO a ocorrencia vira RESOLVIDA")
    @PutMapping("/{id}")
    public Atendimento atualizar(@PathVariable Long id, @Valid @RequestBody Atendimento a) {
        return bo.atualizar(id, a);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        bo.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
