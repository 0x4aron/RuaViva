package br.com.fiap.gs.zeladoria.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** Tabela GS_ATENDIMENTO: visita de uma equipe para resolver uma ocorrencia. */
public class Atendimento {

    private Long idAtendimento;

    @NotNull(message = "A ocorrencia e obrigatoria")
    private Long idOcorrencia;

    @NotNull(message = "A equipe e obrigatoria")
    private Long idEquipe;

    @NotNull(message = "A data agendada e obrigatoria")
    private LocalDate dataAgendada;

    private LocalDate dataExecucao;

    private StatusAtendimento status;

    @Size(max = 500, message = "A observacao pode ter no maximo 500 caracteres")
    private String observacao;

    public Long getIdAtendimento() { return idAtendimento; }
    public void setIdAtendimento(Long idAtendimento) { this.idAtendimento = idAtendimento; }

    public Long getIdOcorrencia() { return idOcorrencia; }
    public void setIdOcorrencia(Long idOcorrencia) { this.idOcorrencia = idOcorrencia; }

    public Long getIdEquipe() { return idEquipe; }
    public void setIdEquipe(Long idEquipe) { this.idEquipe = idEquipe; }

    public LocalDate getDataAgendada() { return dataAgendada; }
    public void setDataAgendada(LocalDate dataAgendada) { this.dataAgendada = dataAgendada; }

    public LocalDate getDataExecucao() { return dataExecucao; }
    public void setDataExecucao(LocalDate dataExecucao) { this.dataExecucao = dataExecucao; }

    public StatusAtendimento getStatus() { return status; }
    public void setStatus(StatusAtendimento status) { this.status = status; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
