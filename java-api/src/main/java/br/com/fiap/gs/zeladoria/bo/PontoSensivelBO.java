package br.com.fiap.gs.zeladoria.bo;

import br.com.fiap.gs.zeladoria.dao.PontoSensivelDAO;
import br.com.fiap.gs.zeladoria.exception.RecursoNaoEncontradoException;
import br.com.fiap.gs.zeladoria.model.PontoSensivel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Regras de negocio de Ponto sensivel.
 * Como os pontos influenciam a prioridade, toda mudanca recalcula as ocorrencias em aberto.
 */
@Service
public class PontoSensivelBO {

    private final PontoSensivelDAO dao;
    private final DistritoBO distritoBO;
    private final OcorrenciaBO ocorrenciaBO;

    public PontoSensivelBO(PontoSensivelDAO dao, DistritoBO distritoBO, OcorrenciaBO ocorrenciaBO) {
        this.dao = dao;
        this.distritoBO = distritoBO;
        this.ocorrenciaBO = ocorrenciaBO;
    }

    public List<PontoSensivel> listar() {
        return dao.listar();
    }

    public PontoSensivel buscar(Long id) {
        return dao.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Ponto sensivel", id));
    }

    @Transactional
    public PontoSensivel cadastrar(PontoSensivel p) {
        distritoBO.buscar(p.getIdDistrito());
        Long id = dao.inserir(p);
        ocorrenciaBO.recalcularPrioridadeDasPendentes();
        return buscar(id);
    }

    @Transactional
    public PontoSensivel atualizar(Long id, PontoSensivel p) {
        buscar(id);
        distritoBO.buscar(p.getIdDistrito());
        p.setIdPontoSensivel(id);
        dao.atualizar(p);
        ocorrenciaBO.recalcularPrioridadeDasPendentes();
        return buscar(id);
    }

    @Transactional
    public void excluir(Long id) {
        buscar(id);
        dao.excluir(id);
        ocorrenciaBO.recalcularPrioridadeDasPendentes();
    }
}
