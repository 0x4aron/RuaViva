package br.com.fiap.gs.zeladoria.dto;

import java.util.List;

public record ComposicaoPrioridadeDTO(double total, List<ItemPrioridadeDTO> itens) {
}
