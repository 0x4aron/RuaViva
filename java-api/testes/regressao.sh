#!/usr/bin/env bash
# Teste de regressao da API (ciclo de vida, equipe inativa, exclusao, apoio, concorrencia). Uso: regressao.sh [URL]
# Precisa de curl, jq e bc. Rode com a API no ar e o banco recem criado (00_drop, 01_ddl, 02_dml).
set -u
API="${1:-http://localhost:8080}"
TMP="$(mktemp -d)"
ok=0; falhas=0
HOJE="$(TZ=America/Sao_Paulo date +%F)"
AMANHA="$(TZ=America/Sao_Paulo date -d tomorrow +%F)"

req() { # metodo caminho [json] -> imprime codigo; corpo em $TMP/corpo
  if [ $# -ge 3 ]; then
    curl -s -o "$TMP/corpo" -w '%{http_code}' -X "$1" -H 'Content-Type: application/json' -d "$3" "$API$2"
  else
    curl -s -o "$TMP/corpo" -w '%{http_code}' -X "$1" "$API$2"
  fi
}
corpo() { cat "$TMP/corpo"; }
checa() { # descricao esperado obtido
  if [ "$2" = "$3" ]; then ok=$((ok+1)); echo "  ok   $1"; else falhas=$((falhas+1)); echo "  FALHA $1 (esperado $2, veio $3)"; [ -s "$TMP/corpo" ] && echo "        $(head -c 300 "$TMP/corpo")"; fi
}
status_oc() { curl -s "$API/ocorrencias/$1" | jq -r .status; }
agendados() { curl -s "$API/ocorrencias/$1/atendimentos" | jq '[.[] | select(.status=="AGENDADO")] | length'; }
nova_oc() { # cria uma ocorrencia ABERTA e imprime o id
  req POST /ocorrencias "{\"idCidadao\":2,\"idCategoria\":1,\"idDistrito\":1,\"descricao\":\"Teste de regressao $1\",\"logradouro\":\"Rua Barao de Iguape\",\"numero\":\"$((100+$1))\",\"latitude\":-23.5583,\"longitude\":-46.6341}" >/dev/null
  corpo | jq -r .idOcorrencia
}
agendar_json() { echo "{\"idOcorrencia\":$1,\"idEquipe\":$2,\"dataAgendada\":\"$3\"}"; }

echo "== Basico"
checa "GET /ocorrencias/fila" 200 "$(req GET /ocorrencias/fila)"
checa "GET /categorias/regua-peso" 200 "$(req GET /categorias/regua-peso)"
checa "GET /ocorrencias/99999 da 404" 404 "$(req GET /ocorrencias/99999)"
checa "PUT /atendimentos/99999 da 404" 404 "$(req PUT /atendimentos/99999 "$(agendar_json 3 1 "$HOJE")")"
checa "DELETE /atendimentos/99999 da 404" 404 "$(req DELETE /atendimentos/99999)"
checa "DELETE /ocorrencias/99999 da 404" 404 "$(req DELETE /ocorrencias/99999)"
checa "POST atendimento em ocorrencia inexistente da 404" 404 "$(req POST /atendimentos "$(agendar_json 99999 1 "$HOJE")")"

echo "== Ciclo de vida"
OC=$(nova_oc 1)
checa "agendar com equipe inativa (3) da 422" 422 "$(req POST /atendimentos "$(agendar_json "$OC" 3 "$HOJE")")"
checa "agendar visita" 201 "$(req POST /atendimentos "$(agendar_json "$OC" 1 "$HOJE")")"
AT=$(corpo | jq -r .idAtendimento)
checa "ocorrencia vira EM_ANDAMENTO" EM_ANDAMENTO "$(status_oc "$OC")"
checa "concluir visita" 200 "$(req PUT "/atendimentos/$AT" "{\"idOcorrencia\":$OC,\"idEquipe\":1,\"dataAgendada\":\"$HOJE\",\"status\":\"CONCLUIDO\",\"observacao\":\"feito\"}")"
checa "ocorrencia vira RESOLVIDA" RESOLVIDA "$(status_oc "$OC")"
checa "atendimento concluido nao muda (422)" 422 "$(req PUT "/atendimentos/$AT" "{\"idOcorrencia\":$OC,\"idEquipe\":1,\"dataAgendada\":\"$HOJE\"}")"
checa "atendimento concluido nao exclui (422)" 422 "$(req DELETE "/atendimentos/$AT")"
checa "excluir ocorrencia RESOLVIDA da 422" 422 "$(req DELETE "/ocorrencias/$OC")"
checa "visita concluida continua no historico" 1 "$(curl -s "$API/ocorrencias/$OC/atendimentos" | jq 'length')"

OC=$(nova_oc 2)
req POST /atendimentos "$(agendar_json "$OC" 1 "$HOJE")" >/dev/null
AT=$(corpo | jq -r .idAtendimento)
checa "excluir unica visita" 204 "$(req DELETE "/atendimentos/$AT")"
checa "ocorrencia volta a ABERTA" ABERTA "$(status_oc "$OC")"
OCJ=$(curl -s "$API/ocorrencias/$OC")
checa "cancelar ocorrencia pelo PUT" 200 "$(req PUT "/ocorrencias/$OC" "$(echo "$OCJ" | jq -c '.status="CANCELADA"')")"
checa "agendar em ocorrencia cancelada da 422" 422 "$(req POST /atendimentos "$(agendar_json "$OC" 1 "$HOJE")")"
checa "apoiar ocorrencia cancelada da 422" 422 "$(req POST /apoios "{\"idOcorrencia\":$OC,\"idCidadao\":3}")"
checa "PUT de status para RESOLVIDA direto da 422" 422 "$(req PUT "/ocorrencias/$(nova_oc 3)" "$(echo "$OCJ" | jq -c '.status="RESOLVIDA"')")"
checa "excluir ocorrencia ABERTA da 204" 204 "$(req DELETE "/ocorrencias/$(nova_oc 8)")"

echo "== Cancelar visita preserva data e equipe"
OC=$(nova_oc 9)
req POST /atendimentos "$(agendar_json "$OC" 1 "$HOJE")" >/dev/null; AT=$(corpo | jq -r .idAtendimento)
checa "cancelar visita mandando data antiga e outra equipe" 200 "$(req PUT "/atendimentos/$AT" "{\"idOcorrencia\":$OC,\"idEquipe\":2,\"dataAgendada\":\"2020-01-01\",\"status\":\"CANCELADO\"}")"
checa "cancelar preserva a data agendada" "$HOJE" "$(corpo | jq -r .dataAgendada)"
checa "cancelar preserva a equipe" 1 "$(corpo | jq -r .idEquipe)"

echo "== Apoio e prioridade"
OC=$(nova_oc 4)
P0=$(curl -s "$API/ocorrencias/$OC" | jq .prioridade)
checa "apoiar" 201 "$(req POST /apoios "{\"idOcorrencia\":$OC,\"idCidadao\":3}")"
AP=$(corpo | jq -r .idApoio)
P1=$(curl -s "$API/ocorrencias/$OC" | jq .prioridade)
checa "apoio soma 2 na prioridade" "$(echo "$P0 + 2" | bc)" "$(echo "$P1" | bc)"
OCJ=$(curl -s "$API/ocorrencias/$OC")
req PUT "/ocorrencias/$OC" "$(echo "$OCJ" | jq -c '.descricao="Descricao editada"')" >/dev/null
checa "PUT mantem a prioridade com o apoio" "$(echo "$P1" | bc)" "$(corpo | jq .prioridade | bc)"
checa "apoio duplicado da 422" 422 "$(req POST /apoios "{\"idOcorrencia\":$OC,\"idCidadao\":3}")"
checa "retirar apoio" 204 "$(req DELETE "/apoios/$AP")"
checa "retirar apoio devolve a prioridade" "$(echo "$P0" | bc)" "$(curl -s "$API/ocorrencias/$OC" | jq .prioridade | bc)"

echo "== Equipe inativada depois do agendamento"
OC=$(nova_oc 5)
req POST /atendimentos "$(agendar_json "$OC" 2 "$HOJE")" >/dev/null
AT=$(corpo | jq -r .idAtendimento)
EQ=$(curl -s "$API/equipes/2")
req PUT /equipes/2 "$(echo "$EQ" | jq -c '.ativa=false')" >/dev/null
checa "reagendar so a data com equipe inativa da 422" 422 "$(req PUT "/atendimentos/$AT" "{\"idOcorrencia\":$OC,\"idEquipe\":2,\"dataAgendada\":\"$AMANHA\"}")"
checa "equipe inativa ainda pode concluir" 200 "$(req PUT "/atendimentos/$AT" "{\"idOcorrencia\":$OC,\"idEquipe\":2,\"dataAgendada\":\"$HOJE\",\"status\":\"CONCLUIDO\"}")"
OC=$(nova_oc 6)
req PUT /equipes/2 "$(echo "$EQ" | jq -c '.ativa=true')" >/dev/null
req POST /atendimentos "$(agendar_json "$OC" 2 "$HOJE")" >/dev/null
AT=$(corpo | jq -r .idAtendimento)
req PUT /equipes/2 "$(echo "$EQ" | jq -c '.ativa=false')" >/dev/null
checa "equipe inativa ainda pode cancelar" 200 "$(req PUT "/atendimentos/$AT" "{\"idOcorrencia\":$OC,\"idEquipe\":2,\"dataAgendada\":\"$HOJE\",\"status\":\"CANCELADO\"}")"
checa "cancelar a unica visita volta a ABERTA" ABERTA "$(status_oc "$OC")"
req PUT /equipes/2 "$(echo "$EQ" | jq -c '.ativa=true')" >/dev/null

echo "== Recalculo em lote (mudar peso de categoria)"
CAT=$(curl -s "$API/categorias/1")
checa "mudar peso da categoria recalcula sem erro" 200 "$(req PUT /categorias/1 "$(echo "$CAT" | jq -c '.pesoGravidade=5')")"
checa "voltar o peso" 200 "$(req PUT /categorias/1 "$CAT")"

echo "== Concorrencia: agendar x cancelar ocorrencia (10 rodadas)"
quebradas=0
for i in $(seq 1 10); do
  OC=$(nova_oc $((10+i)))
  OCJ=$(curl -s "$API/ocorrencias/$OC" | jq -c '.status="CANCELADA"')
  curl -s -o /dev/null -X POST -H 'Content-Type: application/json' -d "$(agendar_json "$OC" 1 "$HOJE")" "$API/atendimentos" &
  curl -s -o /dev/null -X PUT -H 'Content-Type: application/json' -d "$OCJ" "$API/ocorrencias/$OC" &
  wait
  st=$(status_oc "$OC"); ag=$(agendados "$OC")
  if { [ "$st" = CANCELADA ] && [ "$ag" = 0 ]; } || { [ "$st" = EM_ANDAMENTO ] && [ "$ag" -ge 1 ]; }; then :; else quebradas=$((quebradas+1)); echo "        rodada $i: $st com $ag agendada(s)"; fi
done
checa "estado coerente em todas as rodadas" 0 "$quebradas"

echo "== Concorrencia: duas conclusoes ao mesmo tempo (10 rodadas)"
quebradas=0
for i in $(seq 1 10); do
  OC=$(nova_oc $((30+i)))
  req POST /atendimentos "$(agendar_json "$OC" 1 "$HOJE")" >/dev/null; A1=$(corpo | jq -r .idAtendimento)
  req POST /atendimentos "$(agendar_json "$OC" 2 "$HOJE")" >/dev/null; A2=$(corpo | jq -r .idAtendimento)
  for a in "$A1:1" "$A2:2"; do
    curl -s -o /dev/null -X PUT -H 'Content-Type: application/json' \
      -d "{\"idOcorrencia\":$OC,\"idEquipe\":${a#*:},\"dataAgendada\":\"$HOJE\",\"status\":\"CONCLUIDO\"}" "$API/atendimentos/${a%%:*}" &
  done
  wait
  concl=$(curl -s "$API/ocorrencias/$OC/atendimentos" | jq '[.[] | select(.status=="CONCLUIDO")] | length')
  st=$(status_oc "$OC")
  if [ "$concl" = 1 ] && [ "$st" = RESOLVIDA ]; then :; else quebradas=$((quebradas+1)); echo "        rodada $i: $concl concluido(s), ocorrencia $st"; fi
done
checa "exatamente uma conclusao por ocorrencia" 0 "$quebradas"

echo
echo "Resultado: $ok ok, $falhas falha(s)"
rm -rf "$TMP"
[ "$falhas" = 0 ]
