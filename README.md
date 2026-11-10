# RuaViva — CitizenTech de zeladoria urbana

> Global Solution 2026.2 · FIAP · Engenharia de Software · 2º ano (Fev)

## Ficha da CitizenTech

| Campo | Resposta |
|---|---|
| **Nome da CitizenTech** | RuaViva *(nome provisório)* |
| **Cidade e bairro** | São Paulo (SP), Liberdade, Rua Barão de Iguape (Subprefeitura Sé) |
| **Cidadão beneficiado** | Moradores do bairro, em especial idosos, pessoas com deficiência e quem anda com carrinho de bebê, que dependem de ruas e calçadas em bom estado |
| **Problema, em uma frase** | O morador registra buracos, lixo acumulado e calçadas quebradas na prefeitura, mas não sabe quando o problema vai ser resolvido, nem se outras pessoas já reclamaram do mesmo problema, e os casos que afetam mais gente não recebem prioridade |
| **Como funciona** | O cidadão registra a ocorrência e apoia registros de vizinhos ("também me afeta"). A plataforma prioriza a fila pelo impacto: gravidade do problema, quantas pessoas apoiaram, proximidade de escola, UBS ou casa de repouso, e se quem registrou é idoso ou pessoa com deficiência. Com os dados do SP156, prevê a demanda de cada região e a chance de um pedido ser resolvido em até 7 dias. Também monta a rota diária da equipe de campo |
| **O que cada parte faz** | Ver tabela abaixo |
| **Link do repositório** | <https://github.com/0x4aron/RuaViva> |
| **Indicador de impacto** | Tempo médio até a resolução · % de ocorrências resolvidas em até 7 dias · nº de registros duplicados unificados |
| **ODS conectados** | ODS 11 (Cidades e comunidades sustentáveis) · ODS 10 (Redução das desigualdades) · ODS 9 (Indústria, inovação e infraestrutura) |

### O que cada parte faz

| Pasta | Disciplina | Parte da solução |
|---|---|---|
| [`agile/`](agile/) | Agile Methodology | Personas, casos de uso, backlog (MoSCoW + story points), protótipo de telas, pitch |
| [`ar-vr/`](ar-vr/) | AR-VR Modelling | Vídeo 3D: uma rua do bairro com as ocorrências e a solução em ação |
| [`data-science/`](data-science/) | Data Science | Dados reais do SP156: regressão linear para a demanda diária por subprefeitura e regressão logística para estimar se a solicitação é atendida em até 7 dias |
| [`database/`](database/) | Database Design | Modelo relacional Oracle e scripts DDL, DML e DQL |
| [`java-api/`](java-api/) | DDD - Java | API REST em Spring Boot + Oracle, com deploy no Render |
| [`web/`](web/) | (todas) | Site do MVP: morador registra e apoia problemas; gestor vê a fila e agenda equipes |
| [`dynamic-programming/`](dynamic-programming/) | Dynamic Programming | Rota da equipe de campo (grafos) e escolha das ocorrências dentro do orçamento (tabulação/memoização) |
| [`network/`](network/) | Network Architect | Rede da base de zeladoria da subprefeitura no Packet Tracer |

## Equipe

| Nome | RM |
|---|---|
| Anthony Gonçalves Sforzin | 562096 |
| Cesar Aaron Herrera | 565398 |

## Fonte dos dados

- **SP156 — Solicitações** (Prefeitura de São Paulo, Portal de Dados Abertos, licença CC0): <https://dados.prefeitura.sp.gov.br/dataset/dados-do-sp156>. Os dados não contêm informações pessoais dos solicitantes.
- Os demais dados usados no sistema (cidadãos, equipes) são **simulados**.
