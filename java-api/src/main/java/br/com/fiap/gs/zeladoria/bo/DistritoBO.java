package br.com.fiap.gs.zeladoria.bo;

import br.com.fiap.gs.zeladoria.dao.DistritoDAO;
import br.com.fiap.gs.zeladoria.exception.RecursoNaoEncontradoException;
import br.com.fiap.gs.zeladoria.model.Distrito;
import org.springframework.stereotype.Service;

import java.util.List;

/** Regras de negocio de Distrito. */
@Service
public class DistritoBO {

    private final DistritoDAO dao;
    private final SubprefeituraBO subprefeituraBO;

    public DistritoBO(DistritoDAO dao, SubprefeituraBO subprefeituraBO) {
        this.dao = dao;
        this.subprefeituraBO = subprefeituraBO;
    }

    public List<Distrito> listar() {
        return dao.listar();
    }

    public Distrito buscar(Long id) {
        return dao.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Distrito", id));
    }

    public Distrito cadastrar(Distrito d) {
        subprefeituraBO.buscar(d.getIdSubprefeitura()); // a subprefeitura precisa existir
        d.setNome(d.getNome().trim().toUpperCase());
        return buscar(dao.inserir(d));
    }

    public Distrito atualizar(Long id, Distrito d) {
        buscar(id);
        subprefeituraBO.buscar(d.getIdSubprefeitura());
        d.setIdDistrito(id);
        d.setNome(d.getNome().trim().toUpperCase());
        dao.atualizar(d);
        return buscar(id);
    }

    public void excluir(Long id) {
        buscar(id);
        dao.excluir(id);
    }
}
