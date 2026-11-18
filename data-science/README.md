# Data Science & Statistical Computing

Notebook: [`zeladoria_sp156.ipynb`](zeladoria_sp156.ipynb), entregue já executado. Os gráficos e resultados aparecem direto no GitHub.

## Perguntas

| Modelo | Pergunta | Resultado no teste (out-dez/2025) |
|---|---|---|
| **Regressão linear** | Quantos pedidos de zeladoria cada subprefeitura vai receber amanhã? | MAE 11,598 · RMSE 16,532 · R² 0,558 (contra R² 0,336 de repetir a média da semana) |
| **Regressão logística** | Este pedido corre risco de **não** ser resolvido em até 7 dias? | Precisão 0,516 · Recall 0,852 · F1 0,643 · AUC 0,819 |

No modelo logístico, cada desvio-padrão a mais nas aberturas do mesmo assunto na mesma subprefeitura na semana anterior esteve associado a uma razão de chances de atraso de 1,11, mantidas as demais variáveis.

## Dados

- **Fonte:** Portal de Dados Abertos da Prefeitura de São Paulo, conjunto [Dados do SP156](https://dados.prefeitura.sp.gov.br/dataset/dados-do-sp156) (licença CC0), os 4 trimestres de 2025. A base não tem dados pessoais.
- **Base usada:** [`dados/sp156_zeladoria_2025.csv.gz`](dados/sp156_zeladoria_2025.csv.gz), com 507.859 pedidos de zeladoria das 32 subprefeituras. Ela é gerada pelo [`preparar_base.py`](preparar_base.py) a partir dos arquivos originais.
- **Recorte**. Selecionamos assuntos de manutenção da rua e mantivemos os órgãos com pelo menos 3.000 registros. As aberturas de pedidos cancelados e dos 85 finalizados sem data válida contam para a demanda e para o volume dos sete dias anteriores. Esses pedidos ficam fora da análise de prazo.
- **Treino e teste**. O teste vai de 01/10 a 31/12/2025. O treino linear usa a demanda até 30/09. Na logística, a última abertura de treino é 24/09, sete dias antes do corte. Foram 385.593 pedidos no treino e 112.910 no teste. A codificação e a padronização são ajustadas no treino.
- **Previsão demonstrativa**. O histórico termina em 31/12/2025. O modelo prevê 01/01/2026 usando o dia da semana e as contagens anteriores. Ele não tem uma variável específica para feriados.

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
