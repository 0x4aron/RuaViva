"""Leitura do retrato local ou da fila da API Java."""

import json
import math
import sys
from pathlib import Path
from urllib.request import urlopen


ARQUIVO = Path(__file__).parent / "dados" / "liberdade.json"
PENDENTES = {"ABERTA", "EM_ANDAMENTO"}


def buscar_json(url):
    """Busca uma lista JSON com limite de espera."""
    with urlopen(url, timeout=5) as resposta:
        registros = json.load(resposta)
    if not isinstance(registros, list):
        raise ValueError("A API deve devolver uma lista de registros.")
    return registros


def converter_ocorrencia(registro, categorias):
    """Relaciona a ocorrência com as horas da categoria."""
    categoria = categorias[registro["idCategoria"]]
    numero = registro.get("numero") or "s/n"
    return {
        "id": registro["idOcorrencia"],
        "categoria_id": categoria["id"], "categoria": categoria["nome"],
        "distrito_id": registro["idDistrito"],
        "descricao": registro["descricao"],
        "endereco": f'{registro["logradouro"]}, {numero}',
        "latitude": registro["latitude"], "longitude": registro["longitude"],
        "status": registro["status"], "prioridade": registro["prioridade"],
        "horas_estimadas": categoria["horas_estimadas"],
    }


def carregar_api(url):
    """Converte os campos camelCase usados pelo Java."""
    url = url.rstrip("/")
    fila = buscar_json(url + "/ocorrencias/fila")
    categorias = [{
        "id": c["idCategoria"], "nome": c["nome"],
        "horas_estimadas": c["horasEstimadas"],
        "peso_gravidade": c["pesoGravidade"],
    } for c in buscar_json(url + "/categorias")]
    equipes = [{
        "id": e["idEquipe"], "nome": e["nome"],
        "subprefeitura_id": e["idSubprefeitura"],
        "horas_dia": e["horasDia"], "ativa": e["ativa"],
        "base": {"latitude": e["latitude"], "longitude": e["longitude"]},
    } for e in buscar_json(url + "/equipes")]
    por_id = {c["id"]: c for c in categorias}
    ocorrencias = [converter_ocorrencia(o, por_id) for o in fila
                   if o["status"] in PENDENTES]
    return {"origem": f"API {url}", "categorias": categorias,
            "equipes": equipes, "ocorrencias": ocorrencias,
            "pontos_sensiveis": []}


def validar(dados):
    """Rejeita valores que impedem calcular o plano."""
    for grupo in (dados["equipes"], dados["ocorrencias"]):
        ids = [registro["id"] for registro in grupo]
        if len(ids) != len(set(ids)):
            raise ValueError("IDs duplicados nos dados.")
        for registro in grupo:
            ponto = registro.get("base", registro)
            for campo, limite in (("latitude", 90), ("longitude", 180)):
                valor = ponto[campo]
                if not math.isfinite(valor) or not -limite <= valor <= limite:
                    raise ValueError("Coordenada inválida.")
            campos = ("horas_dia",) if "base" in registro else (
                "horas_estimadas", "prioridade")
            for campo in campos:
                if not math.isfinite(registro[campo]) or registro[campo] < 0:
                    raise ValueError(f"Valor inválido: {campo}.")


def carregar_dados(api=None):
    """Tenta a API; em caso de falha, usa o JSON completo."""
    if api:
        try:
            dados = carregar_api(api)
            validar(dados)
            print("Aviso: a fila da API exclui ocorrências já agendadas.",
                  file=sys.stderr)
            return dados
        except (OSError, ValueError, KeyError, TypeError) as erro:
            print(f"Aviso: falha na API ({erro}). Usando o JSON local.",
                  file=sys.stderr)
    dados = json.loads(ARQUIVO.read_text(encoding="utf-8"))
    validar(dados)
    return dados
