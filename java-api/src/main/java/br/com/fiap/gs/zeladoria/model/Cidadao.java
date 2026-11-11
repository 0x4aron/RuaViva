package br.com.fiap.gs.zeladoria.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Tabela GS_CIDADAO: quem registra e apoia ocorrencias.
 * prioritario = true para idoso ou pessoa com deficiencia (aumenta a prioridade).
 */
public class Cidadao {

    private Long idCidadao;

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 100, message = "O nome pode ter no máximo 100 caracteres")
    private String nome;

    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Email inválido")
    @Size(max = 120, message = "O email pode ter no máximo 120 caracteres")
    private String email;

    @Size(max = 20, message = "O telefone pode ter no máximo 20 caracteres")
    private String telefone;

    /** Se nao vier no cadastro, vale false; se nao vier no PUT, mantem o valor atual. */
    private Boolean prioritario;

    /** Preenchida pelo sistema no cadastro. */
    private LocalDate dataCadastro;

    public Long getIdCidadao() { return idCidadao; }
    public void setIdCidadao(Long idCidadao) { this.idCidadao = idCidadao; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public Boolean getPrioritario() { return prioritario; }
    public void setPrioritario(Boolean prioritario) { this.prioritario = prioritario; }

    public LocalDate getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDate dataCadastro) { this.dataCadastro = dataCadastro; }
}
