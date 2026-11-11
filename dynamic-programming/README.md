# Dynamic Programming — RuaViva

**FIAP — Global Solution 2026.2**

**Integrantes:** Anthony Gonçalves Sforzin (RM 562096) e Cesar Aaron Herrera (RM 565398).

## O problema: plano do dia da equipe

O RuaViva é uma CitizenTech de zeladoria urbana na Liberdade, em São Paulo,
com foco na Rua Barão de Iguape. Moradores registram problemas, o sistema
atribui prioridades e o gestor da subprefeitura organiza os atendimentos.

Este programa escolhe ocorrências pendentes (`ABERTA` e `EM_ANDAMENTO`) para
uma equipe e ordena suas visitas. O objetivo é atender a maior soma de
prioridades possível no modelo da mochila e respeitar a jornada considerando
serviço, deslocamento e retorno à base. A equipe padrão é a Equipe A, ID 1,
com 8 horas disponíveis, saída às 08:00 e velocidade média de 12 km/h.

A solução separa seleção e ordenação: a mochila é ótima para seus custos
aproximados; Held–Karp encontra a rota ótima para o conjunto selecionado.
Essa separação **não garante o ótimo global do problema conjunto de seleção
e rota**. A duração final sempre é conferida antes de exibir o plano.

## Dados do projeto

`dados/liberdade.json` foi extraído de `../database/02_dml.sql`, preservando os
valores das sete categorias, cinco equipes e respectivas bases, cinco pontos
sensíveis e cinco ocorrências pendentes. Cada ocorrência contém ID, categoria,
descrição, endereço, coordenadas, status, prioridade e horas da categoria.

| ID | Categoria | Status | Prioridade | Serviço |
|---|---|---|---:|---:|
| 3 | Limpeza de bueiro | ABERTA | 71 | 2 h |
| 5 | Limpeza de bueiro | EM_ANDAMENTO | 59 | 2 h |
| 7 | Guias e sarjetas | ABERTA | 45 | 4 h |
| 8 | Guias e sarjetas | ABERTA | 59 | 4 h |
| 10 | Tapa-buraco | ABERTA | 57 | 3 h |

Segundo os comentários do SQL, os endereços e coordenadas das ocorrências vêm
de solicitações SP156; descrições, equipes e outros dados são simulados.
Os pontos sensíveis 1–4 têm nomes fictícios e posições aproximadas; a estação
Japão–Liberdade é real, com posição aproximada. Não houve nova validação externa
dos dados: este trabalho reproduz o retrato fornecido pelo projeto.

As prioridades são lidas prontas de `NR_PRIORIDADE`. O SQL e a API usam peso da
categoria × 10, mais 2 por apoio, mais 15 pela proximidade de um ponto sensível
e mais 10 quando o cidadão é prioritário. Os pesos e pontos sensíveis são
preservados como contexto; o programa não recalcula nem duplica esses bônus.

### Integração opcional com Java

Com `--api`, `urllib.request` consulta `GET /ocorrencias/fila`, `/categorias`
e `/equipes`, com timeout de 5 segundos por requisição. Os campos camelCase
dos modelos Java são convertidos para o mesmo formato interno do JSON.
Só entram registros recebidos com status `ABERTA` ou `EM_ANDAMENTO`.
Se ocorrer falha de rede, JSON inválido ou inconsistência nos campos utilizados,
o programa avisa no terminal e usa integralmente o retrato local.

**Diferença da fila:** na implementação Java deste repositório, `/ocorrencias/fila`
retorna ocorrências abertas sem atendimento. Portanto, a ocorrência 5, que já
está agendada, não é retornada por esse endpoint. O modo API respeita a fila
recebida e pode gerar outro plano; não mistura ocorrências locais com dados
atuais. Os três endpoints não fornecem pontos sensíveis, então essa lista fica
vazia no modo API, sem afetar o cálculo que usa a prioridade já recebida.

## Como as técnicas foram usadas

### Grafos: deslocamento entre base e ocorrências

Em `grafo.py`, cada nó é a base, uma ocorrência ou um dos seis cruzamentos
didáticos da região. As coordenadas dos cruzamentos em `CRUZAMENTOS` são
**aproximadas**. Os IDs internos começam em zero para a base, seguidos pelas
ocorrências e pelos cruzamentos; não são os IDs do banco.

