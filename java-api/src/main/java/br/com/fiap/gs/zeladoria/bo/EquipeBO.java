package br.com.fiap.gs.zeladoria.bo;

import br.com.fiap.gs.zeladoria.dao.EquipeDAO;
import br.com.fiap.gs.zeladoria.exception.RecursoNaoEncontradoException;
import br.com.fiap.gs.zeladoria.model.Equipe;
import org.springframework.stereotype.Service;

import java.util.List;

/** Regras de negocio de Equipe. */
@Service
public class EquipeBO {

    private final EquipeDAO dao;
    private final SubprefeituraBO subprefeituraBO;

    public EquipeBO(EquipeDAO dao, SubprefeituraBO subprefeituraBO) {
        this.dao = dao;
        this.subprefeituraBO = subprefeituraBO;
    }

    public List<Equipe> listar() {
        return dao.listar();
    }

    public Equipe buscar(Long id) {
        return dao.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Equipe", id));
    }

    public Equipe cadastrar(Equipe e) {
        subprefeituraBO.buscar(e.getIdSubprefeitura());
        e.setNome(e.getNome().trim());
        if (e.getAtiva() == null) {
            e.setAtiva(true);
        }
        return buscar(dao.inserir(e));
    }

    public Equipe atualizar(Long id, Equipe e) {
        Equipe atual = buscar(id);
        subprefeituraBO.buscar(e.getIdSubprefeitura());
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
