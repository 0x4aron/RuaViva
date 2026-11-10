package br.com.fiap.gs.zeladoria.dao;

import br.com.fiap.gs.zeladoria.model.Subprefeitura;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Acesso a tabela GS_SUBPREFEITURA. */
@Repository
public class SubprefeituraDAO {

    private final JdbcTemplate jdbc;

    // Converte uma linha do banco em objeto Java
    private final RowMapper<Subprefeitura> mapper = (rs, i) -> {
        Subprefeitura s = new Subprefeitura();
        s.setIdSubprefeitura(rs.getLong("ID_SUBPREFEITURA"));
        s.setNome(rs.getString("NM_SUBPREFEITURA"));
        return s;
    };

    public SubprefeituraDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Subprefeitura> listar() {
        return jdbc.query("SELECT * FROM GS_SUBPREFEITURA ORDER BY NM_SUBPREFEITURA", mapper);
    }

    public Optional<Subprefeitura> buscarPorId(Long id) {
        return jdbc.query("SELECT * FROM GS_SUBPREFEITURA WHERE ID_SUBPREFEITURA = ?", mapper, id)
                .stream().findFirst();
    }

    public Long inserir(Subprefeitura s) {
        return DaoUtil.inserir(jdbc,
                "INSERT INTO GS_SUBPREFEITURA (NM_SUBPREFEITURA) VALUES (?)",
                "ID_SUBPREFEITURA",
                ps -> ps.setString(1, s.getNome()));
    }

    public void atualizar(Subprefeitura s) {
        jdbc.update("UPDATE GS_SUBPREFEITURA SET NM_SUBPREFEITURA = ? WHERE ID_SUBPREFEITURA = ?",
                s.getNome(), s.getIdSubprefeitura());
    }

    public void excluir(Long id) {
        jdbc.update("DELETE FROM GS_SUBPREFEITURA WHERE ID_SUBPREFEITURA = ?", id);
    }
}
