"""Grafo de vizinhança e menores caminhos em metros."""

import heapq
import math


# Referências didáticas aproximadas; não são um mapa viário oficial.
CRUZAMENTOS = [
    ("Sé / Benjamin Constant", -23.5520, -46.6343),
    ("Liberdade / Praça da Liberdade", -23.5554, -46.6357),
    ("Galvão Bueno / Barão de Iguape", -23.5584, -46.6351),
    ("Conselheiro Furtado / Barão de Iguape", -23.5583, -46.6335),
    ("Galvão Bueno / São Joaquim", -23.5610, -46.6368),
    ("Siqueira Campos / São Joaquim", -23.5624, -46.6380),
]


def haversine(ponto_a, ponto_b):
    """Calcula a distância em linha geodésica, em metros."""
    latitude_a, longitude_a = map(math.radians, ponto_a)
    latitude_b, longitude_b = map(math.radians, ponto_b)
    diferenca_lat = latitude_b - latitude_a
    diferenca_lon = longitude_b - longitude_a
    parcela = (math.sin(diferenca_lat / 2) ** 2
               + math.cos(latitude_a) * math.cos(latitude_b)
               * math.sin(diferenca_lon / 2) ** 2)
    return 6371000 * 2 * math.asin(math.sqrt(min(1, parcela)))


def ligar(grafo, pontos, origem, destino):
    """Adiciona uma aresta nos dois sentidos."""
    distancia = haversine(pontos[origem], pontos[destino]) * 1.3
    grafo[origem][destino] = distancia
    grafo[destino][origem] = distancia


def alcancaveis(grafo):
    """Encontra o componente ligado ao primeiro nó."""
    visitados = set()
    pilha = [0]
    while pilha:
        atual = pilha.pop()
        if atual not in visitados:
            visitados.add(atual)
            pilha.extend(grafo[atual])
    return visitados


def conectar_componentes(grafo, pontos):
    """Une componentes pela menor ponte entre suas coordenadas."""
    pontes = []
    ligados = alcancaveis(grafo)
    while len(ligados) < len(pontos):
        fora = set(range(len(pontos))) - ligados
        pares = ((a, b) for a in sorted(ligados) for b in sorted(fora))
        origem, destino = min(
            pares, key=lambda par: haversine(pontos[par[0]], pontos[par[1]]))
        ligar(grafo, pontos, origem, destino)
        pontes.append((origem, destino))
        ligados = alcancaveis(grafo)
    return pontes


def montar_grafo(base, ocorrencias, raio=400, cruzamentos=CRUZAMENTOS):
    """Numera a base como zero, seguida das ocorrências."""
    pontos = [(base["latitude"], base["longitude"])]
    pontos += [(o["latitude"], o["longitude"]) for o in ocorrencias]
    pontos += [(latitude, longitude) for _, latitude, longitude in cruzamentos]
    grafo = {indice: {} for indice in range(len(pontos))}
    for origem in grafo:
        for destino in range(origem + 1, len(pontos)):
            if haversine(pontos[origem], pontos[destino]) <= raio:
                ligar(grafo, pontos, origem, destino)
    pontes = conectar_componentes(grafo, pontos)
    return grafo, pontes


def dijkstra(grafo, origem):
    """Obtém as menores distâncias a partir da origem."""
    distancias = {no: math.inf for no in grafo}
    distancias[origem] = 0
    fila = [(0, origem)]
    while fila:
        distancia, atual = heapq.heappop(fila)
        if distancia > distancias[atual]:
            continue
        for vizinho, peso in grafo[atual].items():
            nova = distancia + peso
            if nova < distancias[vizinho]:
                distancias[vizinho] = nova
                heapq.heappush(fila, (nova, vizinho))
    return distancias


def gerar_matrizes(grafo, quantidade, velocidade=12):
    """Retorna matrizes de metros e minutos para os primeiros nós."""
    if not math.isfinite(velocidade) or velocidade <= 0:
        raise ValueError("A velocidade deve ser positiva e finita.")
    distancias = []
    for origem in range(quantidade):
        menores = dijkstra(grafo, origem)
        distancias.append([menores[destino] for destino in range(quantidade)])
    metros_por_minuto = velocidade * 1000 / 60
    tempos = [[metros / metros_por_minuto for metros in linha]
              for linha in distancias]
    return distancias, tempos
