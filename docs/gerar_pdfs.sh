#!/usr/bin/env bash
# Uso: ./docs/gerar_pdfs.sh [diretorio-de-saida]
# Sem argumento: ../entregas, relativo a docs/. Para validar só em docs/:
# ./docs/gerar_pdfs.sh "$(pwd)/docs/entregas"
set -euo pipefail
DOCS_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SAIDA="${1:-$DOCS_DIR/../entregas}"
CHROME="${CHROME_BIN:-google-chrome}"
command -v "$CHROME" >/dev/null || { echo 'Erro: google-chrome não encontrado.' >&2; exit 1; }
command -v python3 >/dev/null || { echo 'Erro: python3 não encontrado.' >&2; exit 1; }
mkdir -p -- "$SAIDA"
SAIDA="$(cd -- "$SAIDA" && pwd)"
python3 - "$DOCS_DIR" <<'PY'
from pathlib import Path
from html.parser import HTMLParser
import sys
root = Path(sys.argv[1])
class Imagens(HTMLParser):
    def __init__(self):
        super().__init__(); self.arquivos = set()
    def handle_starttag(self, tag, attrs):
        src = dict(attrs).get('src', '')
        if tag == 'img' and src.startswith('img/'):
            self.arquivos.add(src)
p = Imagens()
for f in root.glob('*.html'): p.feed(f.read_text(encoding='utf-8'))
ausentes = sorted(s for s in p.arquivos if not (root / s).is_file())
if ausentes:
    print('AVISO: imagens ausentes (a geração continuará):')
    for s in ausentes: print('  ' + s)
else: print('Todas as imagens referenciadas estão presentes.')
PY
PERFIL="$(mktemp -d "$DOCS_DIR/.chrome-pdf.XXXXXX")"
trap 'rm -rf -- "$PERFIL"' EXIT
extras=()
# Só use CHROME_NO_SANDBOX=1 em ambiente isolado que não permita o sandbox.
if [[ "${CHROME_NO_SANDBOX:-0}" == 1 ]]; then extras+=(--no-sandbox); fi
for item in 'agile:Agile' 'database:Database' 'java:Java' 'network:Network' 'arvr:ARVR'; do
  nome="${item%%:*}"
  titulo="${item##*:}"
  url="$(python3 -c 'from pathlib import Path; import sys; print(Path(sys.argv[1]).resolve().as_uri())' "$DOCS_DIR/$nome.html")"
  pdf="$SAIDA/$titulo-RuaViva.pdf"
  echo "Gerando $titulo-RuaViva.pdf…"
  "$CHROME" --headless=new --no-pdf-header-footer --virtual-time-budget=15000 \
    --disable-dev-shm-usage --no-first-run --no-default-browser-check \
    --user-data-dir="$PERFIL" "${extras[@]}" --print-to-pdf="$pdf" "$url" \
    >"$PERFIL/$nome.log" 2>&1 || { cat "$PERFIL/$nome.log" >&2; exit 1; }
  [[ -s "$pdf" ]] || { echo "Erro: PDF não gerado: $pdf" >&2; exit 1; }
  [[ "$(head -c 5 "$pdf")" == '%PDF-' ]] || { echo "Erro: arquivo inválido: $pdf" >&2; exit 1; }
  if command -v pdftotext >/dev/null; then
    pdftotext "$pdf" "$PERFIL/$nome.txt"
    if [[ "$nome" == java ]] && grep -Eq 'FALHA NA RENDERIZAÇÃO|Syntax error in text' "$PERFIL/$nome.txt"; then
      echo 'Erro: Mermaid não renderizou. Confira acesso ao jsDelivr e execute novamente.' >&2
      exit 1
    fi
  fi
  echo "OK: $pdf"
done
echo 'Concluído: 5 PDFs. Substitua os links em destaque e acrescente as imagens antes da entrega.'
