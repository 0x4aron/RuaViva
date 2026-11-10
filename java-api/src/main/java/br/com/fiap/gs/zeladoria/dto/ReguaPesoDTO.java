package br.com.fiap.gs.zeladoria.dto;

/**
 * Um nivel da regua de pesos sugerida ao gestor quando ele cadastra uma categoria.
 * E so uma sugestao: o gestor pode escolher qualquer peso de 1 a 5.
 */
public record ReguaPesoDTO(int peso, String criterio, String exemplos) {
}