Conectamos pares cuja distância Haversine seja de até 400 metros. A aresta é
bidirecional, com peso `Haversine × 1,3`, em metros, para aproximar o desvio
das quadras. Se houver componentes separados, conectamos o componente da
base ao nó mais próximo de outro componente e repetimos. Isso também resolve
grupos desconectados que não possuem nenhum nó isolado. Essas pontes podem
ultrapassar 400 metros e sua quantidade aparece no terminal.

Dijkstra, implementado com `heapq`, encontra os menores caminhos a partir de
cada ponto de interesse. Entradas antigas da fila são descartadas quando já
existe uma distância menor. O resultado é uma matriz de distâncias entre base
e ocorrências, permitindo passar pelos cruzamentos ou por outras ocorrências
sem necessariamente atendê-las. A matriz de tempos usa:

```text
tempo em minutos = distância em metros / (velocidade em km/h × 1000 / 60)
```

### Tabulação: mochila 0/1

Em `mochila.py`, cada ocorrência é um item indivisível: ou todo o serviço entra
no dia, ou fica para outro dia. A tabela é preenchida de baixo para cima:

```text
B = piso(horas disponíveis × 60 / 15)
custo[i] = teto((horas de serviço[i] × 60 + minutos da base até i) / 15)
valor[i] = prioridade[i]

tabela[i][b] = tabela[i - 1][b]                         se o item não cabe
tabela[i][b] = máximo(tabela[i - 1][b],
                     valor[i] + tabela[i - 1][b - custo[i]])  se cabe
```

A linha zero começa com valor zero. Cada célula compara excluir ou incluir o
item usando somente a linha anterior, evitando escolher a mesma ocorrência
duas vezes. A reconstrução percorre a tabela de trás para frente: se o valor
aumentou em relação à linha anterior, aquele item foi escolhido. Em empate,
mantemos a solução anterior. A CLI ordena os itens por ID para dar estabilidade
a esse critério. A versão de força bruta enumera todos os `2ⁿ` subconjuntos.

**Simplificação da ida:** cada item paga uma ida desde a base. Isso não é a
viagem real entre serviços nem inclui explicitamente o retorno. Pode tanto
superestimar quanto subestimar o deslocamento total. Após calcular a rota,
somamos serviço e viagem completa. Se ultrapassar a jornada, reduzimos a
capacidade da mochila em um bloco e repetimos até encontrar um plano viável,
mesmo que vazio. Essa correção garante o limite de horas no modelo, mas pode
descartar combinações melhores para o problema conjunto.

### Memoização: Held–Karp para a rota

Em `rota.py`, `visitar(atual, visitados)` calcula a menor distância restante
até atender todos os escolhidos e retornar à base. `visitados` é uma máscara
de bits: cada bit representa uma ocorrência, e `1` significa já visitada.
O decorador `functools.lru_cache(maxsize=None)` guarda o resultado por estado.

```text
Se todos foram visitados: devolver distância[atual][base].
Senão: escolher o menor valor de
       distância[atual][próximo] + visitar(próximo, visitados com próximo marcado).
```

Assim, subproblemas repetidos são calculados uma única vez. A reconstrução
consulta os custos guardados para escolher cada próximo destino. A rota
sempre começa e termina em zero, inclusive sem visitas: `[0, 0]`.

Também implementamos o **vizinho mais próximo**, que escolhe o destino ainda
não visitado mais perto do atual, e a **força bruta**, que testa todas as ordens
com `itertools.permutations`. A gulosa é rápida, mas pode produzir uma rota
maior; a força bruta serve como referência para poucos pontos.

### Complexidades

Considere `V` nós, `E` arestas, `K` pontos de interesse (base + pendentes),
`n` itens da mochila, `B` blocos disponíveis e `m` visitas escolhidas.
A memória abaixo é adicional à entrada; a matriz de distâncias já ocupa `O(K²)`.

