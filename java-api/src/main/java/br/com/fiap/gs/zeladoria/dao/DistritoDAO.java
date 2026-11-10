package br.com.fiap.gs.zeladoria.dao;

import br.com.fiap.gs.zeladoria.model.Distrito;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Acesso a tabela GS_DISTRITO. */
@Repository
public class DistritoDAO {

    private final JdbcTemplate jdbc;

    private final RowMapper<Distrito> mapper = (rs, i) -> {
        Distrito d = new Distrito();
        d.setIdDistrito(rs.getLong("ID_DISTRITO"));
        d.setIdSubprefeitura(rs.getLong("ID_SUBPREFEITURA"));
        d.setNome(rs.getString("NM_DISTRITO"));
        return d;
    };

    public DistritoDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Distrito> listar() {
        return jdbc.query("SELECT * FROM GS_DISTRITO ORDER BY NM_DISTRITO", mapper);
    }

    public Optional<Distrito> buscarPorId(Long id) {
        return jdbc.query("SELECT * FROM GS_DISTRITO WHERE ID_DISTRITO = ?", mapper, id)
                .stream().findFirst();
    }

    public Long inserir(Distrito d) {
        return DaoUtil.inserir(jdbc,
                "INSERT INTO GS_DISTRITO (ID_SUBPREFEITURA, NM_DISTRITO) VALUES (?, ?)",
                "ID_DISTRITO",
                ps -> {
                    ps.setLong(1, d.getIdSubprefeitura());
                    ps.setString(2, d.getNome());
                });
    }

    public void atualizar(Distrito d) {
        jdbc.update("UPDATE GS_DISTRITO SET ID_SUBPREFEITURA = ?, NM_DISTRITO = ? WHERE ID_DISTRITO = ?",
                d.getIdSubprefeitura(), d.getNome(), d.getIdDistrito());
    }

    public void excluir(Long id) {
        jdbc.update("DELETE FROM GS_DISTRITO WHERE ID_DISTRITO = ?", id);
    }
}
