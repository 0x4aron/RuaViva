package br.com.fiap.gs.zeladoria.dao;

import br.com.fiap.gs.zeladoria.model.Atendimento;
import br.com.fiap.gs.zeladoria.model.StatusAtendimento;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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

    public int contarAgendados(Long idOcorrencia) {
        Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM GS_ATENDIMENTO WHERE ID_OCORRENCIA = ? "
                + "AND ST_ATENDIMENTO = 'AGENDADO'", Integer.class, idOcorrencia);
        return total == null ? 0 : total;
    }

    public boolean temEquipeDeOutraSubprefeitura(Long idOcorrencia, Long idSubprefeitura) {
        Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM GS_ATENDIMENTO a "
                + "JOIN GS_EQUIPE e ON e.ID_EQUIPE = a.ID_EQUIPE "
                + "WHERE a.ID_OCORRENCIA = ? AND a.ST_ATENDIMENTO = 'AGENDADO' "
                + "AND e.ID_SUBPREFEITURA <> ?", Integer.class, idOcorrencia, idSubprefeitura);
        return total != null && total > 0;
    }

    public boolean temOcorrenciaDeOutraSubprefeitura(Long idEquipe, Long idSubprefeitura) {
        Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM GS_ATENDIMENTO a "
                + "JOIN GS_OCORRENCIA o ON o.ID_OCORRENCIA = a.ID_OCORRENCIA "
                + "JOIN GS_DISTRITO d ON d.ID_DISTRITO = o.ID_DISTRITO "
                + "WHERE a.ID_EQUIPE = ? AND a.ST_ATENDIMENTO = 'AGENDADO' "
                + "AND d.ID_SUBPREFEITURA <> ?", Integer.class, idEquipe, idSubprefeitura);
        return total != null && total > 0;
    }

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
