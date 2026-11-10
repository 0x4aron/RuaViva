package br.com.fiap.gs.zeladoria.dao;

import br.com.fiap.gs.zeladoria.model.Ocorrencia;
import br.com.fiap.gs.zeladoria.model.StatusOcorrencia;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Acesso a tabela GS_OCORRENCIA. */
@Repository
public class OcorrenciaDAO {

    private final JdbcTemplate jdbc;

    private final RowMapper<Ocorrencia> mapper = (rs, i) -> {
        Ocorrencia o = new Ocorrencia();
        o.setIdOcorrencia(rs.getLong("ID_OCORRENCIA"));
        o.setIdCidadao(rs.getLong("ID_CIDADAO"));
        o.setIdCategoria(rs.getLong("ID_CATEGORIA"));
        o.setIdDistrito(rs.getLong("ID_DISTRITO"));
        o.setDescricao(rs.getString("DS_OCORRENCIA"));
        o.setLogradouro(rs.getString("DS_LOGRADOURO"));
        o.setNumero(rs.getString("NR_ENDERECO"));
        o.setLatitude(rs.getDouble("NR_LATITUDE"));
        o.setLongitude(rs.getDouble("NR_LONGITUDE"));
        o.setStatus(StatusOcorrencia.valueOf(rs.getString("ST_OCORRENCIA")));
        o.setPrioridade(rs.getDouble("NR_PRIORIDADE"));
        o.setDataAbertura(DaoUtil.paraLocalDate(rs.getDate("DT_ABERTURA")));
        o.setDataResolucao(DaoUtil.paraLocalDate(rs.getDate("DT_RESOLUCAO")));
        return o;
    };

    public OcorrenciaDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Ocorrencia> listar() {
        return jdbc.query("SELECT * FROM GS_OCORRENCIA ORDER BY NR_PRIORIDADE DESC, DT_ABERTURA", mapper);
    }

    public List<Ocorrencia> listarPorStatus(StatusOcorrencia status) {
        return jdbc.query("SELECT * FROM GS_OCORRENCIA WHERE ST_OCORRENCIA = ? "
                + "ORDER BY NR_PRIORIDADE DESC, DT_ABERTURA", mapper, status.name());
    }

    /**
     * Fila do gestor: ocorrencias ABERTAS sem atendimento valido (mesma ideia da consulta 3 do DQL).
     * Atendimentos CANCELADOS nao contam, entao a ocorrencia volta para a fila.
     */
    public List<Ocorrencia> listarFilaSemAtendimento() {
        return jdbc.query("SELECT o.* FROM GS_OCORRENCIA o "
                + "LEFT OUTER JOIN GS_ATENDIMENTO a ON a.ID_OCORRENCIA = o.ID_OCORRENCIA "
                + "AND a.ST_ATENDIMENTO <> 'CANCELADO' "
                + "WHERE o.ST_OCORRENCIA = 'ABERTA' AND a.ID_ATENDIMENTO IS NULL "
                + "ORDER BY o.NR_PRIORIDADE DESC, o.DT_ABERTURA", mapper);
    }

    public Optional<Ocorrencia> buscarPorId(Long id) {
        return jdbc.query("SELECT * FROM GS_OCORRENCIA WHERE ID_OCORRENCIA = ?", mapper, id)
                .stream().findFirst();
    }

    public Long inserir(Ocorrencia o) {
        return DaoUtil.inserir(jdbc,
                "INSERT INTO GS_OCORRENCIA (ID_CIDADAO, ID_CATEGORIA, ID_DISTRITO, DS_OCORRENCIA, DS_LOGRADOURO, "
                        + "NR_ENDERECO, NR_LATITUDE, NR_LONGITUDE, ST_OCORRENCIA, NR_PRIORIDADE, DT_ABERTURA, DT_RESOLUCAO) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                "ID_OCORRENCIA",
                ps -> {
                    ps.setLong(1, o.getIdCidadao());
                    ps.setLong(2, o.getIdCategoria());
                    ps.setLong(3, o.getIdDistrito());
                    ps.setString(4, o.getDescricao());
                    ps.setString(5, o.getLogradouro());
                    ps.setString(6, o.getNumero());
                    ps.setDouble(7, o.getLatitude());
                    ps.setDouble(8, o.getLongitude());
                    ps.setString(9, o.getStatus().name());
                    ps.setDouble(10, o.getPrioridade());
                    ps.setDate(11, DaoUtil.paraSql(o.getDataAbertura()));
                    ps.setDate(12, DaoUtil.paraSql(o.getDataResolucao()));
                });
    }

    public void atualizar(Ocorrencia o) {
        jdbc.update("UPDATE GS_OCORRENCIA SET ID_CATEGORIA = ?, ID_DISTRITO = ?, DS_OCORRENCIA = ?, "
                        + "DS_LOGRADOURO = ?, NR_ENDERECO = ?, NR_LATITUDE = ?, NR_LONGITUDE = ?, ST_OCORRENCIA = ?, "
                        + "NR_PRIORIDADE = ?, DT_RESOLUCAO = ? WHERE ID_OCORRENCIA = ?",
                o.getIdCategoria(), o.getIdDistrito(), o.getDescricao(), o.getLogradouro(), o.getNumero(),
                o.getLatitude(), o.getLongitude(), o.getStatus().name(), o.getPrioridade(),
                DaoUtil.paraSql(o.getDataResolucao()), o.getIdOcorrencia());
    }

    /**
     * Trava a linha da ocorrencia ate o fim da transacao (SELECT ... FOR UPDATE).
     * Evita que dois apoios ao mesmo tempo calculem a prioridade com a contagem errada.
     */
    public void travar(Long id) {
        jdbc.queryForList("SELECT ID_OCORRENCIA FROM GS_OCORRENCIA WHERE ID_OCORRENCIA = ? FOR UPDATE", id);
    }

    public void atualizarPrioridade(Long id, double prioridade) {
        jdbc.update("UPDATE GS_OCORRENCIA SET NR_PRIORIDADE = ? WHERE ID_OCORRENCIA = ?", prioridade, id);
    }

    /** Apaga a ocorrencia; apoios e atendimentos sao apagados juntos (ON DELETE CASCADE). */
    public void excluir(Long id) {
        jdbc.update("DELETE FROM GS_OCORRENCIA WHERE ID_OCORRENCIA = ?", id);
    }
}
