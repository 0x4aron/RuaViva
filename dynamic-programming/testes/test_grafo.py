"""Testes de caminhos conhecidos e conexão entre componentes."""

import math
import unittest

from grafo import dijkstra, gerar_matrizes, haversine, montar_grafo


class TesteGrafo(unittest.TestCase):
    def test_caminhos_conhecidos(self):
        grafo = {0: {1: 2, 2: 10}, 1: {0: 2, 2: 3},
                 2: {0: 10, 1: 3, 3: 1}, 3: {2: 1}, 4: {}}
        self.assertEqual(dijkstra(grafo, 0), {0: 0, 1: 2, 2: 5, 3: 6, 4: math.inf})

    def test_haversine(self):
        self.assertEqual(haversine((0, 0), (0, 0)), 0)
        self.assertAlmostEqual(haversine((0, 0), (0, 1)), 111194.93, places=2)

    def test_conecta_componentes_sem_nos_isolados(self):
        base = {"latitude": 0, "longitude": 0}
        ocorrencias = [{"latitude": 0, "longitude": longitude}
                       for longitude in (0.001, 0.02, 0.021)]
        grafo, pontes = montar_grafo(base, ocorrencias, cruzamentos=[])
        self.assertEqual(len(pontes), 1)
        self.assertTrue(all(math.isfinite(d) for d in dijkstra(grafo, 0).values()))
        for origem, vizinhos in grafo.items():
            for destino, peso in vizinhos.items():
                self.assertEqual(peso, grafo[destino][origem])

    def test_conecta_no_isolado(self):
        grafo, pontes = montar_grafo(
            {"latitude": 0, "longitude": 0},
            [{"latitude": 0, "longitude": 1}], cruzamentos=[])
        self.assertEqual(pontes, [(0, 1)])
        self.assertAlmostEqual(grafo[0][1], haversine((0, 0), (0, 1)) * 1.3)

    def test_matriz_e_velocidade(self):
        grafo = {0: {1: 200}, 1: {0: 200}}
        metros, minutos = gerar_matrizes(grafo, 2, velocidade=12)
        self.assertEqual(metros, [[0, 200], [200, 0]])
        self.assertEqual(minutos, [[0, 1], [1, 0]])
        with self.assertRaises(ValueError):
            gerar_matrizes(grafo, 2, velocidade=0)
