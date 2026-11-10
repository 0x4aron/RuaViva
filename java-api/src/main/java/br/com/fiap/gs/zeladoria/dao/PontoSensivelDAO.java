package br.com.fiap.gs.zeladoria.dao;

import br.com.fiap.gs.zeladoria.model.PontoSensivel;
import br.com.fiap.gs.zeladoria.model.TipoPonto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Acesso a tabela GS_PONTO_SENSIVEL. */
@Repository
public class PontoSensivelDAO {

    private final JdbcTemplate jdbc;

    private final RowMapper<PontoSensivel> mapper = (rs, i) -> {
        PontoSensivel p = new PontoSensivel();
        p.setIdPontoSensivel(rs.getLong("ID_PONTO_SENSIVEL"));
        p.setIdDistrito(rs.getLong("ID_DISTRITO"));
        p.setNome(rs.getString("NM_PONTO"));
        p.setTipo(TipoPonto.valueOf(rs.getString("TP_PONTO")));
        p.setLatitude(rs.getDouble("NR_LATITUDE"));
        p.setLongitude(rs.getDouble("NR_LONGITUDE"));
        return p;
    };

    public PontoSensivelDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<PontoSensivel> listar() {
        return jdbc.query("SELECT * FROM GS_PONTO_SENSIVEL ORDER BY NM_PONTO", mapper);
    }

    public Optional<PontoSensivel> buscarPorId(Long id) {
        return jdbc.query("SELECT * FROM GS_PONTO_SENSIVEL WHERE ID_PONTO_SENSIVEL = ?", mapper, id)
                .stream().findFirst();
    }

    public Long inserir(PontoSensivel p) {
        return DaoUtil.inserir(jdbc,
                "INSERT INTO GS_PONTO_SENSIVEL (ID_DISTRITO, NM_PONTO, TP_PONTO, NR_LATITUDE, NR_LONGITUDE) "
                        + "VALUES (?, ?, ?, ?, ?)",
                "ID_PONTO_SENSIVEL",
                ps -> {
                    ps.setLong(1, p.getIdDistrito());
                    ps.setString(2, p.getNome());
                    ps.setString(3, p.getTipo().name());
                    ps.setDouble(4, p.getLatitude());
                    ps.setDouble(5, p.getLongitude());
                });
    }

    public void atualizar(PontoSensivel p) {
        jdbc.update("UPDATE GS_PONTO_SENSIVEL SET ID_DISTRITO = ?, NM_PONTO = ?, TP_PONTO = ?, "
                        + "NR_LATITUDE = ?, NR_LONGITUDE = ? WHERE ID_PONTO_SENSIVEL = ?",
                p.getIdDistrito(), p.getNome(), p.getTipo().name(), p.getLatitude(), p.getLongitude(),
                p.getIdPontoSensivel());
    }

    public void excluir(Long id) {
        jdbc.update("DELETE FROM GS_PONTO_SENSIVEL WHERE ID_PONTO_SENSIVEL = ?", id);
    }
}
