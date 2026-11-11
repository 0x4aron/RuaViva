package br.com.fiap.gs.zeladoria.bo;

import br.com.fiap.gs.zeladoria.dao.ApoioDAO;
import br.com.fiap.gs.zeladoria.dao.AtendimentoDAO;
import br.com.fiap.gs.zeladoria.dao.CategoriaDAO;
import br.com.fiap.gs.zeladoria.dao.CidadaoDAO;
import br.com.fiap.gs.zeladoria.dao.OcorrenciaDAO;
import br.com.fiap.gs.zeladoria.dao.PontoSensivelDAO;
import br.com.fiap.gs.zeladoria.dto.ComposicaoPrioridadeDTO;
import br.com.fiap.gs.zeladoria.dto.ItemPrioridadeDTO;
import br.com.fiap.gs.zeladoria.exception.RecursoNaoEncontradoException;
import br.com.fiap.gs.zeladoria.exception.RegraNegocioException;
import br.com.fiap.gs.zeladoria.model.Categoria;
import br.com.fiap.gs.zeladoria.model.Cidadao;
import br.com.fiap.gs.zeladoria.model.Ocorrencia;
import br.com.fiap.gs.zeladoria.model.PontoSensivel;
import br.com.fiap.gs.zeladoria.model.StatusOcorrencia;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Regras de negocio de Ocorrencia, incluindo o calculo da prioridade:
 *
 *   prioridade = peso da categoria x 10
 *              + 2 por apoio recebido
 *              + 15 se estiver a ate 200 m de um ponto sensivel
 *              + 10 se quem registrou for prioritario (idoso/PcD)
 *
 * O status muda pelos atendimentos (AtendimentoBO). Pelo PUT da ocorrencia,
 * a unica mudanca de status permitida e cancelar.
 */
@Service
public class OcorrenciaBO {

    static final int PONTOS_POR_PESO = 10;
    static final int PONTOS_POR_APOIO = 2;
    static final int BONUS_PONTO_SENSIVEL = 15;
    static final int BONUS_CIDADAO_PRIORITARIO = 10;
    static final double RAIO_PONTO_SENSIVEL_METROS = 200;

    private final OcorrenciaDAO dao;
    private final CategoriaDAO categoriaDAO;
    private final CidadaoDAO cidadaoDAO;
    private final ApoioDAO apoioDAO;
    private final AtendimentoDAO atendimentoDAO;
    private final PontoSensivelDAO pontoSensivelDAO;
    private final DistritoBO distritoBO;

    public OcorrenciaBO(OcorrenciaDAO dao, CategoriaDAO categoriaDAO, CidadaoDAO cidadaoDAO, ApoioDAO apoioDAO,
                        AtendimentoDAO atendimentoDAO, PontoSensivelDAO pontoSensivelDAO, DistritoBO distritoBO) {
        this.dao = dao;
        this.categoriaDAO = categoriaDAO;
        this.cidadaoDAO = cidadaoDAO;
        this.apoioDAO = apoioDAO;
        this.atendimentoDAO = atendimentoDAO;
        this.pontoSensivelDAO = pontoSensivelDAO;
        this.distritoBO = distritoBO;
    }

    public List<Ocorrencia> listar(StatusOcorrencia status) {
        return status == null ? dao.listar() : dao.listarPorStatus(status);
    }

    /** Ocorrencias abertas que ainda nao tem equipe, da maior para a menor prioridade. */
    public List<Ocorrencia> filaSemAtendimento() {
        return dao.listarFilaSemAtendimento();
    }

    public Ocorrencia buscar(Long id) {
        return dao.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Ocorrência", id));
    }

    /**
     * Explica a prioridade com as regras atuais (so leitura: um GET nao altera o banco).
     * Nas pendentes o total e igual a NR_PRIORIDADE, que e recalculada a cada mudanca.
     */
    public ComposicaoPrioridadeDTO explicarPrioridade(Long id) {
        Ocorrencia ocorrencia = buscar(id);
        return montarComposicaoPrioridade(ocorrencia, apoioDAO.contarPorOcorrencia(id));
    }

    public Ocorrencia cadastrar(Ocorrencia o) {
        buscarCidadao(o.getIdCidadao());
        buscarCategoria(o.getIdCategoria());
        distritoBO.buscar(o.getIdDistrito());

        // Campos controlados pelo sistema
        o.setStatus(StatusOcorrencia.ABERTA);
        o.setDataAbertura(Datas.hoje());
        o.setDataResolucao(null);
        o.setPrioridade(calcularPrioridade(o, 0));

        return buscar(dao.inserir(o));
    }

