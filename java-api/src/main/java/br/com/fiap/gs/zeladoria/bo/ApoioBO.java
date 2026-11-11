package br.com.fiap.gs.zeladoria.bo;

import br.com.fiap.gs.zeladoria.dao.ApoioDAO;
import br.com.fiap.gs.zeladoria.exception.RecursoNaoEncontradoException;
import br.com.fiap.gs.zeladoria.exception.RegraNegocioException;
import br.com.fiap.gs.zeladoria.model.Apoio;
import br.com.fiap.gs.zeladoria.model.Ocorrencia;
import br.com.fiap.gs.zeladoria.model.StatusOcorrencia;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Regras de negocio do apoio ("tambem me afeta").
 * Todo apoio criado ou removido recalcula a prioridade da ocorrencia.
 */
@Service
public class ApoioBO {

    private final ApoioDAO dao;
    private final OcorrenciaBO ocorrenciaBO;
    private final CidadaoBO cidadaoBO;

    public ApoioBO(ApoioDAO dao, OcorrenciaBO ocorrenciaBO, CidadaoBO cidadaoBO) {
        this.dao = dao;
        this.ocorrenciaBO = ocorrenciaBO;
        this.cidadaoBO = cidadaoBO;
    }

    public List<Apoio> listar(Long idOcorrencia) {
        return idOcorrencia == null ? dao.listar() : dao.listarPorOcorrencia(idOcorrencia);
    }

    public Apoio buscar(Long id) {
        return dao.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Apoio", id));
    }

    @Transactional
    public Apoio cadastrar(Apoio a) {
        ocorrenciaBO.travar(a.getIdOcorrencia());
        Ocorrencia ocorrencia = ocorrenciaBO.buscar(a.getIdOcorrencia());
        cidadaoBO.buscar(a.getIdCidadao());

        if (ocorrencia.getStatus() == StatusOcorrencia.RESOLVIDA || ocorrencia.getStatus() == StatusOcorrencia.CANCELADA) {
            throw new RegraNegocioException("Só é possível apoiar ocorrências que ainda não foram resolvidas ou canceladas");
        }
        if (ocorrencia.getIdCidadao().equals(a.getIdCidadao())) {
            throw new RegraNegocioException("O cidadão não pode apoiar a própria ocorrência");
        }
        if (dao.existe(a.getIdOcorrencia(), a.getIdCidadao())) {
            throw new RegraNegocioException("Este cidadão já apoiou esta ocorrência");
        }

        a.setDataApoio(Datas.hoje());
        Long id = dao.inserir(a);
        ocorrenciaBO.recalcularPrioridade(a.getIdOcorrencia());
        return buscar(id);
    }

    @Transactional
    public void excluir(Long id) {
        Apoio a = buscar(id);
        ocorrenciaBO.travar(a.getIdOcorrencia());
        a = buscar(id);
        dao.excluir(id);
        ocorrenciaBO.recalcularPrioridade(a.getIdOcorrencia());
    }
}
