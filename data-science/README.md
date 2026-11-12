# Data Science & Statistical Computing

Notebook: [`zeladoria_sp156.ipynb`](zeladoria_sp156.ipynb), entregue já executado. Os gráficos e resultados aparecem direto no GitHub.

## Perguntas

| Modelo | Pergunta | Resultado no teste (out-dez/2025) |
|---|---|---|
| **Regressão linear** | Quantos pedidos de zeladoria cada subprefeitura vai receber amanhã? | MAE 11,6 · RMSE 16,5 · R² 0,56 (contra R² 0,34 de repetir a média da semana) |
| **Regressão logística** | Este pedido corre risco de **não** ser resolvido em até 7 dias? | Recall 0,85 · Precisão 0,52 · F1 0,64 · AUC 0,82 |

Hipótese testada e confirmada: quanto mais pedidos do mesmo tipo chegaram à mesma região na semana anterior (fila cheia), maior o risco de atraso.

## Dados

- **Fonte:** Portal de Dados Abertos da Prefeitura de São Paulo, conjunto [Dados do SP156](https://dados.prefeitura.sp.gov.br/dataset/dados-do-sp156) (licença CC0), os 4 trimestres de 2025. A base não tem dados pessoais.
- **Base usada:** [`dados/sp156_zeladoria_2025.csv.gz`](dados/), com 507.859 pedidos de zeladoria das 32 subprefeituras. Ela é gerada pelo [`preparar_base.py`](preparar_base.py) a partir dos arquivos originais.
- **Sem vazamento de dados:**
  - treino com jan-set e teste com out-dez (divisão por data);
  - variáveis calculadas só com dias anteriores;
  - codificação e padronização ajustadas só no treino, dentro de um `Pipeline`.

## Como executar

```bash
cd data-science
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/jupyter notebook zeladoria_sp156.ipynb
```

Para recriar a base do zero, baixe os 4 CSVs de 2025 do portal para `dados/raw/` com os nomes `sp156_2025_t1.csv` a `sp156_2025_t4.csv` e rode `python preparar_base.py`.

## Entrega no Teams

Um ZIP com:
- `zeladoria_sp156.ipynb`;
- `integrantes.txt` (nomes, RMs e fonte);
- `preparar_base.py` (como a base foi gerada);
- `dados/sp156_zeladoria_2025.csv` (versão descompactada do `.csv.gz` gerado por `preparar_base.py`; para gerar, rode `gunzip -k dados/sp156_zeladoria_2025.csv.gz`; o notebook lê esse arquivo se ele existir).