    /**
     * Altera os dados da ocorrencia (descricao, endereco, categoria, distrito).
     * Status: so e aceito manter o atual ou CANCELAR.
     */
    @Transactional
    public Ocorrencia atualizar(Long id, Ocorrencia dados) {
        dao.travar(id); // evita que um apoio ou uma visita mude a ocorrencia enquanto ela e editada
        Ocorrencia atual = buscar(id);
        if (atual.getStatus() == StatusOcorrencia.RESOLVIDA || atual.getStatus() == StatusOcorrencia.CANCELADA) {
            throw new RegraNegocioException("Ocorrência " + atual.getStatus() + " faz parte do histórico e não pode ser alterada");
        }
        buscarCategoria(dados.getIdCategoria());
        distritoBO.buscar(dados.getIdDistrito());

        StatusOcorrencia novoStatus = dados.getStatus() == null ? atual.getStatus() : dados.getStatus();
        if (novoStatus != atual.getStatus() && novoStatus != StatusOcorrencia.CANCELADA) {
            throw new RegraNegocioException("O status muda pelos atendimentos: agendar coloca EM_ANDAMENTO "
                    + "e concluir coloca RESOLVIDA. Por aqui só é possível cancelar a ocorrência");
        }

        // Quem registrou, a data de abertura e a data de resolucao nao mudam por aqui
        dados.setIdOcorrencia(id);
        dados.setIdCidadao(atual.getIdCidadao());
        dados.setDataAbertura(atual.getDataAbertura());
        dados.setDataResolucao(null);
        dados.setStatus(novoStatus);
        dados.setPrioridade(calcularPrioridade(dados, apoioDAO.contarPorOcorrencia(id)));
        dao.atualizar(dados);

        if (novoStatus == StatusOcorrencia.CANCELADA) {
            atendimentoDAO.cancelarAgendados(id);
        }
        return buscar(id);
    }

    @Transactional
    public void excluir(Long id) {
        dao.travar(id);
        Ocorrencia ocorrencia = buscar(id);
        if (ocorrencia.getStatus() == StatusOcorrencia.RESOLVIDA) {
            throw new RegraNegocioException("Ocorrência resolvida faz parte do histórico e não pode ser excluída");
        }
        dao.excluir(id);
    }

    /** Trava a linha da ocorrencia ate o fim da transacao. */
    public void travar(Long id) {
        dao.travar(id);
    }

    /** Recalcula a prioridade de uma ocorrencia (usado quando ela ganha ou perde um apoio). */
    @Transactional
    public void recalcularPrioridade(Long id) {
        dao.travar(id); // evita contagem errada com dois apoios ao mesmo tempo
        Ocorrencia o = buscar(id);
        dao.atualizarPrioridade(id, calcularPrioridade(o, apoioDAO.contarPorOcorrencia(id)));
    }

    /**
     * Recalcula as ocorrencias ainda nao resolvidas. Usado quando muda algo de que a prioridade
     * depende: pontos sensiveis, peso de uma categoria ou o cadastro prioritario de um cidadao.
     */
    @Transactional
    public void recalcularPrioridadeDasPendentes() {
        List<Long> ids = new ArrayList<>();
        for (StatusOcorrencia status : List.of(StatusOcorrencia.ABERTA, StatusOcorrencia.EM_ANDAMENTO)) {
            for (Ocorrencia o : dao.listarPorStatus(status)) {
                ids.add(o.getIdOcorrencia());
            }
        }
        ids.sort(Long::compareTo);
        for (Long id : ids) {
            recalcularPrioridade(id);
        }
    }

    double calcularPrioridade(Ocorrencia o, int quantidadeApoios) {
        return montarComposicaoPrioridade(o, quantidadeApoios).total();
    }

    private ComposicaoPrioridadeDTO montarComposicaoPrioridade(Ocorrencia o, int quantidadeApoios) {
        Categoria categoria = buscarCategoria(o.getIdCategoria());
        Cidadao cidadao = buscarCidadao(o.getIdCidadao());

        List<ItemPrioridadeDTO> itens = new ArrayList<>();
        itens.add(new ItemPrioridadeDTO("Gravidade da categoria (peso " + categoria.getPesoGravidade() + ")",
                categoria.getPesoGravidade() * PONTOS_POR_PESO));
        if (quantidadeApoios > 0) {
            itens.add(new ItemPrioridadeDTO(quantidadeApoios
                    + (quantidadeApoios == 1 ? " apoio de vizinho" : " apoios de vizinhos"),
                    quantidadeApoios * PONTOS_POR_APOIO));
        }

        PontoSensivel maisProximo = null;
        double menorDistancia = Double.POSITIVE_INFINITY;
        for (PontoSensivel p : pontoSensivelDAO.listar()) {
            double distancia = distanciaEmMetros(o.getLatitude(), o.getLongitude(), p.getLatitude(), p.getLongitude());
            if (distancia <= RAIO_PONTO_SENSIVEL_METROS && distancia < menorDistancia) {
                maisProximo = p;
                menorDistancia = distancia;
            }
        }
        if (maisProximo != null) {
            long metros = Math.round(menorDistancia / 10) * 10;
            itens.add(new ItemPrioridadeDTO("A " + metros + " m de " + maisProximo.getNome(), BONUS_PONTO_SENSIVEL));
        }
        if (cidadao.getPrioritario()) {
            itens.add(new ItemPrioridadeDTO("Registrado por pessoa idosa ou com deficiência", BONUS_CIDADAO_PRIORITARIO));
        }
        double total = itens.stream().mapToDouble(ItemPrioridadeDTO::pontos).sum();
        return new ComposicaoPrioridadeDTO(total, List.copyOf(itens));
    }

    /** Distancia entre duas coordenadas pela formula de Haversine (raio da Terra = 6.371 km). */
    static double distanciaEmMetros(double lat1, double lon1, double lat2, double lon2) {
        double raioTerra = 6_371_000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.pow(Math.sin(dLon / 2), 2);
        return 2 * raioTerra * Math.asin(Math.sqrt(a));
    }

    private Categoria buscarCategoria(Long id) {
        return categoriaDAO.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", id));
    }

    private Cidadao buscarCidadao(Long id) {
        return cidadaoDAO.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Cidadão", id));
    }
}
