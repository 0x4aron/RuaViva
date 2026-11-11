"""Seleção de ocorrências com mochila 0/1."""

import math


def preparar_itens(ocorrencias, tempos):
    """Arredonda trabalho mais ida para blocos de 15 minutos."""
    itens = []
    for indice, ocorrencia in enumerate(ocorrencias, start=1):
        minutos = ocorrencia["horas_estimadas"] * 60 + tempos[0][indice]
        itens.append({**ocorrencia, "no": indice,
                      "custo": math.ceil(minutos / 15)})
    return itens


def mochila_tabulada(itens, capacidade):
    """Preenche a tabela e reconstrói os índices escolhidos."""
    tabela = [[0] * (capacidade + 1) for _ in range(len(itens) + 1)]
    for linha, item in enumerate(itens, start=1):
        for limite in range(capacidade + 1):
            tabela[linha][limite] = tabela[linha - 1][limite]
            if item["custo"] <= limite:
                incluir = (item["prioridade"]
                           + tabela[linha - 1][limite - item["custo"]])
                tabela[linha][limite] = max(tabela[linha][limite], incluir)
    escolhidos = []
    limite = capacidade
    for linha in range(len(itens), 0, -1):
        if tabela[linha][limite] > tabela[linha - 1][limite]:
            escolhidos.append(linha - 1)
            limite -= itens[linha - 1]["custo"]
    return list(reversed(escolhidos)), tabela[-1][capacidade], len(itens) * (capacidade + 1)


def mochila_forca_bruta(itens, capacidade):
    """Examina todos os subconjuntos para conferir a tabulação."""
    melhor_valor = 0
    melhores = []
    for mascara in range(1 << len(itens)):
        escolhidos = [i for i in range(len(itens)) if mascara & (1 << i)]
        custo = sum(itens[i]["custo"] for i in escolhidos)
        valor = sum(itens[i]["prioridade"] for i in escolhidos)
        if custo <= capacidade and valor > melhor_valor:
            melhores, melhor_valor = escolhidos, valor
    return melhores, melhor_valor, 1 << len(itens)