| Algoritmo | Tempo | Memória adicional |
|---|---|---|
| Montar vizinhança por pares | O(V²) | O(V + E) |
| Conectar componentes, implementação simples | O(V³) no pior caso | O(V + E) |
| Dijkstra com heap | O((V + E) log V) | O(V + E) |
| Gerar matrizes com K execuções de Dijkstra | O(K(V + E) log V + K²) | O(K² + V + E) |
| Mochila tabulada, incluindo reconstrução | O(n(B + 1)) | O(n(B + 1)) |
| Mochila por força bruta | O(n × 2ⁿ) | O(n) |
| Held–Karp memoizado | O(m² × 2ᵐ) | O(m × 2ᵐ) |
| Rota por força bruta | O(m × m!) | O(m) |
| Vizinho mais próximo | O(m²) | O(m) |

A correção da jornada pode repetir mochila e Held–Karp até `B + 1` vezes.
Usando `m` como o maior conjunto escolhido nessas tentativas, seu limite de
tempo é `O((B + 1) × (n(B + 1) + m² × 2ᵐ))`. A memória de trabalho é reutilizada
entre tentativas, sem guardar todos os planos. Como Held–Karp ainda é
exponencial, a CLI rejeita conjuntos escolhidos com mais de 16 visitas e pede
uma redução da jornada. A comparação por permutações vai somente até 8 visitas.

## Funcionalidades e arquivos

- `dados.py` e `dados/liberdade.json`: retrato do SQL, leitura da API e fallback.
- `grafo.py`: Haversine, vizinhança, conexão dos componentes e Dijkstra.
- `mochila.py`: custo em blocos, tabulação, reconstrução e força bruta.
- `rota.py`: Held–Karp, vizinho mais próximo e permutações.
- `main.py`: argumentos, conferência da jornada, motivos de adiamento, horários
  por visita, retorno à base, prioridade total e comparação de eficiência.
- `testes/test_*.py`: testes automatizados com `unittest`; `testes/__init__.py`
  permite a descoberta automática; `.gitignore` ignora caches do Python.

## Como executar

Requer **Python 3.10 ou superior**, somente biblioteca padrão. Não há instalação
com `pip`, dependências externas, frameworks ou necessidade de banco em execução.
Na raiz do repositório:

```bash
cd dynamic-programming
python main.py
python main.py --comparar
python main.py --equipe 2 --horas 6
python main.py --velocidade 5
python main.py --api http://localhost:8080
python -m unittest
python -m unittest -v
```

Em sistemas que disponibilizam o interpretador como `python3`, substitua
`python` por `python3` em todos os comandos. Esse foi o nome utilizado na
validação deste ambiente. O JSON é localizado em relação a `dados.py`, então
também funciona executar `python dynamic-programming/main.py` a partir da raiz.

`--horas` aceita de 0 a 24; valores fracionários usam ponto decimal.
`--velocidade` aceita qualquer número positivo finito em km/h. IDs inexistentes
e equipes inativas geram erro claro. A opção `--equipe` muda a base e a jornada,
mas mantém a fila da Liberdade: equipes de outras subprefeituras representam
uma simulação de apoio, sem verificar competência territorial ou especialidade.

### Comparação e testes

`--comparar` imprime o plano normal e depois mede entradas sintéticas com
semente fixa 42. Para rotas, usa de 2 a 8 visitas e compara distância, tempo
em milissegundos e quantidade de estados novos no cache, permutações ou
candidatos avaliados. Para a mochila, compara de 4 a 16 itens com capacidade
32, mostrando células calculadas ou subconjuntos. As unidades são diferentes;
não representam a mesma quantidade de trabalho por unidade. A contagem do
cache inclui estados terminais, mas não consultas que já estavam memorizadas.

São medições únicas com `time.perf_counter`, incluindo reconstrução, sem
pretensão de benchmark rigoroso. Os tempos variam entre execuções. Por exemplo,
com 8 visitas foram 1.025 estados memoizados contra 40.320 permutações. No caso
de 4 visitas, a gulosa percorreu 4.722,6 m, contra 3.955,2 m da solução ótima.

A validação executou o programa normal, `--comparar` e **17 testes, todos
aprovados**. Os testes incluem caminhos conhecidos de Dijkstra, componentes
desconectados, 150 casos aleatórios de mochila com semente fixa, rotas de zero
a sete visitas contra permutações, começo/fim na base, dados do SQL, API
simulada, fallback, fila vazia e correção do limite ao incluir a volta.
A integração HTTP foi testada com mocks da biblioteca padrão, sem depender
de uma instância Java e Oracle em execução.

