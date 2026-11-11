package br.com.fiap.gs.zeladoria.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Tabela GS_SUBPREFEITURA. */
public class Subprefeitura {

    private Long idSubprefeitura;

    @NotBlank(message = "O nome da subprefeitura é obrigatório")
    @Size(max = 60, message = "O nome pode ter no máximo 60 caracteres")
    private String nome;

    public Long getIdSubprefeitura() { return idSubprefeitura; }
    public void setIdSubprefeitura(Long idSubprefeitura) { this.idSubprefeitura = idSubprefeitura; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}
