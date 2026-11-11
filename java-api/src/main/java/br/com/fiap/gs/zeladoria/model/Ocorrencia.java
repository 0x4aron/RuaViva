package br.com.fiap.gs.zeladoria.model;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Tabela GS_OCORRENCIA: problema registrado pelo cidadao.
 * status, prioridade, dataAbertura e dataResolucao sao controlados pelo sistema (OcorrenciaBO).
 */
public class Ocorrencia {

    private Long idOcorrencia;

    @NotNull(message = "O cidadão que registra é obrigatório")
    private Long idCidadao;

    @NotNull(message = "A categoria é obrigatória")
    private Long idCategoria;

    @NotNull(message = "O distrito é obrigatório")
    private Long idDistrito;

    @NotBlank(message = "A descrição é obrigatória")
    @Size(max = 500, message = "A descrição pode ter no máximo 500 caracteres")
    private String descricao;

    @NotBlank(message = "O logradouro é obrigatório")
    @Size(max = 120, message = "O logradouro pode ter no máximo 120 caracteres")
    private String logradouro;

    @Size(max = 10, message = "O número pode ter no máximo 10 caracteres")
    private String numero;

    @NotNull(message = "A latitude é obrigatória")
    @DecimalMin(value = "-90", message = "Latitude inválida")
    @DecimalMax(value = "90", message = "Latitude inválida")
    private Double latitude;

    @NotNull(message = "A longitude é obrigatória")
    @DecimalMin(value = "-180", message = "Longitude inválida")
    @DecimalMax(value = "180", message = "Longitude inválida")
    private Double longitude;

    private StatusOcorrencia status;
    private Double prioridade;
    private LocalDate dataAbertura;
    private LocalDate dataResolucao;

    public Long getIdOcorrencia() { return idOcorrencia; }
    public void setIdOcorrencia(Long idOcorrencia) { this.idOcorrencia = idOcorrencia; }

    public Long getIdCidadao() { return idCidadao; }
    public void setIdCidadao(Long idCidadao) { this.idCidadao = idCidadao; }

    public Long getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Long idCategoria) { this.idCategoria = idCategoria; }

    public Long getIdDistrito() { return idDistrito; }
    public void setIdDistrito(Long idDistrito) { this.idDistrito = idDistrito; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public StatusOcorrencia getStatus() { return status; }
    public void setStatus(StatusOcorrencia status) { this.status = status; }

    public Double getPrioridade() { return prioridade; }
    public void setPrioridade(Double prioridade) { this.prioridade = prioridade; }

    public LocalDate getDataAbertura() { return dataAbertura; }
    public void setDataAbertura(LocalDate dataAbertura) { this.dataAbertura = dataAbertura; }

    public LocalDate getDataResolucao() { return dataResolucao; }
    public void setDataResolucao(LocalDate dataResolucao) { this.dataResolucao = dataResolucao; }
}
