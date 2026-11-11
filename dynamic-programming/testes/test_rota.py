"""Conferência da rota ótima e de sua reconstrução."""

import math
import random
import unittest

from rota import distancia_rota, held_karp, rota_forca_bruta, vizinho_mais_proximo


class TesteRota(unittest.TestCase):
    def test_ate_sete_visitas(self):
        gerador = random.Random(565398)
        for quantidade in range(8):
            for _ in range(3):
                pontos = [(gerador.random() * 1000, gerador.random() * 1000)
                          for _ in range(quantidade + 1)]
                matriz = [[math.dist(a, b) for b in pontos] for a in pontos]
                _, esperado, _ = rota_forca_bruta(matriz)
                for funcao in (held_karp, rota_forca_bruta, vizinho_mais_proximo):
                    caminho, distancia, _ = funcao(matriz)
                    with self.subTest(quantidade=quantidade, algoritmo=funcao.__name__):
                        self.assertEqual(caminho[0], 0)
                        self.assertEqual(caminho[-1], 0)
                        self.assertEqual(sorted(caminho[1:-1]), list(range(1, quantidade + 1)))
                        self.assertAlmostEqual(distancia, distancia_rota(matriz, caminho))
                        if funcao != vizinho_mais_proximo:
                            self.assertAlmostEqual(distancia, esperado)
                        else:
                            self.assertGreaterEqual(distancia + 1e-8, esperado)

    def test_empates_e_distancia_zero(self):
        matriz = [[0] * 4 for _ in range(4)]
        caminho, distancia, _ = held_karp(matriz)
        self.assertEqual(caminho, [0, 1, 2, 3, 0])
        self.assertEqual(distancia, 0)
