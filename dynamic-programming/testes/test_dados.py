"""API simulada sem conexão de rede e valores do SQL."""

import io
import unittest
from contextlib import redirect_stderr
from unittest.mock import patch

from dados import carregar_dados


class TesteDados(unittest.TestCase):
    def test_retrato_sql(self):
        dados = carregar_dados()
        self.assertEqual([o["id"] for o in dados["ocorrencias"]], [3, 5, 7, 8, 10])
        self.assertEqual([o["prioridade"] for o in dados["ocorrencias"]], [71, 59, 45, 59, 57])
        self.assertEqual([o["horas_estimadas"] for o in dados["ocorrencias"]], [2, 2, 4, 4, 3])
        self.assertEqual(len(dados["pontos_sensiveis"]), 5)

    def test_falha_api_usa_json(self):
        for erro in (OSError("indisponível"), ValueError("JSON inválido"), KeyError("campo")):
            with patch("dados.carregar_api", side_effect=erro), redirect_stderr(io.StringIO()) as avisos:
                dados = carregar_dados("http://exemplo.invalid")
            self.assertIn("Usando o JSON local", avisos.getvalue())
            self.assertEqual(len(dados["ocorrencias"]), 5)

    def test_converte_api_e_filtra_status(self):
        ocorrencia = {"idOcorrencia": 3, "idCategoria": 1, "idDistrito": 1,
                      "descricao": "Bueiro", "logradouro": "Rua A", "numero": "288",
                      "latitude": -23.55, "longitude": -46.63,
                      "status": "ABERTA", "prioridade": 71}
        categorias = [{"idCategoria": 1, "nome": "Bueiro", "horasEstimadas": 2, "pesoGravidade": 4}]
        equipes = [{"idEquipe": 1, "nome": "Equipe A", "idSubprefeitura": 1,
                    "horasDia": 8, "ativa": True, "latitude": -23.55, "longitude": -46.63}]
        fila = [ocorrencia, {**ocorrencia, "idOcorrencia": 5, "status": "EM_ANDAMENTO"},
                {**ocorrencia, "idOcorrencia": 9, "status": "RESOLVIDA"}]
        with patch("dados.buscar_json", side_effect=[fila, categorias, equipes]) as buscar:
            with redirect_stderr(io.StringIO()):
                dados = carregar_dados("http://localhost:8080/")
        self.assertEqual([chamada.args[0] for chamada in buscar.call_args_list], [
            "http://localhost:8080/ocorrencias/fila", "http://localhost:8080/categorias",
            "http://localhost:8080/equipes"])
        self.assertEqual(len(dados["ocorrencias"]), 2)
        self.assertEqual(dados["ocorrencias"][0]["endereco"], "Rua A, 288")
        self.assertEqual(dados["ocorrencias"][0]["horas_estimadas"], 2)
        self.assertEqual(dados["equipes"][0]["base"]["latitude"], -23.55)
