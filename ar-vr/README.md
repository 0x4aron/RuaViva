# RuaViva — cena 3D de zeladoria urbana

Vídeo no YouTube: https://youtu.be/p-pLWZHkRQU

Na maquete de 48 segundos (1920 × 1080), acompanhamos três reparos na Liberdade. Usamos os endereços, as pontuações e os apoios de `database/02_dml.sql`. Reunimos na mesma maquete a Rua Barão de Iguape e o trecho da Rua Doutor Siqueira Campos onde fica o buraco perto da creche. A posição dos prédios e o trajeto da van são ilustrativos.

No site, o status resolvido usa `#176B43`. Na maquete, as placas azuis identificam os endereços. A rota aparece em amarelo e os marcadores ficam verdes ao fim de cada reparo. Usamos Barlow Semi Condensed nos títulos e Atkinson Hyperlegible nas legendas. Agrupamos as geometrias estáticas por material para reduzir as chamadas de desenho.

| Tempo | Cena |
| --- | --- |
| 0–5 s | Câmera desce sobre o bairro; placa RuaViva e localização. |
| 5–13 s | 1: bueiro entupido junto à escola; 2: sarjeta afundada; 3: buraco perto da creche. |
| 13–21 s | Luzes de moradores convergem para os registros; contadores de apoio sobem. |
| 21–29 s | Fila flutuante com 71, 59 e 57 pontos, barras proporcionais e contornos na escola e creche. |
| 29–38 s | Van inicia a rota amarela e chega ao bueiro; as próximas paradas acompanham os reparos. |
| 38–44 s | A equipe termina de limpar o bueiro aos 38,5 s, nivela a sarjeta aos 40 s e termina de tapar o buraco aos 41,5 s. |
| 44–48 s | Vista alta, mensagem final e créditos da equipe. |

## Registros representados

| Alfinete | ID no DML | Ocorrência | Endereço real | Prioridade | Apoios |
| --- | --- | --- | --- | --- | --- |
| 1 | 3 | Bueiro entupido (escola fictícia a 40 m no cadastro) | Rua Barão de Iguape, 288 | 71 | 3 |
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

A cena compara seis ordens possíveis para os três reparos. A van sai da base e segue a sequência de menor distância na maquete. A distância termina na terceira parada.

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

Equipe RuaViva — Anthony Gonçalves Sforzin · Cesar Aaron Herrera  
FIAP · Global Solution 2026
