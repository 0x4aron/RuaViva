package br.com.fiap.gs.zeladoria.bo;

import br.com.fiap.gs.zeladoria.dao.AtendimentoDAO;
import br.com.fiap.gs.zeladoria.dao.OcorrenciaDAO;
import br.com.fiap.gs.zeladoria.exception.RecursoNaoEncontradoException;
import br.com.fiap.gs.zeladoria.exception.RegraNegocioException;
import br.com.fiap.gs.zeladoria.model.Atendimento;
import br.com.fiap.gs.zeladoria.model.Equipe;
import br.com.fiap.gs.zeladoria.model.Ocorrencia;
import br.com.fiap.gs.zeladoria.model.StatusAtendimento;
import br.com.fiap.gs.zeladoria.model.StatusOcorrencia;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Regras de negocio do atendimento (visita da equipe).
 *  - agendar um atendimento coloca a ocorrencia EM_ANDAMENTO;
 *  - concluir o atendimento marca a ocorrencia como RESOLVIDA (e cancela outras visitas agendadas);
 *  - cancelar ou excluir o unico agendamento devolve a ocorrencia para ABERTA;
 *  - atendimento CONCLUIDO ou CANCELADO e historico: nao pode mais ser alterado.
 */
@Service
public class AtendimentoBO {

    private final AtendimentoDAO dao;
    private final OcorrenciaDAO ocorrenciaDAO;
    private final OcorrenciaBO ocorrenciaBO;
    private final EquipeBO equipeBO;

    public AtendimentoBO(AtendimentoDAO dao, OcorrenciaDAO ocorrenciaDAO, OcorrenciaBO ocorrenciaBO, EquipeBO equipeBO) {
        this.dao = dao;
        this.ocorrenciaDAO = ocorrenciaDAO;
        this.ocorrenciaBO = ocorrenciaBO;
        this.equipeBO = equipeBO;
    }

    public List<Atendimento> listar(Long idOcorrencia) {
        return idOcorrencia == null ? dao.listar() : dao.listarPorOcorrencia(idOcorrencia);
    }

    public Atendimento buscar(Long id) {
        return dao.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Atendimento", id));
    }

    @Transactional
    public Atendimento cadastrar(Atendimento a) {
        Ocorrencia ocorrencia = ocorrenciaBO.buscar(a.getIdOcorrencia());
        validarOcorrenciaPendente(ocorrencia);
        validarEquipeAtiva(a.getIdEquipe());
        validarDataAgendada(a, ocorrencia);

        a.setStatus(StatusAtendimento.AGENDADO);
        a.setDataExecucao(null);
        Long id = dao.inserir(a);

        if (ocorrencia.getStatus() == StatusOcorrencia.ABERTA) {
            ocorrencia.setStatus(StatusOcorrencia.EM_ANDAMENTO);
            ocorrenciaDAO.atualizar(ocorrencia);
        }
        return buscar(id);
    }

    /**
     * So atendimentos AGENDADOS podem ser alterados: trocar equipe, data e observacao,
     * concluir (status CONCLUIDO) ou cancelar (status CANCELADO).
     */
    @Transactional
    public Atendimento atualizar(Long id, Atendimento dados) {
        Atendimento atual = buscar(id);
        if (atual.getStatus() != StatusAtendimento.AGENDADO) {
            throw new RegraNegocioException("Atendimento " + atual.getStatus()
                    + " faz parte do historico e nao pode ser alterado");
        }
        Ocorrencia ocorrencia = ocorrenciaBO.buscar(atual.getIdOcorrencia());

        dados.setIdAtendimento(id);
        dados.setIdOcorrencia(atual.getIdOcorrencia()); // o atendimento nao muda de ocorrencia
        if (!dados.getIdEquipe().equals(atual.getIdEquipe())) {
            validarEquipeAtiva(dados.getIdEquipe());
        }
        if (dados.getStatus() == null) {
            dados.setStatus(StatusAtendimento.AGENDADO);
        }

        switch (dados.getStatus()) {
            case AGENDADO -> {
                validarDataAgendada(dados, ocorrencia);
                dados.setDataExecucao(null);
                dao.atualizar(dados);
            }
            case CONCLUIDO -> {
                if (dados.getDataExecucao() == null) {
                    dados.setDataExecucao(Datas.hoje());
                }
                // Se a equipe resolveu antes do dia marcado, a data agendada passa a ser o dia da execucao
                if (dados.getDataExecucao().isBefore(dados.getDataAgendada())) {
                    dados.setDataAgendada(dados.getDataExecucao());
                }
                validarDataAgendada(dados, ocorrencia);
                dao.atualizar(dados);
                dao.cancelarAgendados(ocorrencia.getIdOcorrencia());

                ocorrencia.setStatus(StatusOcorrencia.RESOLVIDA);
                ocorrencia.setDataResolucao(dados.getDataExecucao());
                ocorrenciaDAO.atualizar(ocorrencia);
            }
            case CANCELADO -> {
                dados.setDataExecucao(null);
                dao.atualizar(dados);
                voltarParaAbertaSeSemAgendamento(ocorrencia);
            }
        }
        return buscar(id);
    }

    @Transactional
    public void excluir(Long id) {
        Atendimento atendimento = buscar(id);
        if (atendimento.getStatus() == StatusAtendimento.CONCLUIDO) {
            throw new RegraNegocioException("Atendimento concluido faz parte do historico e nao pode ser excluido");
        }
        dao.excluir(id);
        voltarParaAbertaSeSemAgendamento(ocorrenciaBO.buscar(atendimento.getIdOcorrencia()));
    }

    // Se a ocorrencia estava EM_ANDAMENTO e nao sobrou visita agendada, ela volta a ser ABERTA (e para a fila)
    private void voltarParaAbertaSeSemAgendamento(Ocorrencia ocorrencia) {
        if (ocorrencia.getStatus() == StatusOcorrencia.EM_ANDAMENTO
                && dao.contarAgendados(ocorrencia.getIdOcorrencia()) == 0) {
            ocorrencia.setStatus(StatusOcorrencia.ABERTA);
            ocorrenciaDAO.atualizar(ocorrencia);
        }
    }

    private void validarOcorrenciaPendente(Ocorrencia ocorrencia) {
        if (ocorrencia.getStatus() != StatusOcorrencia.ABERTA && ocorrencia.getStatus() != StatusOcorrencia.EM_ANDAMENTO) {
            throw new RegraNegocioException("So e possivel agendar atendimento para ocorrencias abertas ou em andamento");
        }
    }

    private void validarEquipeAtiva(Long idEquipe) {
        Equipe equipe = equipeBO.buscar(idEquipe);
        if (!equipe.getAtiva()) {
            throw new RegraNegocioException("A equipe " + equipe.getNome() + " esta inativa");
        }
    }

    private void validarDataAgendada(Atendimento a, Ocorrencia ocorrencia) {
        if (a.getDataAgendada().isBefore(ocorrencia.getDataAbertura())) {
            throw new RegraNegocioException("A data agendada nao pode ser anterior a abertura da ocorrencia ("
                    + ocorrencia.getDataAbertura() + ")");
        }
    }
}