## Exemplo real da saída

Saída capturada de `python3 main.py`, com os dados locais e opções padrão:

```text
========================================================================
RUAVIVA | PLANO DO DIA — LIBERDADE / SÃO PAULO
========================================================================
Fonte: database/02_dml.sql
Equipe: Zeladoria Se - Equipe A (ID 1) | Jornada: 8 h
Base: -23.5503000, -46.6339000
Dados: 5 pendentes | 7 categorias | 5 equipes
Grafo: 12 nós / 27 arestas / 1 pontes extras
Velocidade média: 12 km/h | Distância: Haversine × 1,3

MOCHILA | 31/32 blocos de 15 min usados
  #03 Limpeza de bueiro | prioridade 71 | 9 blocos
      Rua Barao de Iguape, 288 — HOJE: integra a melhor soma de prioridades da mochila
  #05 Limpeza de bueiro | prioridade 59 | 9 blocos
      Rua Barao de Iguape, 277 — HOJE: integra a melhor soma de prioridades da mochila
  #07 Guias e sarjetas | prioridade 45 | 17 blocos
      Rua Barao de Iguape, 664 — AMANHÃ: não cabe junto à combinação escolhida
  #08 Guias e sarjetas | prioridade 59 | 17 blocos
      Rua Barao de Iguape, 319 — AMANHÃ: não cabe junto à combinação escolhida
  #10 Tapa-buraco | prioridade 57 | 13 blocos
      Rua Doutor Siqueira Campos, 23 — HOJE: integra a melhor soma de prioridades da mochila

ROTA ÓTIMA PARA AS VISITAS ESCOLHIDAS | saída às 08:00
  1. 08:00 Base -> 08:06 #5 | 1231 m / 6.2 min
     Serviço 08:06–10:06: Boca de lobo com mau cheiro e lixo acumulado
  2. 10:06 #5 -> 10:06 #3 | 32 m / 0.2 min
     Serviço 10:06–12:06: Bueiro entupido, rua alaga quando chove
  3. 12:06 #3 -> 12:11 #10 | 926 m / 4.6 min
     Serviço 12:11–15:11: Buraco fundo perto da creche
  4. 15:11 #10 -> 15:21 Base | 2072 m / 10.4 min

PRIORIDADE ATENDIDA: 187
Trabalho: 7.00 h | Deslocamento: 21.3 min / 4261 m
Total: 7.36 h de 8 h | Folga: 38.7 min | Retorno: 15:21
Horários estimados; a soma considera os tempos antes do arredondamento.
```

## Limitações honestas

- O grafo é didático: posições aproximadas dos cruzamentos, raio de 400 m,
  fator fixo 1,3 e pontes artificiais não reproduzem ruas, restrições de acesso,
  mão única, semáforos, relevo ou trânsito em tempo real.
- Os trechos impressos são menores caminhos entre os pontos atendidos, não
  instruções de navegação curva a curva. Distâncias são arredondadas para metros
  na exibição; os cálculos mantêm os valores completos.
- A ida por item e os blocos de 15 minutos podem deixar capacidade útil de fora.
  A otimização conjunta de seleção e rota não é resolvida exatamente.
- A velocidade é constante e configurável: 12 km/h representa veículo lento;
  para simular caminhada, pode-se usar `--velocidade 5`.
- Não há pausas, almoço, deslocamento de materiais, especialização das equipes
  nem incerteza na duração dos serviços. `EM_ANDAMENTO` usa as horas integrais
  da categoria porque não há estimativa de horas restantes nos dados.
- Os horários partem das 08:00 e são arredondados ao minuto mais próximo. Um
  trecho curto pode mostrar partida e chegada no mesmo minuto. A conferência
  da jornada usa tempos completos, incluindo a volta à base.
- O retrato local não se atualiza sozinho. O modo API pode receber uma fila
  diferente porque exclui atendimentos já agendados; uma fila vazia válida
  permanece vazia e não aciona fallback.
- A ferramenta simula um plano para uma equipe por vez; não distribui tarefas
  entre várias equipes, não grava atendimentos nem altera a API ou o banco.
  “Amanhã” significa adiado, sem reserva automática para uma data futura.
