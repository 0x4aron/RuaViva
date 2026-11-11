"""Conferência da tabulação contra enumeração de subconjuntos."""

import random
import unittest

from mochila import mochila_forca_bruta, mochila_tabulada, preparar_itens


class TesteMochila(unittest.TestCase):
    def test_aleatorios_com_semente(self):
        gerador = random.Random(562096)
        for quantidade in range(10):
            for _ in range(15):
                itens = [{"custo": gerador.randint(1, 17),
                          "prioridade": gerador.randint(0, 100)}
                         for _ in range(quantidade)]
                capacidade = gerador.randint(0, 32)
                escolhidos, valor, _ = mochila_tabulada(itens, capacidade)
                _, esperado, _ = mochila_forca_bruta(itens, capacidade)
                with self.subTest(quantidade=quantidade, capacidade=capacidade):
                    self.assertEqual(valor, esperado)
                    self.assertEqual(len(escolhidos), len(set(escolhidos)))
                    self.assertEqual(valor, sum(itens[i]["prioridade"] for i in escolhidos))
                    self.assertLessEqual(sum(itens[i]["custo"] for i in escolhidos), capacidade)

    def test_vazio_e_custo_zero(self):
        self.assertEqual(mochila_tabulada([], 0)[:2], ([], 0))
        self.assertEqual(mochila_tabulada([{"custo": 0, "prioridade": 5}], 0)[:2], ([0], 5))

    def test_arredonda_custo_para_cima(self):
        itens = preparar_itens([{"horas_estimadas": 2}], [[0, 0.1], [0.1, 0]])
        self.assertEqual(itens[0]["custo"], 9)

    def test_reconstroi_combinacao(self):
        itens = [{"custo": 2, "prioridade": 3}, {"custo": 3, "prioridade": 4},
                 {"custo": 4, "prioridade": 5}]
        self.assertEqual(mochila_tabulada(itens, 5)[:2], ([0, 1], 7))
