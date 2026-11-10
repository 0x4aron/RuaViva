package br.com.fiap.gs.zeladoria.bo;

import br.com.fiap.gs.zeladoria.dao.SubprefeituraDAO;
import br.com.fiap.gs.zeladoria.exception.RecursoNaoEncontradoException;
import br.com.fiap.gs.zeladoria.model.Subprefeitura;
import org.springframework.stereotype.Service;

import java.util.List;

/** Regras de negocio de Subprefeitura. */
@Service
public class SubprefeituraBO {

    private final SubprefeituraDAO dao;

    public SubprefeituraBO(SubprefeituraDAO dao) {
        this.dao = dao;
    }

    public List<Subprefeitura> listar() {
        return dao.listar();
    }

    public Subprefeitura buscar(Long id) {
        return dao.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Subprefeitura", id));
    }

    public Subprefeitura cadastrar(Subprefeitura s) {
        s.setNome(s.getNome().trim().toUpperCase());
        return buscar(dao.inserir(s));
    }

    public Subprefeitura atualizar(Long id, Subprefeitura s) {
        buscar(id);
        s.setIdSubprefeitura(id);
        s.setNome(s.getNome().trim().toUpperCase());
        dao.atualizar(s);
        return buscar(id);
    }

    public void excluir(Long id) {
        buscar(id);
        dao.excluir(id);
    }
}
