# RuaViva — CitizenTech de zeladoria urbana

> Global Solution 2026.2 · FIAP · Engenharia de Software · 2º ano (Fev)

## Ficha da CitizenTech

| Campo | Resposta |
|---|---|
| **Nome da CitizenTech** | RuaViva (Equipe RuaViva) |
| **Cidade e bairro** | São Paulo (SP), Liberdade, Rua Barão de Iguape (Subprefeitura Sé) |
| **Cidadão beneficiado** | Moradores do bairro, em especial idosos, pessoas com deficiência e quem anda com carrinho de bebê, que dependem de ruas e calçadas em bom estado |
| **Problema, em uma frase** | Quem encontra um problema na rua precisa saber se um vizinho já avisou e se a prefeitura marcou uma visita. |
| **Como funciona** | No site, o morador registra problemas e apoia os dos vizinhos. O gestor agenda visitas pela fila. A prioridade considera a gravidade, os apoios, a distância a pontos sensíveis e a condição prioritária do autor. No notebook, estimamos a demanda diária e o risco de atraso. No terminal, planejamos as visitas de uma equipe dentro da jornada. |
| **O que cada parte faz** | Ver tabela abaixo |
| **Link do repositório** | <https://github.com/0x4aron/RuaViva> |
| **Indicadores propostos** | Tempo médio até a resolução, percentual resolvido em até sete dias e apoios dados a partir do aviso de registro parecido. |
| **ODS conectados** | ODS 11 pela conservação de ruas e calçadas. ODS 10 pela prioridade a idosos e pessoas com deficiência. Para o ODS 9, usamos os registros por endereço para planejar a manutenção da infraestrutura do bairro, como bueiros e sarjetas. |

### O que cada parte faz

| Pasta | Disciplina | Parte da solução |
|---|---|---|
| [`agile/`](agile/) | Agile Methodology | Personas, casos de uso, backlog (MoSCoW + story points), protótipo de telas, pitch |
| [`ar-vr/`](ar-vr/) | AR-VR Modelling | Vídeo 3D: uma rua do bairro com as ocorrências e a solução em ação |
| [`data-science/`](data-science/) | Data Science | Dados reais do SP156: regressão linear para a demanda diária por subprefeitura e regressão logística para estimar o risco de o pedido passar de sete dias |
| [`database/`](database/) | Database Design | Modelo relacional Oracle e scripts DDL, DML e DQL |
| [`java-api/`](java-api/) | DDD - Java | API REST em Spring Boot + Oracle, publicada em [ruaviva-api.onrender.com](https://ruaviva-api.onrender.com/swagger-ui.html) |
| [`web/`](web/) | (todas) | Site do MVP, publicado em [ruaviva.onrender.com](https://ruaviva.onrender.com): morador registra e apoia problemas; gestor vê a fila e agenda equipes. Sistema de design em [`web/DESIGN.md`](web/DESIGN.md) |
| [`docs/`](docs/) | (todas) | Documentos das entregas em HTML, que viram PDF com `./docs/gerar_pdfs.sh` |
| [`dynamic-programming/`](dynamic-programming/) | Dynamic Programming | Rota da equipe de campo (grafos) e escolha das ocorrências dentro do orçamento (tabulação/memoização) |
| [`network/`](network/) | Network Architect | Rede da base de zeladoria da subprefeitura no Packet Tracer 9.0.1 |
| [`prompts.md`](prompts.md) | (todas) | Registro do uso de IA: os pedidos feitos, as decisões da equipe e o que foi conferido |

## Como rodar o MVP

1. Banco: rode `database/01_ddl.sql` e `database/02_dml.sql` no Oracle (arquivos em UTF-8).
2. API: em `java-api/`, defina `DB_URL`, `DB_USER` e `DB_PASSWORD` e rode `mvn spring-boot:run` (Swagger em `/swagger-ui.html`). Teste de regressão: `java-api/testes/regressao.sh`.
3. Site: `python3 -m http.server 5500 --directory web` e abra <http://localhost:5500>. O endereço da API fica em `web/js/config.js`.

## Design

Usamos placas azuis para identificar endereços, amarelo para a ação principal e verde para serviços resolvidos. As cores e os componentes estão em [web/DESIGN.md](web/DESIGN.md).

## Equipe

| Nome | RM |
|---|---|
| Anthony Gonçalves Sforzin | 562096 |
| Cesar Aaron Herrera | 565398 |

## Fonte dos dados

- **SP156 — Solicitações** (Prefeitura de São Paulo, Portal de Dados Abertos, licença CC0): <https://dados.prefeitura.sp.gov.br/dataset/dados-do-sp156>. Os dados não contêm informações pessoais dos solicitantes.
- Os demais dados usados no sistema (cidadãos, equipes) são **simulados**.
