"""Plano do dia: carregar, selecionar, ordenar e conferir a jornada."""

import argparse
import math
import random
from time import perf_counter

from dados import carregar_dados
from grafo import gerar_matrizes, montar_grafo
from mochila import mochila_forca_bruta, mochila_tabulada, preparar_itens
from rota import held_karp, rota_forca_bruta, vizinho_mais_proximo


def reduzir_matriz(matriz, nos):
    """Mantém apenas a base e os nós escolhidos."""
    return [[matriz[a][b] for b in nos] for a in nos]


def planejar(itens, distancias, horas, velocidade):
    """Seleciona visitas e confere trabalho, viagem e retorno."""
    capacidade = math.floor(horas * 60 / 15)
    for limite in range(capacidade, -1, -1):
        indices, prioridade, estados = mochila_tabulada(itens, limite)
        if len(indices) > 16:
            raise ValueError("Mais de 16 visitas escolhidas: reduza --horas.")
        escolhidos = [itens[i] for i in indices]
        nos = [0] + [item["no"] for item in escolhidos]
        caminho, metros, estados_rota = held_karp(reduzir_matriz(distancias, nos))
        trabalho = sum(item["horas_estimadas"] * 60 for item in escolhidos)
        viagem = metros / (velocidade * 1000 / 60)
        if trabalho + viagem <= horas * 60 + 1e-9:
            return {"escolhidos": escolhidos, "nos": nos, "caminho": caminho,
                    "metros": metros, "trabalho": trabalho, "viagem": viagem,
                    "prioridade": prioridade, "capacidade": capacidade,
                    "limite": limite, "estados_mochila": estados,
                    "estados_rota": estados_rota}
    raise ValueError("Não foi possível montar um plano dentro da jornada.")


def horario(minutos):
    """Formata o horário arredondado ao minuto mais próximo."""
    total = math.floor(8 * 60 + minutos + 0.5)
    dias, minuto_dia = divmod(total, 24 * 60)
    texto = f"{minuto_dia // 60:02d}:{minuto_dia % 60:02d}"
    return texto + (f" (+{dias} dia)" if dias else "")


def mostrar_escolha(itens, plano):
    """Explica a inclusão e o adiamento de cada ocorrência."""
    ids = {item["id"] for item in plano["escolhidos"]}
    usados = sum(item["custo"] for item in plano["escolhidos"])
    print(f'\nMOCHILA | {usados}/{plano["limite"]} blocos de 15 min usados')
    if plano["limite"] < plano["capacidade"]:
        print("  Capacidade reduzida para acomodar a rota completa e o retorno.")
    for item in itens:
        if item["id"] in ids:
            motivo = "HOJE: integra a melhor soma de prioridades da mochila"
        elif item["custo"] > plano["limite"]:
            motivo = "AMANHÃ: custo individual maior que a capacidade disponível"
        elif item["custo"] > plano["limite"] - usados:
            motivo = "AMANHÃ: não cabe junto à combinação escolhida"
        else:
            motivo = "AMANHÃ: não aumenta a prioridade máxima (empate)"
        print(f'  #{item["id"]:02d} {item["categoria"]} | '
              f'prioridade {item["prioridade"]:g} | {item["custo"]} blocos')
        print(f'      {item["endereco"]} — {motivo}')


def mostrar_rota(plano, distancias, velocidade):
    """Exibe cada deslocamento e a janela de trabalho no destino."""
    print("\nROTA ÓTIMA PARA AS VISITAS ESCOLHIDAS | saída às 08:00")
    acumulado = 0
    for passo, (origem, destino) in enumerate(
            zip(plano["caminho"], plano["caminho"][1:]), start=1):
        metros = distancias[plano["nos"][origem]][plano["nos"][destino]]
        minutos = metros / (velocidade * 1000 / 60)
        partida = horario(acumulado)
        acumulado += minutos
        chegada = horario(acumulado)
        nome_origem = "Base" if origem == 0 else f'#{plano["escolhidos"][origem - 1]["id"]}'
        if destino == 0:
            print(f"  {passo}. {partida} {nome_origem} -> {chegada} Base | "
                  f"{metros:.0f} m / {minutos:.1f} min")
        else:
            item = plano["escolhidos"][destino - 1]
            acumulado += item["horas_estimadas"] * 60
            print(f'  {passo}. {partida} {nome_origem} -> {chegada} #{item["id"]} | '
                  f"{metros:.0f} m / {minutos:.1f} min")
            print(f'     Serviço {chegada}–{horario(acumulado)}: {item["descricao"]}')


