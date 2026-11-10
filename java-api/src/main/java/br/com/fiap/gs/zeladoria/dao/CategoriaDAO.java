package br.com.fiap.gs.zeladoria.dao;

import br.com.fiap.gs.zeladoria.model.Categoria;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Acesso a tabela GS_CATEGORIA. */
@Repository
public class CategoriaDAO {

    private final JdbcTemplate jdbc;

    private final RowMapper<Categoria> mapper = (rs, i) -> {
        Categoria c = new Categoria();
        c.setIdCategoria(rs.getLong("ID_CATEGORIA"));
        c.setNome(rs.getString("NM_CATEGORIA"));
        c.setDescricao(rs.getString("DS_CATEGORIA"));
        c.setPrazoDias(rs.getInt("NR_PRAZO_DIAS"));
        c.setPesoGravidade(rs.getInt("NR_PESO_GRAVIDADE"));
        c.setHorasEstimadas(rs.getInt("NR_HORAS_ESTIMADAS"));
        return c;
    };

    public CategoriaDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Categoria> listar() {
        return jdbc.query("SELECT * FROM GS_CATEGORIA ORDER BY NM_CATEGORIA", mapper);
    }

    public Optional<Categoria> buscarPorId(Long id) {
        return jdbc.query("SELECT * FROM GS_CATEGORIA WHERE ID_CATEGORIA = ?", mapper, id)
                .stream().findFirst();
    }

    public Long inserir(Categoria c) {
        return DaoUtil.inserir(jdbc,
                "INSERT INTO GS_CATEGORIA (NM_CATEGORIA, DS_CATEGORIA, NR_PRAZO_DIAS, NR_PESO_GRAVIDADE, NR_HORAS_ESTIMADAS) "
                        + "VALUES (?, ?, ?, ?, ?)",
                "ID_CATEGORIA",
                ps -> {
                    ps.setString(1, c.getNome());
                    ps.setString(2, c.getDescricao());
                    ps.setInt(3, c.getPrazoDias());
                    ps.setInt(4, c.getPesoGravidade());
                    ps.setInt(5, c.getHorasEstimadas());
                });
    }

    public void atualizar(Categoria c) {
        jdbc.update("UPDATE GS_CATEGORIA SET NM_CATEGORIA = ?, DS_CATEGORIA = ?, NR_PRAZO_DIAS = ?, "
                        + "NR_PESO_GRAVIDADE = ?, NR_HORAS_ESTIMADAS = ? WHERE ID_CATEGORIA = ?",
                c.getNome(), c.getDescricao(), c.getPrazoDias(), c.getPesoGravidade(),
                c.getHorasEstimadas(), c.getIdCategoria());
    }

    public void excluir(Long id) {
        jdbc.update("DELETE FROM GS_CATEGORIA WHERE ID_CATEGORIA = ?", id);
    }
}
