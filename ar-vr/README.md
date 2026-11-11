# RuaViva — cena 3D de zeladoria urbana

Filme de **48 segundos**, em **1920 × 1080**, sobre a CitizenTech RuaViva na Rua Barão de Iguape, Liberdade, São Paulo. A maquete low-poly mostra prédios baixos, lanternas suzuranto, faixa de pedestre amarela, escola, creche e a base da equipe. É uma representação ilustrativa do bairro, não um levantamento arquitetônico. Os três registros, suas pontuações e seus apoios vêm de `database/02_dml.sql`; a localização na maquete, a rota e os reparos são ilustrativos. O terceiro registro pertence à Rua Doutor Siqueira Campos, 23, representada nesta maquete junto à creche, sem pretensão geográfica.

A identidade segue o README da raiz e `web/DESIGN.md`: azul placa `#1A4D8F`, amarelo faixa `#F2C200`, vermelho `#C8102E`, verde resolvido `#1E7D4F`, fundo `#F4F6F5`, Barlow Semi Condensed e Atkinson Hyperlegible. Fim de tarde com céu em degradê, névoa rosada, luz lateral quente, sombras PCFSoft de 2048 px, ACES/sRGB e exposição 0,94. Lanternas emissivas com halos e somente seis PointLights sem sombras. Geometrias estáticas são agrupadas por material para reduzir draw calls. Placas têm frente e verso independentes; etiquetas HTML projetadas usam fontes de 28–36 px em Full HD.

| Tempo | Cena |
| --- | --- |
| 0–5 s | Câmera desce sobre o bairro; placa RuaViva e localização. |
| 5–13 s | 1: bueiro entupido junto à escola; 2: sarjeta afundada; 3: buraco perto da creche. |
| 13–21 s | Luzes de moradores convergem para os registros; contadores de apoio sobem. |
| 21–29 s | Fila flutuante com 71, 59 e 57 pontos, barras proporcionais e contornos na escola e creche. |
| 29–38 s | Van inicia a rota amarela e chega ao bueiro; as próximas paradas acompanham os reparos. |
| 38–44 s | Bueiro limpo (38–39,25 s), sarjeta nivelada (40–41 s), asfalto novo (42–43,2 s); van parada, câmera próxima e checks verdes. |
| 44–48 s | Vista alta, mensagem final e créditos da equipe. |

## Registros representados

| Alfinete | ID no DML | Ocorrência | Endereço real | Prioridade | Apoios |
| --- | --- | --- | --- | --- | --- |
| 1 | 3 | Bueiro entupido | Rua Barão de Iguape, 288 | 71 | 3 |
| 2 | 8 | Sarjeta afundada (guias e sarjetas) | Rua Barão de Iguape, 319 | 59 | 2 |
| 3 | 10 | Buraco perto da creche (tapa-buraco) | Rua Doutor Siqueira Campos, 23 | 57 | 1 |

## Abrir a prévia

Na raiz do repositório:

```bash
python3 -m http.server 8000
```

Abra **http://localhost:8000/ar-vr/cena/?preview=1** em um navegador com WebGL e acesso à internet. A prévia repete os 48 segundos. O enquadramento é fixo em 1920 × 1080: para vê-lo inteiro em uma tela menor, reduza o zoom do navegador; para capturar, mantenha zoom de 100% e viewport de 1920 × 1080.

Não há build. Three.js está fixado em `0.160.0` via import map do jsDelivr; as fontes vêm do Google Fonts. A primeira abertura precisa de internet. Não há imagens, modelos 3D externos nem dados pessoais.

## Contrato de captura

Abra **http://localhost:8000/ar-vr/cena/**, **sem `preview=1`**. Espere `window.cenaPronta === true` (que só ocorre depois de `document.fonts.ready`, criação das texturas e primeiro render). Então:

```javascript
window.renderizar(24); // posiciona e desenha exatamente o instante de 24 segundos
```

`renderizar(segundos)` aceita números finitos, limita-os a 0–48 e recalcula câmera, objetos, cores, partículas, reparos, contadores e overlays. É possível saltar para qualquer instante, inclusive voltar no tempo. O gerador de detalhes usa semente fixa `20261111`. Não há animações CSS nem relógio de timeline fora da prévia; `requestAnimationFrame` só roda com `?preview=1`. `window.cenaInfo` informa resolução, duração, FPS sugerido e ordem de atendimento.

Capture a região **`#filme`**, que inclui canvas e overlays HTML. Capturar apenas `canvas.toDataURL()` omite as legendas e os créditos. O renderer usa `preserveDrawingBuffer: true`, antialias e pixel ratio 1. A reprodutibilidade é esperada no mesmo navegador/GPU/fontes; rasterização pode variar entre plataformas.

A rota demonstrativa compara as seis permutações possíveis entre três paradas, minimizando a distância desde a base, sem retorno obrigatório. É ótima nesse modelo simples de uma rua; não representa um cálculo sobre a malha viária real. A van desacelera, para e muda de direção antes de cada novo trecho.

## Gerar os quadros e o vídeo

Em um ambiente com internet, instale Playwright e seu Chromium (uma vez):

```bash
python3 -m venv ar-vr/.venv
ar-vr/.venv/bin/pip install playwright
ar-vr/.venv/bin/python -m playwright install chromium
```

Com o servidor HTTP ativo em outro terminal, execute da raiz:

```bash
ar-vr/.venv/bin/python ar-vr/capturar.py
```

O script abre uma viewport 1920 × 1080, aguarda a cena e as fontes, verifica se o quadro de 24 s é idêntico após saltos para outros instantes e salva **1.440 PNGs** em `ar-vr/quadros/`. Cada quadro `i` chama `window.renderizar(i / 30)` antes da captura. A velocidade de captura não altera o tempo do filme. `--fps 60` permite gerar 2.880 quadros; nesse caso, use `-framerate 60`, `-r 60` e também `-frames:v 2880` no FFmpeg para preservar os 48 segundos.

Com FFmpeg instalado:

```bash
ffmpeg -framerate 30 -start_number 0 -i ar-vr/quadros/%05d.png -frames:v 1440 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 -movflags +faststart ar-vr/ruaviva.mp4
```

Resultado: vídeo MP4 de 48 segundos, Full HD, sem áudio. O último quadro corresponde a 47,9667 s; a cartela final permanece visível. Para conferir o arquivo:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration,nb_frames -of default=noprint_wrappers=1 ar-vr/ruaviva.mp4
```

Se o Chromium não iniciar no Linux, instale as dependências de sistema indicadas pelo Playwright. Erros ao carregar o CDN ou as fontes devem ser resolvidos antes da captura. O script interrompe se detectar falha na cena ou no teste de repetição.

## Validar alterações

Com o mesmo ambiente Playwright e servidor da captura:

```bash
ar-vr/.venv/bin/python ar-vr/validar.py
```

O teste grava quadros em `ar-vr/quadros/validacao/`, compara pixels após saltos no tempo, confere dados/etiquetas/legendas e mede os 1.441 instantes de 0 a 48 s a 30 fps em 1920 × 1080. O JSON registra tempos de CPU e de GPU sincronizada (incluindo `gl.finish`), navegador e renderizador. O limite padrão de 120 ms aplica-se a cada chamada medida de `renderizar`; a sincronização da GPU é reportada separadamente. O aquecimento de shaders é separado da medição. A meta depende da GPU e precisa ser confirmada no ambiente de captura.

## Publicação

**YouTube:** [inserir link do vídeo publicado]

Equipe RuaViva — Anthony Gonçalves Sforzin · Cesar Aaron Herrera  
FIAP · Global Solution 2026