def mostrar_plano(dados, equipe, horas, velocidade, grafo, pontes, itens, plano, distancias):
    """Apresenta o resultado sem depender de bibliotecas visuais."""
    print("=" * 72)
    print("RUAVIVA | PLANO DO DIA — LIBERDADE / SÃO PAULO")
    print("=" * 72)
    print(f'Fonte: {dados["origem"]}')
    print(f'Equipe: {equipe["nome"]} (ID {equipe["id"]}) | Jornada: {horas:g} h')
    print(f'Base: {equipe["base"]["latitude"]:.7f}, {equipe["base"]["longitude"]:.7f}')
    print(f'Dados: {len(itens)} pendentes | {len(dados["categorias"])} categorias | '
          f'{len(dados["equipes"])} equipes')
    arestas = sum(len(vizinhos) for vizinhos in grafo.values()) // 2
    print(f"Grafo: {len(grafo)} nós / {arestas} arestas / {len(pontes)} pontes extras")
    print(f"Velocidade média: {velocidade:g} km/h | Distância: Haversine × 1,3")
    mostrar_escolha(itens, plano)
    mostrar_rota(plano, distancias, velocidade)
    total = plano["trabalho"] + plano["viagem"]
    print(f'\nPRIORIDADE ATENDIDA: {plano["prioridade"]:g}')
    print(f'Trabalho: {plano["trabalho"] / 60:.2f} h | '
          f'Deslocamento: {plano["viagem"]:.1f} min / {plano["metros"]:.0f} m')
    print(f"Total: {total / 60:.2f} h de {horas:g} h | "
          f"Folga: {horas * 60 - total:.1f} min | Retorno: {horario(total)}")
    print("Horários estimados; a soma considera os tempos antes do arredondamento.")


def medir(funcao, *argumentos):
    """Cronometra uma execução incluindo a reconstrução."""
    inicio = perf_counter()
    resultado = funcao(*argumentos)
    return resultado, (perf_counter() - inicio) * 1000


def comparar():
    """Compara algoritmos em entradas sintéticas reproduzíveis."""
    gerador = random.Random(42)
    pontos = [(gerador.uniform(0, 2000), gerador.uniform(0, 2000))
              for _ in range(9)]
    matriz = [[math.dist(a, b) for b in pontos] for a in pontos]
    print("\nEFICIÊNCIA — ROTAS SINTÉTICAS (semente 42; n exclui a base)")
    print(" n | abordagem     | tempo (ms) | unidades contadas | distância (m)")
    for quantidade in range(2, 9):
        recorte = reduzir_matriz(matriz, list(range(quantidade + 1)))
        for nome, funcao in (("Memoização", held_karp),
                             ("Força bruta", rota_forca_bruta),
                             ("Gulosa", vizinho_mais_proximo)):
            (_, metros, unidades), tempo = medir(funcao, recorte)
            print(f"{quantidade:2} | {nome:13} | {tempo:10.3f} | {unidades:17} | {metros:13.1f}")
    print("Unidades: estados novos no cache / permutações / candidatos avaliados.")
    print("\nEFICIÊNCIA — MOCHILA SINTÉTICA (capacidade de 32 blocos)")
    print(" n | abordagem     | tempo (ms) | unidades contadas | prioridade")
    itens = [{"custo": gerador.randint(1, 17), "prioridade": gerador.randint(1, 90)}
             for _ in range(16)]
    for quantidade in (4, 8, 12, 16):
        for nome, funcao in (("Tabulação", mochila_tabulada),
                             ("Força bruta", mochila_forca_bruta)):
            (_, valor, unidades), tempo = medir(funcao, itens[:quantidade], 32)
            print(f"{quantidade:2} | {nome:13} | {tempo:10.3f} | {unidades:17} | {valor:10}")
    print("Unidades: células calculadas (sem linha inicial) / subconjuntos.")
    print("Uma medição por caso; tempos variam por máquina e não são um benchmark rigoroso.")


def ler_argumentos():
    """Define as opções da linha de comando."""
    analisador = argparse.ArgumentParser(description=__doc__)
    analisador.add_argument("--equipe", type=int, default=1, help="ID da equipe (padrão: 1)")
    analisador.add_argument("--horas", type=float, help="Jornada de 0 a 24 horas")
    analisador.add_argument("--api", help="URL da API Java, por exemplo http://localhost:8080")
    analisador.add_argument("--velocidade", type=float, default=12, help="Velocidade média em km/h")
    analisador.add_argument("--comparar", action="store_true", help="Compara os algoritmos")
    return analisador, analisador.parse_args()


def main():
    """Executa o planejamento e, opcionalmente, a comparação."""
    analisador, argumentos = ler_argumentos()
    try:
        dados = carregar_dados(argumentos.api)
        equipe = next((e for e in dados["equipes"] if e["id"] == argumentos.equipe), None)
        if equipe is None or not equipe["ativa"]:
            raise ValueError("Equipe inexistente ou inativa.")
        horas = equipe["horas_dia"] if argumentos.horas is None else argumentos.horas
        if not math.isfinite(horas) or not 0 <= horas <= 24:
            raise ValueError("A jornada deve estar entre 0 e 24 horas.")
        ocorrencias = sorted(dados["ocorrencias"], key=lambda o: o["id"])
        grafo, pontes = montar_grafo(equipe["base"], ocorrencias)
        distancias, tempos = gerar_matrizes(grafo, len(ocorrencias) + 1, argumentos.velocidade)
        itens = preparar_itens(ocorrencias, tempos)
        plano = planejar(itens, distancias, horas, argumentos.velocidade)
        mostrar_plano(dados, equipe, horas, argumentos.velocidade,
                      grafo, pontes, itens, plano, distancias)
        if argumentos.comparar:
            comparar()
    except (ValueError, OSError) as erro:
        analisador.error(str(erro))


if __name__ == "__main__":
    main()
