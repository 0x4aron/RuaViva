package br.com.fiap.gs.zeladoria.dao;

import br.com.fiap.gs.zeladoria.model.Atendimento;
import br.com.fiap.gs.zeladoria.model.StatusAtendimento;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** Acesso a tabela GS_ATENDIMENTO. */
@Repository
public class AtendimentoDAO {

    private final JdbcTemplate jdbc;

    private final RowMapper<Atendimento> mapper = (rs, i) -> {
        Atendimento a = new Atendimento();
        a.setIdAtendimento(rs.getLong("ID_ATENDIMENTO"));
        a.setIdOcorrencia(rs.getLong("ID_OCORRENCIA"));
        a.setIdEquipe(rs.getLong("ID_EQUIPE"));
        a.setDataAgendada(DaoUtil.paraLocalDate(rs.getDate("DT_AGENDADA")));
        a.setDataExecucao(DaoUtil.paraLocalDate(rs.getDate("DT_EXECUCAO")));
        a.setStatus(StatusAtendimento.valueOf(rs.getString("ST_ATENDIMENTO")));
        a.setObservacao(rs.getString("DS_OBSERVACAO"));
        return a;
    };

    public AtendimentoDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Atendimento> listar() {
        return jdbc.query("SELECT * FROM GS_ATENDIMENTO ORDER BY DT_AGENDADA DESC", mapper);
    }

    public List<Atendimento> listarPorOcorrencia(Long idOcorrencia) {
        return jdbc.query("SELECT * FROM GS_ATENDIMENTO WHERE ID_OCORRENCIA = ? ORDER BY DT_AGENDADA",
                mapper, idOcorrencia);
    }

    public Optional<Atendimento> buscarPorId(Long id) {
        return jdbc.query("SELECT * FROM GS_ATENDIMENTO WHERE ID_ATENDIMENTO = ?", mapper, id)
                .stream().findFirst();
    }

    /** Conta os atendimentos ainda AGENDADOS de uma ocorrencia. */
    public int contarAgendados(Long idOcorrencia) {
        Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM GS_ATENDIMENTO WHERE ID_OCORRENCIA = ? "
                + "AND ST_ATENDIMENTO = 'AGENDADO'", Integer.class, idOcorrencia);
        return total == null ? 0 : total;
    }

    /** Cancela todas as visitas ainda AGENDADAS de uma ocorrencia. */
    public void cancelarAgendados(Long idOcorrencia) {
        jdbc.update("UPDATE GS_ATENDIMENTO SET ST_ATENDIMENTO = 'CANCELADO' "
                + "WHERE ID_OCORRENCIA = ? AND ST_ATENDIMENTO = 'AGENDADO'", idOcorrencia);
    }

    public Long inserir(Atendimento a) {
        return DaoUtil.inserir(jdbc,
                "INSERT INTO GS_ATENDIMENTO (ID_OCORRENCIA, ID_EQUIPE, DT_AGENDADA, DT_EXECUCAO, ST_ATENDIMENTO, "
                        + "DS_OBSERVACAO) VALUES (?, ?, ?, ?, ?, ?)",
                "ID_ATENDIMENTO",
                ps -> {
                    ps.setLong(1, a.getIdOcorrencia());
                    ps.setLong(2, a.getIdEquipe());
                    ps.setDate(3, DaoUtil.paraSql(a.getDataAgendada()));
                    ps.setDate(4, DaoUtil.paraSql(a.getDataExecucao()));
                    ps.setString(5, a.getStatus().name());
                    ps.setString(6, a.getObservacao());
                });
    }

    public void atualizar(Atendimento a) {
        jdbc.update("UPDATE GS_ATENDIMENTO SET ID_EQUIPE = ?, DT_AGENDADA = ?, DT_EXECUCAO = ?, "
                        + "ST_ATENDIMENTO = ?, DS_OBSERVACAO = ? WHERE ID_ATENDIMENTO = ?",
                a.getIdEquipe(), DaoUtil.paraSql(a.getDataAgendada()), DaoUtil.paraSql(a.getDataExecucao()),
                a.getStatus().name(), a.getObservacao(), a.getIdAtendimento());
    }

    public void excluir(Long id) {
        jdbc.update("DELETE FROM GS_ATENDIMENTO WHERE ID_ATENDIMENTO = ?", id);
    }
}
