-- Remove todas as tabelas do projeto (use antes de rodar o 01_ddl.sql de novo).
-- Ordem: das tabelas que dependem para as tabelas de base.
-- ATENCAO: confira antes se nao existe tabela antiga com o mesmo nome no seu usuario:
--   SELECT table_name FROM user_tables WHERE table_name LIKE 'GS%';

DROP TABLE GS_ATENDIMENTO     CASCADE CONSTRAINTS;
DROP TABLE GS_APOIO           CASCADE CONSTRAINTS;
DROP TABLE GS_OCORRENCIA      CASCADE CONSTRAINTS;
DROP TABLE GS_EQUIPE          CASCADE CONSTRAINTS;
DROP TABLE GS_PONTO_SENSIVEL  CASCADE CONSTRAINTS;
DROP TABLE GS_CIDADAO         CASCADE CONSTRAINTS;
DROP TABLE GS_CATEGORIA       CASCADE CONSTRAINTS;
DROP TABLE GS_DISTRITO        CASCADE CONSTRAINTS;
DROP TABLE GS_SUBPREFEITURA   CASCADE CONSTRAINTS;
