package br.com.fiap.gs.zeladoria.bo;

import br.com.fiap.gs.zeladoria.dao.AtendimentoDAO;
import br.com.fiap.gs.zeladoria.dao.EquipeDAO;
import br.com.fiap.gs.zeladoria.exception.RecursoNaoEncontradoException;
import br.com.fiap.gs.zeladoria.exception.RegraNegocioException;
import br.com.fiap.gs.zeladoria.model.Equipe;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EquipeBO {

    private final EquipeDAO dao;
    private final AtendimentoDAO atendimentoDAO;
    private final SubprefeituraBO subprefeituraBO;

    public EquipeBO(EquipeDAO dao, SubprefeituraBO subprefeituraBO, AtendimentoDAO atendimentoDAO) {
        this.dao = dao;
        this.atendimentoDAO = atendimentoDAO;
        this.subprefeituraBO = subprefeituraBO;
    }

    public List<Equipe> listar() {
        return dao.listar();
    }

    public Equipe buscar(Long id) {
        return dao.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Equipe", id));
    }

    Equipe buscarComTrava(Long id) {
        dao.travar(id);
        return buscar(id);
    }

    public Equipe cadastrar(Equipe e) {
        subprefeituraBO.buscar(e.getIdSubprefeitura());
        e.setNome(e.getNome().trim());
        if (e.getAtiva() == null) {
            e.setAtiva(true);
        }
        return buscar(dao.inserir(e));
    }

    @Transactional
    public Equipe atualizar(Long id, Equipe e) {
        Equipe atual = buscarComTrava(id);
        subprefeituraBO.buscar(e.getIdSubprefeitura());
        if (!atual.getIdSubprefeitura().equals(e.getIdSubprefeitura())
                && atendimentoDAO.temOcorrenciaDeOutraSubprefeitura(id, e.getIdSubprefeitura())) {
            throw new RegraNegocioException("A equipe tem visita agendada em distrito de outra subprefeitura. "
                    + "Cancele a visita antes de mudar a subprefeitura da equipe.");
        }
        e.setIdEquipe(id);
        e.setNome(e.getNome().trim());
        if (e.getAtiva() == null) {
            e.setAtiva(atual.getAtiva());
        }
        dao.atualizar(e);
        return buscar(id);
    }

    public void excluir(Long id) {
        buscar(id);
        dao.excluir(id);
    }
}
