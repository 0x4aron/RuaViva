package br.com.fiap.gs.zeladoria.model;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Tabela GS_EQUIPE: equipe de campo da subprefeitura.
 * latitude/longitude = base de onde a equipe sai.
 */
public class Equipe {

    private Long idEquipe;

    @NotNull(message = "A subprefeitura é obrigatória")
    private Long idSubprefeitura;

    @NotBlank(message = "O nome da equipe é obrigatório")
    @Size(max = 60, message = "O nome pode ter no máximo 60 caracteres")
    private String nome;

    @NotNull(message = "As horas por dia são obrigatórias")
    @Min(value = 1, message = "As horas por dia devem ser de 1 a 24")
    @Max(value = 24, message = "As horas por dia devem ser de 1 a 24")
    private Integer horasDia;

    @NotNull(message = "A latitude da base é obrigatória")
    @DecimalMin(value = "-90", message = "Latitude inválida")
    @DecimalMax(value = "90", message = "Latitude inválida")
    private Double latitude;

    @NotNull(message = "A longitude da base é obrigatória")
    @DecimalMin(value = "-180", message = "Longitude inválida")
    @DecimalMax(value = "180", message = "Longitude inválida")
    private Double longitude;

    /** Se nao vier no cadastro, vale true; se nao vier no PUT, mantem o valor atual. */
    private Boolean ativa;

    public Long getIdEquipe() { return idEquipe; }
    public void setIdEquipe(Long idEquipe) { this.idEquipe = idEquipe; }

    public Long getIdSubprefeitura() { return idSubprefeitura; }
    public void setIdSubprefeitura(Long idSubprefeitura) { this.idSubprefeitura = idSubprefeitura; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public Integer getHorasDia() { return horasDia; }
    public void setHorasDia(Integer horasDia) { this.horasDia = horasDia; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Boolean getAtiva() { return ativa; }
    public void setAtiva(Boolean ativa) { this.ativa = ativa; }
}
