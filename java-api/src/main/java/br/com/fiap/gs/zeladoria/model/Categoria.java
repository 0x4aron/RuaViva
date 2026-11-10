package br.com.fiap.gs.zeladoria.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Tabela GS_CATEGORIA: tipo de problema (tapa-buraco, entulho...).
 * O peso de gravidade (1 a 5) e definido pelo gestor e entra no calculo da prioridade.
 */
public class Categoria {

    private Long idCategoria;

    @NotBlank(message = "O nome da categoria e obrigatorio")
    @Size(max = 80, message = "O nome pode ter no maximo 80 caracteres")
    private String nome;

    @Size(max = 255, message = "A descricao pode ter no maximo 255 caracteres")
    private String descricao;

    @NotNull(message = "O prazo em dias e obrigatorio")
    @Min(value = 1, message = "O prazo deve ser de pelo menos 1 dia")
    @Max(value = 999, message = "O prazo pode ser de no maximo 999 dias")
    private Integer prazoDias;

    @NotNull(message = "O peso de gravidade e obrigatorio")
    @Min(value = 1, message = "O peso deve ser de 1 a 5")
    @Max(value = 5, message = "O peso deve ser de 1 a 5")
    private Integer pesoGravidade;

    @NotNull(message = "As horas estimadas sao obrigatorias")
    @Min(value = 1, message = "As horas estimadas devem ser pelo menos 1")
    @Max(value = 999, message = "As horas estimadas podem ser no maximo 999")
    private Integer horasEstimadas;

    public Long getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Long idCategoria) { this.idCategoria = idCategoria; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Integer getPrazoDias() { return prazoDias; }
    public void setPrazoDias(Integer prazoDias) { this.prazoDias = prazoDias; }

    public Integer getPesoGravidade() { return pesoGravidade; }
    public void setPesoGravidade(Integer pesoGravidade) { this.pesoGravidade = pesoGravidade; }

    public Integer getHorasEstimadas() { return horasEstimadas; }
    public void setHorasEstimadas(Integer horasEstimadas) { this.horasEstimadas = horasEstimadas; }
}
