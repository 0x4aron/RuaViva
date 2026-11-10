package br.com.fiap.gs.zeladoria.model;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/** Tabela GS_APOIO: "tambem me afeta". Cada cidadao apoia uma ocorrencia uma unica vez. */
public class Apoio {

    private Long idApoio;

    @NotNull(message = "A ocorrencia e obrigatoria")
    private Long idOcorrencia;

    @NotNull(message = "O cidadao e obrigatorio")
    private Long idCidadao;

    /** Preenchida pelo sistema. */
    private LocalDate dataApoio;

    public Long getIdApoio() { return idApoio; }
    public void setIdApoio(Long idApoio) { this.idApoio = idApoio; }

    public Long getIdOcorrencia() { return idOcorrencia; }
    public void setIdOcorrencia(Long idOcorrencia) { this.idOcorrencia = idOcorrencia; }

    public Long getIdCidadao() { return idCidadao; }
    public void setIdCidadao(Long idCidadao) { this.idCidadao = idCidadao; }

    public LocalDate getDataApoio() { return dataApoio; }
    public void setDataApoio(LocalDate dataApoio) { this.dataApoio = dataApoio; }
}
