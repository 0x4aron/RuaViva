"""Três maneiras de ordenar visitas com retorno à base zero."""

from functools import lru_cache
from itertools import permutations


def distancia_rota(matriz, caminho):
    """Soma os trechos de um caminho."""
    return sum(matriz[a][b] for a, b in zip(caminho, caminho[1:]))


def held_karp(matriz):
    """Memoriza o menor custo restante por posição e bitmask."""
    quantidade = len(matriz) - 1
    todos = (1 << quantidade) - 1

    @lru_cache(maxsize=None)
    def visitar(atual, visitados):
        if visitados == todos:
            return matriz[atual][0]
        melhor = float("inf")
        for proximo in range(1, quantidade + 1):
            bit = 1 << (proximo - 1)
            if not visitados & bit:
                custo = matriz[atual][proximo] + visitar(proximo, visitados | bit)
                melhor = min(melhor, custo)
        return melhor

    distancia = visitar(0, 0)
    # Reconstruir consultando o cache evita guardar um caminho em cada estado.
    caminho = [0]
    atual, visitados = 0, 0
    while visitados != todos:
        candidatos = [i for i in range(1, quantidade + 1)
                      if not visitados & (1 << (i - 1))]
        proximo = min(candidatos, key=lambda i: matriz[atual][i]
                      + visitar(i, visitados | (1 << (i - 1))))
        caminho.append(proximo)
        visitados |= 1 << (proximo - 1)
        atual = proximo
    caminho.append(0)
    return caminho, distancia, visitar.cache_info().misses


def vizinho_mais_proximo(matriz):
    """Escolhe a visita mais próxima a cada passo."""
    restantes = set(range(1, len(matriz)))
    caminho = [0]
    avaliacoes = 0
    while restantes:
        avaliacoes += len(restantes)
        proximo = min(restantes, key=lambda i: (matriz[caminho[-1]][i], i))
        caminho.append(proximo)
        restantes.remove(proximo)
    caminho.append(0)
    return caminho, distancia_rota(matriz, caminho), avaliacoes


def rota_forca_bruta(matriz):
    """Testa todas as permutações; use apenas em poucos pontos."""
    melhor = float("inf")
    melhor_caminho = [0, 0]
    permutacoes = 0
    for ordem in permutations(range(1, len(matriz))):
        caminho = [0, *ordem, 0]
        distancia = distancia_rota(matriz, caminho)
        permutacoes += 1
        if distancia < melhor:
            melhor, melhor_caminho = distancia, caminho
    return melhor_caminho, melhor, permutacoes
