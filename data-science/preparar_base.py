"""
Prepara a base usada no notebook a partir dos arquivos brutos do SP156.

Fonte: Portal de Dados Abertos da Prefeitura de Sao Paulo, conjunto "Dados do SP156"
(licenca CC0): https://dados.prefeitura.sp.gov.br/dataset/dados-do-sp156
Arquivos usados: "Dados do SP156 - 1o, 2o, 3o e 4o TRI 2025" (CSV), salvos em dados/raw/.

Seleciona os assuntos de manutenção da rua nos dois temas de zeladoria. Depois de
padronizar os nomes, mantém as 32 subprefeituras da cidade.
O CSV compactado não inclui endereços.

Uso: python preparar_base.py
"""
from pathlib import Path

import pandas as pd

PASTA = Path(__file__).parent / "dados"
ARQUIVOS = sorted((PASTA / "raw").glob("sp156_2025_t*.csv"))

TEMAS = ["Rua e bairro", "Lixo e limpeza"]

# Assuntos de manutencao fisica da rua (o que a CitizenTech trata)
ASSUNTOS = [
    "Ponto viciado, entulho e caçamba de entulho",
    "Reparos em  Asfalto, Pontes, Viadutos e Túneis",
    "Capinação e roçada de áreas verdes",
    "Calçadas, guias e postes",
    "Drenagem de água de chuva",
    "Varrição e limpeza urbana",
    "Lixeiras Públicas",
    "Coleta de lixo domiciliar",
    "Remoção de grandes objetos",
    "Praças",
    "Ruas, vilas, vielas e escadarias",
    "Fiação e Postes",
    "Guias rebaixadas",
    "Coleta seletiva",
]

NOMES_ANTIGOS = {
    "CASA VERDE-LIMAO-CACHOEIRINHA": "CASA VERDE-CACHOEIRINHA",
    "PERUS-ANHANGUERA": "PERUS",
}

# Lista da Prefeitura com a grafia usada no SP156.
# https://prefeitura.sp.gov.br/web/subprefeituras/subprefeituras/mapa
SUBPREFEITURAS = [
    "ARICANDUVA-FORMOSA-CARRAO", "BUTANTA", "CAMPO LIMPO", "CAPELA DO SOCORRO",
    "CASA VERDE-CACHOEIRINHA", "CIDADE ADEMAR", "CIDADE TIRADENTES",
    "ERMELINO MATARAZZO", "FREGUESIA-BRASILANDIA", "GUAIANASES", "IPIRANGA",
    "ITAIM PAULISTA", "ITAQUERA", "JABAQUARA", "JACANA-TREMEMBE", "LAPA",
    "M BOI MIRIM", "MOOCA", "PARELHEIROS", "PENHA", "PERUS", "PINHEIROS",
    "PIRITUBA-JARAGUA", "SANTANA-TUCURUVI", "SANTO AMARO", "SAO MATEUS",
    "SAO MIGUEL", "SAPOPEMBA", "SE", "VILA MARIA-VILA GUILHERME",
    "VILA MARIANA", "VILA PRUDENTE",
]

COLUNAS = {
    "Data de Abertura": "data_abertura",
    "Data de Finalização": "data_finalizacao",
    "Meio de Comunicação": "meio",
    "Assunto": "assunto",
    "Status": "status",
    "Prefeitura Operacional": "subprefeitura",
    "Distrito": "distrito",
}


def main():
    if len(ARQUIVOS) != 4:
        raise SystemExit(f"Esperava 4 arquivos em {PASTA / 'raw'}, encontrei {len(ARQUIVOS)}")

    partes = [pd.read_csv(a, sep=";", encoding="latin1", dtype=str) for a in ARQUIVOS]
    base = pd.concat(partes, ignore_index=True)
    print(f"Total de solicitacoes em 2025: {len(base):,}")

    base = base[base["Tema"].isin(TEMAS) & base["Assunto"].isin(ASSUNTOS)]
    base = base[list(COLUNAS)].rename(columns=COLUNAS)
    base = base.dropna(subset=["data_abertura", "subprefeitura"])

    # Nomes antigos da mesma subprefeitura -> nome atual
    base["subprefeitura"] = base["subprefeitura"].replace(NOMES_ANTIGOS)
    base = base[base["subprefeitura"].isin(SUBPREFEITURAS)]
    print(f"Subprefeituras: {base['subprefeitura'].nunique()}")

    # Datas no formato ISO (AAAA-MM-DD)
    for coluna in ["data_abertura", "data_finalizacao"]:
        base[coluna] = pd.to_datetime(base[coluna], format="%d/%m/%Y", errors="coerce").dt.strftime("%Y-%m-%d")
    base["assunto"] = base["assunto"].str.replace("  ", " ", regex=False)

    base = base.sort_values("data_abertura").reset_index(drop=True)
    # Salvo compactado (.csv.gz) para caber no GitHub; o pandas le direto
    saida = PASTA / "sp156_zeladoria_2025.csv.gz"
    base.to_csv(saida, index=False, encoding="utf-8", compression="gzip")
    print(f"Solicitacoes de zeladoria: {len(base):,} -> {saida}")


if __name__ == "__main__":
    main()
