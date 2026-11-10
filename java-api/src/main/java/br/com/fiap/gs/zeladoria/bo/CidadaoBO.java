package br.com.fiap.gs.zeladoria.bo;

import br.com.fiap.gs.zeladoria.dao.CidadaoDAO;
import br.com.fiap.gs.zeladoria.exception.RecursoNaoEncontradoException;
import br.com.fiap.gs.zeladoria.exception.RegraNegocioException;
import br.com.fiap.gs.zeladoria.model.Cidadao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Regras de negocio de Cidadao. */
@Service
public class CidadaoBO {

    private final CidadaoDAO dao;
    private final OcorrenciaBO ocorrenciaBO;

    public CidadaoBO(CidadaoDAO dao, OcorrenciaBO ocorrenciaBO) {
        this.dao = dao;
        this.ocorrenciaBO = ocorrenciaBO;
    }

    public List<Cidadao> listar() {
        return dao.listar();
    }

    public Cidadao buscar(Long id) {
        return dao.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Cidadao", id));
    }

    public Cidadao cadastrar(Cidadao c) {
        c.setEmail(c.getEmail().trim().toLowerCase());
        validarEmailUnico(c.getEmail(), null);
        if (c.getPrioritario() == null) {
            c.setPrioritario(false);
        }
        c.setDataCadastro(Datas.hoje());
        return buscar(dao.inserir(c));
    }

    @Transactional
    public Cidadao atualizar(Long id, Cidadao c) {
        Cidadao atual = buscar(id);
        c.setIdCidadao(id);
        c.setEmail(c.getEmail().trim().toLowerCase());
        validarEmailUnico(c.getEmail(), id);
        if (c.getPrioritario() == null) {
            c.setPrioritario(atual.getPrioritario());
        }
        dao.atualizar(c);

        // Ser prioritario (idoso/PcD) muda a prioridade das ocorrencias que ele registrou
        if (!c.getPrioritario().equals(atual.getPrioritario())) {
            ocorrenciaBO.recalcularPrioridadeDasPendentes();
        }
        return buscar(id);
    }

    public void excluir(Long id) {
        buscar(id);
        dao.excluir(id);
    }

    // Regra: dois cidadaos nao podem ter o mesmo email
    private void validarEmailUnico(String email, Long idAtual) {
        dao.buscarPorEmail(email).ifPresent(existente -> {
            if (!existente.getIdCidadao().equals(idAtual)) {
                throw new RegraNegocioException("Ja existe um cidadao com o email " + email);
            }
        });
    }
}
