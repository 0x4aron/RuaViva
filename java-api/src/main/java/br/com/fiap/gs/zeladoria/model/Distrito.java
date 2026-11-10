package br.com.fiap.gs.zeladoria.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Tabela GS_DISTRITO. Cada distrito pertence a uma subprefeitura. */
public class Distrito {

    private Long idDistrito;

    @NotNull(message = "A subprefeitura e obrigatoria")
    private Long idSubprefeitura;

    @NotBlank(message = "O nome do distrito e obrigatorio")
    @Size(max = 60, message = "O nome pode ter no maximo 60 caracteres")
    private String nome;

    public Long getIdDistrito() { return idDistrito; }
    public void setIdDistrito(Long idDistrito) { this.idDistrito = idDistrito; }

    public Long getIdSubprefeitura() { return idSubprefeitura; }
    public void setIdSubprefeitura(Long idSubprefeitura) { this.idSubprefeitura = idSubprefeitura; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}
