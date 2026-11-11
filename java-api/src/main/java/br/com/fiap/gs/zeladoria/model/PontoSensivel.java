package br.com.fiap.gs.zeladoria.model;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Tabela GS_PONTO_SENSIVEL: escola, UBS, creche...
 * Uma ocorrencia a ate 200 m de um ponto sensivel ganha prioridade.
 */
public class PontoSensivel {

    private Long idPontoSensivel;

    @NotNull(message = "O distrito é obrigatório")
    private Long idDistrito;

    @NotBlank(message = "O nome do ponto é obrigatório")
    @Size(max = 100, message = "O nome pode ter no máximo 100 caracteres")
    private String nome;

    @NotNull(message = "O tipo é obrigatório (ESCOLA, CRECHE, UBS, HOSPITAL, ILPI ou TERMINAL)")
    private TipoPonto tipo;

    @NotNull(message = "A latitude é obrigatória")
    @DecimalMin(value = "-90", message = "Latitude inválida")
    @DecimalMax(value = "90", message = "Latitude inválida")
    private Double latitude;

    @NotNull(message = "A longitude é obrigatória")
    @DecimalMin(value = "-180", message = "Longitude inválida")
    @DecimalMax(value = "180", message = "Longitude inválida")
    private Double longitude;

    public Long getIdPontoSensivel() { return idPontoSensivel; }
    public void setIdPontoSensivel(Long idPontoSensivel) { this.idPontoSensivel = idPontoSensivel; }

    public Long getIdDistrito() { return idDistrito; }
    public void setIdDistrito(Long idDistrito) { this.idDistrito = idDistrito; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public TipoPonto getTipo() { return tipo; }
    public void setTipo(TipoPonto tipo) { this.tipo = tipo; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
