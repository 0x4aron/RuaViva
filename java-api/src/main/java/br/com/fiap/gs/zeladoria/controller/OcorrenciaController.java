package br.com.fiap.gs.zeladoria.controller;

import br.com.fiap.gs.zeladoria.bo.ApoioBO;
import br.com.fiap.gs.zeladoria.bo.AtendimentoBO;
import br.com.fiap.gs.zeladoria.bo.OcorrenciaBO;
import br.com.fiap.gs.zeladoria.dto.ComposicaoPrioridadeDTO;
import br.com.fiap.gs.zeladoria.model.Apoio;
import br.com.fiap.gs.zeladoria.model.Atendimento;
import br.com.fiap.gs.zeladoria.model.Ocorrencia;
import br.com.fiap.gs.zeladoria.model.StatusOcorrencia;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/ocorrencias")
public class OcorrenciaController {

    private final OcorrenciaBO bo;
    private final ApoioBO apoioBO;
    private final AtendimentoBO atendimentoBO;

    public OcorrenciaController(OcorrenciaBO bo, ApoioBO apoioBO, AtendimentoBO atendimentoBO) {
        this.bo = bo;
        this.apoioBO = apoioBO;
        this.atendimentoBO = atendimentoBO;
    }

    @Operation(summary = "Lista as ocorrências da maior para a menor prioridade (filtro opcional por status)")
    @GetMapping
    public List<Ocorrencia> listar(@RequestParam(required = false) StatusOcorrencia status) {
        return bo.listar(status);
    }

    @Operation(summary = "Fila do gestor: ocorrências abertas ainda sem atendimento, por prioridade")
    @GetMapping("/fila")
    public List<Ocorrencia> fila() {
        return bo.filaSemAtendimento();
    }

    @GetMapping("/{id}")
    public Ocorrencia buscar(@PathVariable Long id) {
        return bo.buscar(id);
    }

    @Operation(summary = "Explica a prioridade da ocorrência por gravidade, apoios, proximidade e cidadão",
            description = "Usa o ponto sensível mais próximo em até 200 m e arredonda a distância para dezenas de metros. "
                    + "Só leitura: não altera o banco. Nas pendentes, o total é igual à prioridade gravada. "
                    + "Retorna 404 se o ID não existir.")
    @GetMapping("/{id}/prioridade")
    public ComposicaoPrioridadeDTO prioridade(@PathVariable Long id) {
        return bo.explicarPrioridade(id);
    }

    @GetMapping("/{id}/apoios")
    public List<Apoio> apoios(@PathVariable Long id) {
        bo.buscar(id);
        return apoioBO.listar(id);
    }

    @GetMapping("/{id}/atendimentos")
    public List<Atendimento> atendimentos(@PathVariable Long id) {
        bo.buscar(id);
        return atendimentoBO.listar(id);
    }

    @Operation(summary = "Registra uma ocorrência; status, data de abertura e prioridade são definidos pelo sistema")
    @PostMapping
    public ResponseEntity<Ocorrencia> cadastrar(@Valid @RequestBody Ocorrencia o) {
        Ocorrencia criada = bo.cadastrar(o);
        return ResponseEntity.created(URI.create("/ocorrencias/" + criada.getIdOcorrencia())).body(criada);
    }

    @PutMapping("/{id}")
    public Ocorrencia atualizar(@PathVariable Long id, @Valid @RequestBody Ocorrencia o) {
        return bo.atualizar(id, o);
    }

    @Operation(summary = "Exclui a ocorrência junto com seus apoios e atendimentos")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        bo.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
