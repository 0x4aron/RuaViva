# Database Design — modelo de dados

Banco: **Oracle** (servidor da FIAP). Os scripts usam sintaxe compatível com Oracle 19c ou superior e foram testados localmente no Oracle XE 21. Este modelo também é a base da API Java (`java-api/`).

> **Atenção antes de rodar no Oracle da FIAP:** o usuário de vocês pode ter tabelas de GS anteriores com prefixo `GS_`. Antes de rodar o `00_drop.sql`, confiram:
> `SELECT table_name FROM user_tables WHERE table_name LIKE 'GS%';`
> O drop só apaga as 9 tabelas listadas abaixo. Mesmo assim, se alguma delas tiver o mesmo nome de uma tabela antiga de vocês, a antiga será apagada.

## Scripts

| Arquivo | Conteúdo |
|---|---|
| [`00_drop.sql`](00_drop.sql) | Apaga as tabelas, para recriar do zero |
| [`01_ddl.sql`](01_ddl.sql) | `CREATE TABLE` (PK, UNIQUE, CHECK) e `ALTER TABLE` (FKs) |
| `02_dml.sql` | _em breve_: `INSERT` com no mínimo 5 linhas por tabela |
| `03_dql.sql` | _em breve_: as 3 consultas pedidas |

Ordem de execução: `00_drop.sql` (só se as tabelas já existirem) → `01_ddl.sql` → `02_dml.sql` → `03_dql.sql`.

## Tabelas

| Tabela | Para que serve |
|---|---|
| `GS_SUBPREFEITURA` | Subprefeituras da cidade (ex.: Sé) |
| `GS_DISTRITO` | Distritos/bairros oficiais (ex.: Liberdade) |
| `GS_CATEGORIA` | Tipos de problema, com prazo, gravidade (1–5) e horas de trabalho estimadas |
| `GS_CIDADAO` | Quem registra e apoia (dados simulados). `FL_PRIORITARIO = 'S'` para idoso/PcD |
| `GS_PONTO_SENSIVEL` | Escola, creche, UBS, hospital, ILPI (casa de repouso para idosos) ou terminal de ônibus. Uma ocorrência perto deles ganha prioridade |
| `GS_EQUIPE` | Equipe de campo, com horas por dia e ponto de saída (lat/long) |
| `GS_OCORRENCIA` | O problema registrado: local, status e prioridade |
| `GS_APOIO` | "Também me afeta": cada cidadão apoia uma ocorrência uma única vez |
| `GS_ATENDIMENTO` | Visita agendada ou concluída de uma equipe a uma ocorrência |

## Diagrama (rascunho)

O diagrama oficial da entrega deve ser gerado no **Oracle Data Modeler**:
`File → Import → DDL File → 01_ddl.sql`. Ele monta as tabelas e os relacionamentos automaticamente.

```mermaid
erDiagram
    GS_SUBPREFEITURA ||--o{ GS_DISTRITO : "tem"
    GS_SUBPREFEITURA ||--o{ GS_EQUIPE : "tem"
    GS_DISTRITO ||--o{ GS_PONTO_SENSIVEL : "tem"
    GS_DISTRITO ||--o{ GS_OCORRENCIA : "localiza"
    GS_CIDADAO ||--o{ GS_OCORRENCIA : "registra"
    GS_CATEGORIA ||--o{ GS_OCORRENCIA : "classifica"
    GS_OCORRENCIA ||--o{ GS_APOIO : "recebe"
    GS_CIDADAO ||--o{ GS_APOIO : "da"
    GS_OCORRENCIA ||--o{ GS_ATENDIMENTO : "gera"
    GS_EQUIPE ||--o{ GS_ATENDIMENTO : "executa"

    GS_SUBPREFEITURA {
        NUMBER ID_SUBPREFEITURA PK
        VARCHAR2 NM_SUBPREFEITURA UK
    }
    GS_DISTRITO {
        NUMBER ID_DISTRITO PK
        NUMBER ID_SUBPREFEITURA FK
        VARCHAR2 NM_DISTRITO UK
    }
    GS_CATEGORIA {
        NUMBER ID_CATEGORIA PK
        VARCHAR2 NM_CATEGORIA UK
        VARCHAR2 DS_CATEGORIA
        NUMBER NR_PRAZO_DIAS
        NUMBER NR_PESO_GRAVIDADE
        NUMBER NR_HORAS_ESTIMADAS
    }
    GS_CIDADAO {
        NUMBER ID_CIDADAO PK
        VARCHAR2 NM_CIDADAO
        VARCHAR2 DS_EMAIL UK
        VARCHAR2 NR_TELEFONE
        CHAR FL_PRIORITARIO
        DATE DT_CADASTRO
    }
    GS_PONTO_SENSIVEL {
        NUMBER ID_PONTO_SENSIVEL PK
        NUMBER ID_DISTRITO FK
        VARCHAR2 NM_PONTO
        VARCHAR2 TP_PONTO
        NUMBER NR_LATITUDE
        NUMBER NR_LONGITUDE
    }
    GS_EQUIPE {
        NUMBER ID_EQUIPE PK
        NUMBER ID_SUBPREFEITURA FK
        VARCHAR2 NM_EQUIPE UK
        NUMBER NR_HORAS_DIA
        NUMBER NR_LATITUDE
        NUMBER NR_LONGITUDE
        CHAR FL_ATIVA
    }
    GS_OCORRENCIA {
        NUMBER ID_OCORRENCIA PK
        NUMBER ID_CIDADAO FK
        NUMBER ID_CATEGORIA FK
        NUMBER ID_DISTRITO FK
        VARCHAR2 DS_OCORRENCIA
        VARCHAR2 DS_LOGRADOURO
        VARCHAR2 NR_ENDERECO
        NUMBER NR_LATITUDE
        NUMBER NR_LONGITUDE
        VARCHAR2 ST_OCORRENCIA
        NUMBER NR_PRIORIDADE
        DATE DT_ABERTURA
        DATE DT_RESOLUCAO
    }
    GS_APOIO {
        NUMBER ID_APOIO PK
        NUMBER ID_OCORRENCIA FK
        NUMBER ID_CIDADAO FK
        DATE DT_APOIO
    }
    GS_ATENDIMENTO {
        NUMBER ID_ATENDIMENTO PK
        NUMBER ID_OCORRENCIA FK
        NUMBER ID_EQUIPE FK
        DATE DT_AGENDADA
        DATE DT_EXECUCAO
        VARCHAR2 ST_ATENDIMENTO
        VARCHAR2 DS_OBSERVACAO
    }
```

## Como os dados se ligam ao resto do projeto

- **Prioridade (Java):** a camada BO calcula `NR_PRIORIDADE` a partir de quatro coisas: o peso da categoria, a quantidade de apoios, a distância até um ponto sensível e se quem registrou é prioritário.
- **Programação dinâmica:** as coordenadas das ocorrências e da base da equipe formam o grafo da rota. `NR_HORAS_ESTIMADAS` (categoria) e `NR_HORAS_DIA` (equipe) são o peso e a capacidade do problema da mochila.
- **Data Science:** o modelo logístico usa um corte fixo de **7 dias**, igual para todas as solicitações do SP156. Isso é diferente de `NR_PRAZO_DIAS`, que é o prazo de cada categoria mostrado ao cidadão (tapa-buraco e entulho, por exemplo, têm prazos diferentes).
- **Dados de exemplo:** parte das ocorrências vem de solicitações reais do SP156 na Liberdade, com endereço e coordenadas reais e sem dados pessoais.
