package br.com.fiap.gs.zeladoria.bo;

import br.com.fiap.gs.zeladoria.dao.CategoriaDAO;
import br.com.fiap.gs.zeladoria.dto.ReguaPesoDTO;
import br.com.fiap.gs.zeladoria.exception.RecursoNaoEncontradoException;
import br.com.fiap.gs.zeladoria.model.Categoria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Regras de negocio de Categoria. */
@Service
public class CategoriaBO {

    /** Regua sugerida ao gestor para escolher o peso (nao e obrigatoria). */
    private static final List<ReguaPesoDTO> REGUA_PESO = List.of(
            new ReguaPesoDTO(5, "Impede a passagem ou põe a pessoa em risco imediato",
                    "Calçada que um cadeirante não consegue usar, fiação solta"),
            new ReguaPesoDTO(4, "Risco de acidente, alagamento ou doença",
                    "Buraco no asfalto, bueiro entupido"),
            new ReguaPesoDTO(3, "Obstrui a via ou deixa o local insalubre",
                    "Entulho, guia ou sarjeta quebrada"),
            new ReguaPesoDTO(2, "Afeta a limpeza e o conforto",
                    "Falta de varrição"),
            new ReguaPesoDTO(1, "Mobiliário urbano, sem risco",
                    "Lixeira quebrada"));

    private final CategoriaDAO dao;
    private final OcorrenciaBO ocorrenciaBO;

    public CategoriaBO(CategoriaDAO dao, OcorrenciaBO ocorrenciaBO) {
        this.dao = dao;
        this.ocorrenciaBO = ocorrenciaBO;
    }

    public List<Categoria> listar() {
        return dao.listar();
    }

    public Categoria buscar(Long id) {
        return dao.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", id));
    }

    public List<ReguaPesoDTO> reguaPeso() {
        return REGUA_PESO;
    }

    public Categoria cadastrar(Categoria c) {
        c.setNome(c.getNome().trim());
        return buscar(dao.inserir(c));
    }

    @Transactional
    public Categoria atualizar(Long id, Categoria c) {
        Categoria atual = buscar(id);
        c.setIdCategoria(id);
        c.setNome(c.getNome().trim());
        dao.atualizar(c);

        // O peso entra no calculo da prioridade: se mudou, recalcula as ocorrencias pendentes
        if (!c.getPesoGravidade().equals(atual.getPesoGravidade())) {
            ocorrenciaBO.recalcularPrioridadeDasPendentes();
        }
        return buscar(id);
    }

    public void excluir(Long id) {
        buscar(id);
        dao.excluir(id);
    }
}
