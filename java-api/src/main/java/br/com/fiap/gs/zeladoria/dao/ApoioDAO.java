package br.com.fiap.gs.zeladoria.dao;

import br.com.fiap.gs.zeladoria.model.Apoio;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Acesso a tabela GS_APOIO. */
@Repository
public class ApoioDAO {

    private final JdbcTemplate jdbc;

    private final RowMapper<Apoio> mapper = (rs, i) -> {
        Apoio a = new Apoio();
        a.setIdApoio(rs.getLong("ID_APOIO"));
        a.setIdOcorrencia(rs.getLong("ID_OCORRENCIA"));
        a.setIdCidadao(rs.getLong("ID_CIDADAO"));
        a.setDataApoio(DaoUtil.paraLocalDate(rs.getDate("DT_APOIO")));
        return a;
    };

    public ApoioDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Apoio> listar() {
        return jdbc.query("SELECT * FROM GS_APOIO ORDER BY ID_APOIO", mapper);
    }

    public List<Apoio> listarPorOcorrencia(Long idOcorrencia) {
        return jdbc.query("SELECT * FROM GS_APOIO WHERE ID_OCORRENCIA = ? ORDER BY DT_APOIO", mapper, idOcorrencia);
    }

    public Optional<Apoio> buscarPorId(Long id) {
        return jdbc.query("SELECT * FROM GS_APOIO WHERE ID_APOIO = ?", mapper, id)
                .stream().findFirst();
    }

    public boolean existe(Long idOcorrencia, Long idCidadao) {
        Integer total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM GS_APOIO WHERE ID_OCORRENCIA = ? AND ID_CIDADAO = ?",
                Integer.class, idOcorrencia, idCidadao);
        return total != null && total > 0;
    }

    public int contarPorOcorrencia(Long idOcorrencia) {
        Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM GS_APOIO WHERE ID_OCORRENCIA = ?",
                Integer.class, idOcorrencia);
        return total == null ? 0 : total;
    }

    public Long inserir(Apoio a) {
        return DaoUtil.inserir(jdbc,
                "INSERT INTO GS_APOIO (ID_OCORRENCIA, ID_CIDADAO, DT_APOIO) VALUES (?, ?, ?)",
                "ID_APOIO",
                ps -> {
                    ps.setLong(1, a.getIdOcorrencia());
                    ps.setLong(2, a.getIdCidadao());
                    ps.setDate(3, DaoUtil.paraSql(a.getDataApoio()));
                });
    }

    public void excluir(Long id) {
        jdbc.update("DELETE FROM GS_APOIO WHERE ID_APOIO = ?", id);
    }
}
