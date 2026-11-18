"""Integração: a jornada inclui a volta à base."""

import unittest

from dados import carregar_dados, ocorrencias_da_equipe
from grafo import gerar_matrizes, montar_grafo
from main import planejar
from mochila import preparar_itens


class TestePlano(unittest.TestCase):
    def test_plano_dos_dados_locais(self):
        dados = carregar_dados()
        equipe = dados["equipes"][0]
        visitas = ocorrencias_da_equipe(dados["ocorrencias"], equipe)
        grafo, _ = montar_grafo(equipe["base"], visitas)
        for velocidade in (1, 5, 12):
            distancias, tempos = gerar_matrizes(grafo, len(visitas) + 1, velocidade)
            itens = preparar_itens(visitas, tempos)
            for horas in (0, 1, 2.25, 6, 8):
                plano = planejar(itens, distancias, horas, velocidade)
                with self.subTest(horas=horas, velocidade=velocidade):
                    self.assertLessEqual(plano["trabalho"] + plano["viagem"], horas * 60 + 1e-9)
                    if horas == 8 and velocidade == 12:
                        self.assertEqual([o["id"] for o in plano["escolhidos"]], [3, 5, 10])
                        self.assertEqual(plano["prioridade"], 187)

    def test_mooca_sem_ocorrencias_locais(self):
        dados = carregar_dados()
        mooca = next(e for e in dados["equipes"] if e["id"] == 4)
        self.assertEqual(ocorrencias_da_equipe(dados["ocorrencias"], mooca), [])

    def test_agendamento_reserva_ocorrencia_para_equipe(self):
        dados = carregar_dados()
        equipe_a, equipe_b = dados["equipes"][:2]
        visitas_a = ocorrencias_da_equipe(dados["ocorrencias"], equipe_a)
        visitas_b = ocorrencias_da_equipe(dados["ocorrencias"], equipe_b)
        self.assertEqual([o["id"] for o in visitas_a], [3, 5, 7, 8, 10])
        self.assertEqual([o["id"] for o in visitas_b], [3, 7, 8, 10])

    def test_corrige_estimativa_que_esquece_retorno(self):
        # Ida: 15 min; trabalho: 60 min. Volta: outros 15 min.
        matriz = [[0, 3000], [3000, 0]]
        itens = [{"no": 1, "id": 1, "horas_estimadas": 1, "custo": 5, "prioridade": 10}]
        plano = planejar(itens, matriz, horas=1.25, velocidade=12)
        self.assertEqual(plano["escolhidos"], [])
        self.assertLess(plano["limite"], plano["capacidade"])
        self.assertEqual(plano["caminho"], [0, 0])

    def test_fila_vazia(self):
        plano = planejar([], [[0]], horas=8, velocidade=12)
        self.assertEqual(plano["prioridade"], 0)
        self.assertEqual(plano["caminho"], [0, 0])
        self.assertEqual(plano["trabalho"] + plano["viagem"], 0)
