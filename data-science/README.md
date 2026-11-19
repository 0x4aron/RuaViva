# Data Science & Statistical Computing

Notebook: [`zeladoria_sp156.ipynb`](zeladoria_sp156.ipynb), entregue já executado. Os gráficos e resultados aparecem direto no GitHub.

## Perguntas

| Modelo | Pergunta | Resultado no teste (out-dez/2025) |
|---|---|---|
| **Regressão linear** | Quantos pedidos de zeladoria cada subprefeitura vai receber amanhã? | Com piso zero, MAE 11,459 · RMSE 16,462 · R² 0,561 (contra R² 0,336 de repetir a média da semana) |
| **Regressão logística** | Este pedido corre risco de **não** ser resolvido em até 7 dias? | Com limiar 0,5, precisão 0,518 · recall 0,851 · F1 0,644 · AUC 0,819 |

A regressão linear gerou 88 previsões negativas. Como a demanda é uma contagem, aplicamos piso zero. Antes do piso, o MAE era 11,598, o RMSE era 16,532 e o R² era 0,558.

Nos 92 dias de teste, o limiar 0,5 gerou 52.784 alertas nas 32 subprefeituras (574 por dia, em média), dos quais 25.464 foram falsos positivos (277 por dia). Com capacidade de cerca de 250 revisões diárias na cidade, o limiar 0,7 geraria 247 alertas por dia e o recall cairia para 0,458.

No modelo logístico, cada desvio-padrão a mais nas aberturas do mesmo assunto na mesma subprefeitura na semana anterior esteve associado a uma razão de chances de atraso de 1,11, mantidas as demais variáveis.

## Dados

- **Fonte:** Portal de Dados Abertos da Prefeitura de São Paulo, conjunto [Dados do SP156](https://dados.prefeitura.sp.gov.br/dataset/dados-do-sp156) (licença CC0), os 4 trimestres de 2025. A base não tem dados pessoais.
- **CSV usado no pacote.** [`dados/sp156_zeladoria_2025.csv`](dados/sp156_zeladoria_2025.csv) contém 507.859 pedidos. O script [`preparar_base.py`](preparar_base.py) gera [`dados/sp156_zeladoria_2025.csv.gz`](dados/sp156_zeladoria_2025.csv.gz) a partir dos quatro arquivos originais. O notebook lê o CSV descompactado quando disponível e aceita o compactado.
- **Recorte.** Selecionamos assuntos de manutenção da rua e as 32 subprefeituras da [lista da Prefeitura](https://prefeitura.sp.gov.br/web/subprefeituras/subprefeituras/mapa). Todos os pedidos contam para a demanda e para o volume de entradas anteriores.
- **Prazo.** O pedido conta como resolvido se foi finalizado até o sétimo dia, inclusive. Cancelamentos até esse dia e os 85 finalizados sem data válida ficam fora da análise de prazo. Cancelamentos posteriores contam como atraso.
- **Treino e teste.** O teste vai de 01/10 a 31/12/2025. O treino linear usa a demanda até 30/09. Na logística, a última abertura de treino é 23/09, cuja janela termina em 30/09. Foram 384.591 pedidos no treino e 113.145 no teste. A codificação e a padronização são ajustadas no treino.
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

O ZIP inclui os seguintes arquivos.

- `zeladoria_sp156.ipynb`
- `integrantes.txt` (nomes, RMs e fonte)
- `preparar_base.py` e `requirements.txt`
- `dados/sp156_zeladoria_2025.csv`

Para gerar o CSV da entrega a partir do arquivo compactado, execute em `data-science/`:

```bash
gunzip -k dados/sp156_zeladoria_2025.csv.gz
```
