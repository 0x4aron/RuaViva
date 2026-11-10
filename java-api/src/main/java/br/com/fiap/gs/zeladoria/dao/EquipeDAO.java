package br.com.fiap.gs.zeladoria.dao;

import br.com.fiap.gs.zeladoria.model.Equipe;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Acesso a tabela GS_EQUIPE. */
@Repository
public class EquipeDAO {

    private final JdbcTemplate jdbc;

    private final RowMapper<Equipe> mapper = (rs, i) -> {
        Equipe e = new Equipe();
        e.setIdEquipe(rs.getLong("ID_EQUIPE"));
        e.setIdSubprefeitura(rs.getLong("ID_SUBPREFEITURA"));
        e.setNome(rs.getString("NM_EQUIPE"));
        e.setHorasDia(rs.getInt("NR_HORAS_DIA"));
        e.setLatitude(rs.getDouble("NR_LATITUDE"));
        e.setLongitude(rs.getDouble("NR_LONGITUDE"));
        e.setAtiva(DaoUtil.deFlag(rs.getString("FL_ATIVA")));
        return e;
    };

    public EquipeDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Equipe> listar() {
        return jdbc.query("SELECT * FROM GS_EQUIPE ORDER BY NM_EQUIPE", mapper);
    }

    public Optional<Equipe> buscarPorId(Long id) {
        return jdbc.query("SELECT * FROM GS_EQUIPE WHERE ID_EQUIPE = ?", mapper, id)
                .stream().findFirst();
    }

    public Long inserir(Equipe e) {
        return DaoUtil.inserir(jdbc,
                "INSERT INTO GS_EQUIPE (ID_SUBPREFEITURA, NM_EQUIPE, NR_HORAS_DIA, NR_LATITUDE, NR_LONGITUDE, FL_ATIVA) "
                        + "VALUES (?, ?, ?, ?, ?, ?)",
                "ID_EQUIPE",
                ps -> {
                    ps.setLong(1, e.getIdSubprefeitura());
                    ps.setString(2, e.getNome());
                    ps.setInt(3, e.getHorasDia());
                    ps.setDouble(4, e.getLatitude());
                    ps.setDouble(5, e.getLongitude());
                    ps.setString(6, DaoUtil.paraFlag(e.getAtiva()));
                });
    }

    public void atualizar(Equipe e) {
        jdbc.update("UPDATE GS_EQUIPE SET ID_SUBPREFEITURA = ?, NM_EQUIPE = ?, NR_HORAS_DIA = ?, "
                        + "NR_LATITUDE = ?, NR_LONGITUDE = ?, FL_ATIVA = ? WHERE ID_EQUIPE = ?",
                e.getIdSubprefeitura(), e.getNome(), e.getHorasDia(), e.getLatitude(), e.getLongitude(),
                DaoUtil.paraFlag(e.getAtiva()), e.getIdEquipe());
    }

    public void excluir(Long id) {
        jdbc.update("DELETE FROM GS_EQUIPE WHERE ID_EQUIPE = ?", id);
    }
}
