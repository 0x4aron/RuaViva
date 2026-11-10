-- =============================================================
-- Global Solution 2026.2 - CitizenTech de zeladoria urbana
-- Script DQL: consultas (rodar depois do 02_dml.sql)
-- =============================================================


-- -------------------------------------------------------------
-- CONSULTA 1 - INNER JOIN entre duas tabelas
-- Painel do cidadao: ocorrencias da Rua Barao de Iguape com o
-- nome da categoria, o status e a prioridade.
-- Tabelas: GS_OCORRENCIA e GS_CATEGORIA
-- -------------------------------------------------------------
SELECT o.ID_OCORRENCIA,
       c.NM_CATEGORIA,
       o.DS_LOGRADOURO || ', ' || o.NR_ENDERECO AS ENDERECO,
       o.ST_OCORRENCIA,
       o.NR_PRIORIDADE,
       TO_CHAR(o.DT_ABERTURA, 'DD/MM/YYYY')     AS DATA_ABERTURA
  FROM GS_OCORRENCIA o
 INNER JOIN GS_CATEGORIA c
    ON c.ID_CATEGORIA = o.ID_CATEGORIA
 WHERE o.DS_LOGRADOURO = 'Rua Barao de Iguape'
 ORDER BY o.DT_ABERTURA;


-- -------------------------------------------------------------
-- CONSULTA 2 - INNER JOIN com funcoes de grupo e GROUP BY
-- Indicadores por categoria: total de ocorrencias, quantas foram
-- resolvidas, media de dias ate a resolucao e prioridade media.
-- Tabelas: GS_OCORRENCIA e GS_CATEGORIA
-- -------------------------------------------------------------
SELECT c.NM_CATEGORIA,
       c.NR_PRAZO_DIAS                                              AS PRAZO_DIAS,
       COUNT(o.ID_OCORRENCIA)                                       AS TOTAL_OCORRENCIAS,
       SUM(CASE WHEN o.ST_OCORRENCIA = 'RESOLVIDA' THEN 1 ELSE 0 END) AS RESOLVIDAS,
       ROUND(AVG(o.DT_RESOLUCAO - o.DT_ABERTURA), 1)                AS MEDIA_DIAS_RESOLUCAO,
       ROUND(AVG(o.NR_PRIORIDADE), 1)                               AS PRIORIDADE_MEDIA
  FROM GS_OCORRENCIA o
 INNER JOIN GS_CATEGORIA c
    ON c.ID_CATEGORIA = o.ID_CATEGORIA
 GROUP BY c.NM_CATEGORIA, c.NR_PRAZO_DIAS
 ORDER BY TOTAL_OCORRENCIAS DESC, c.NM_CATEGORIA;


-- -------------------------------------------------------------
-- CONSULTA 3 - LEFT OUTER JOIN com WHERE e ORDER BY
-- Fila de trabalho do gestor: ocorrencias ABERTAS que ainda nao
-- tem nenhum atendimento agendado, da maior para a menor prioridade.
-- O LEFT JOIN traz todas as ocorrencias; as que nao tem atendimento
-- ficam com as colunas de GS_ATENDIMENTO nulas, e o WHERE filtra
-- justamente essas.
-- Tabelas: GS_OCORRENCIA e GS_ATENDIMENTO
-- -------------------------------------------------------------
SELECT o.ID_OCORRENCIA,
       o.DS_LOGRADOURO || ', ' || o.NR_ENDERECO AS ENDERECO,
       o.DS_OCORRENCIA,
       o.NR_PRIORIDADE,
       TRUNC(SYSDATE - o.DT_ABERTURA)           AS DIAS_EM_ABERTO
  FROM GS_OCORRENCIA o
  LEFT OUTER JOIN GS_ATENDIMENTO a
    ON a.ID_OCORRENCIA = o.ID_OCORRENCIA
 WHERE o.ST_OCORRENCIA = 'ABERTA'
   AND a.ID_ATENDIMENTO IS NULL
 ORDER BY o.NR_PRIORIDADE DESC, o.DT_ABERTURA;
