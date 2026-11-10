package br.com.fiap.gs.zeladoria.dao;

import br.com.fiap.gs.zeladoria.model.Cidadao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Acesso a tabela GS_CIDADAO. */
@Repository
public class CidadaoDAO {

    private final JdbcTemplate jdbc;

    private final RowMapper<Cidadao> mapper = (rs, i) -> {
        Cidadao c = new Cidadao();
        c.setIdCidadao(rs.getLong("ID_CIDADAO"));
        c.setNome(rs.getString("NM_CIDADAO"));
        c.setEmail(rs.getString("DS_EMAIL"));
        c.setTelefone(rs.getString("NR_TELEFONE"));
        c.setPrioritario(DaoUtil.deFlag(rs.getString("FL_PRIORITARIO")));
        c.setDataCadastro(DaoUtil.paraLocalDate(rs.getDate("DT_CADASTRO")));
        return c;
    };

    public CidadaoDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Cidadao> listar() {
        return jdbc.query("SELECT * FROM GS_CIDADAO ORDER BY NM_CIDADAO", mapper);
    }

    public Optional<Cidadao> buscarPorId(Long id) {
        return jdbc.query("SELECT * FROM GS_CIDADAO WHERE ID_CIDADAO = ?", mapper, id)
                .stream().findFirst();
    }

    public Optional<Cidadao> buscarPorEmail(String email) {
        return jdbc.query("SELECT * FROM GS_CIDADAO WHERE LOWER(DS_EMAIL) = LOWER(?)", mapper, email)
                .stream().findFirst();
    }

    public Long inserir(Cidadao c) {
        return DaoUtil.inserir(jdbc,
                "INSERT INTO GS_CIDADAO (NM_CIDADAO, DS_EMAIL, NR_TELEFONE, FL_PRIORITARIO, DT_CADASTRO) "
                        + "VALUES (?, ?, ?, ?, ?)",
                "ID_CIDADAO",
                ps -> {
                    ps.setString(1, c.getNome());
                    ps.setString(2, c.getEmail());
                    ps.setString(3, c.getTelefone());
                    ps.setString(4, DaoUtil.paraFlag(c.getPrioritario()));
                    ps.setDate(5, DaoUtil.paraSql(c.getDataCadastro()));
                });
    }

    public void atualizar(Cidadao c) {
        jdbc.update("UPDATE GS_CIDADAO SET NM_CIDADAO = ?, DS_EMAIL = ?, NR_TELEFONE = ?, FL_PRIORITARIO = ? "
                        + "WHERE ID_CIDADAO = ?",
                c.getNome(), c.getEmail(), c.getTelefone(), DaoUtil.paraFlag(c.getPrioritario()), c.getIdCidadao());
    }

    public void excluir(Long id) {
        jdbc.update("DELETE FROM GS_CIDADAO WHERE ID_CIDADAO = ?", id);
    }
}
