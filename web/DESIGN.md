# RuaViva — sistema de design (v2)

Fonte única para o site (`web/`) e para o Figma ("GS 2026 - Telas do site"). Os nomes dos tokens são os mesmos nos dois lugares: a variável `--placa` no CSS é a variável `placa` da coleção "Cores" no Figma.

## Ponto de vista

**A interface fala a língua da sinalização de rua de São Paulo.** O endereço é a informação mais importante do produto, então ele ganha a forma da placa azul de rua. As cores têm significado fixo, como no trânsito:

| Cor | Significa | Nunca usar para |
|---|---|---|
| Azul placa `#1A4D8F` | endereço, marca, navegação | alerta |
| Amarelo faixa `#F2C200` | a ação principal da tela (uma por tela) | texto, status |
| Vermelho lanterna `#C8102E` | urgência: atrasado, prioridade alta, erro | decoração |
| Verde resolvido `#1E7D4F` | resolvido, sucesso | ação |
| Âmbar andamento `#7A5C00` sobre `#FFF6CC` | em andamento, prioridade média | |

O bairro aparece por nome e por mapa ("Liberdade · Sé · São Paulo"), não por enfeite. A única ilustração do site é o poste da entrada, com as placas cruzadas e uma lanterna da Liberdade: é o elemento-assinatura e não se repete em outras telas. Fora dele, nada de lanternas desenhadas, gradientes, vidro, sombras coloridas, emoji ou ícones de texto.

Duas experiências, dois ritmos:
- **Morador (celular, uma mão, pode ter baixa visão):** uma coisa por vez, texto grande, alvos de toque de 48 px no mínimo, lista antes do mapa.
- **Gestor (desktop):** comparar muitos casos rápido. Linhas densas e escaneáveis; o formulário só abre no caso escolhido.

## Tokens

### Cores (CSS = Figma)
```
--placa: #1A4D8F        --placa-escura: #123A6D   --placa-clara: #E8EFF8
--asfalto: #1F2A30      --asfalto-suave: #4A5961  --linha: #D3DAD7
--faixa: #F2C200        --faixa-escura: #D9AD00
--lanterna: #C8102E     --lanterna-clara: #FCEBEE
--andamento: #7A5C00    --andamento-fundo: #FFF6CC
--resolvido: #1E7D4F    --resolvido-clara: #E6F3EC
--fundo: #F4F6F5        --papel: #FFFFFF
```
Texto secundário sempre `--asfalto-suave` (contraste 6,9:1 no branco). Sobre azul, texto branco ou `#D6E2F2`, nunca cinza.

### Tipografia
- **Barlow Semi Condensed 600/700**: títulos, placas, números (prioridade, contagens). Números com `font-variant-numeric: tabular-nums`.
- **Atkinson Hyperlegible 400/700**: todo o resto. Corpo 18 px (1rem com `html{font-size:112.5%}`), mínimo 16 px.

| Estilo (Figma) | CSS | Uso |
|---|---|---|
| Título/Display | 2.5rem/1.05 Barlow 700 | só na entrada |
| Título/H1 | 2rem/1.1 Barlow 700 | título da página |
| Título/H2 | 1.4rem/1.15 Barlow 700 | seções |
| Título/Número | 2rem/1 Barlow 700 tabular | prioridade |
| Texto/Corpo | 1rem/1.5 Atkinson 400 | |
| Texto/Corpo forte | 1rem/1.5 Atkinson 700 | categoria, rótulos |
| Texto/Pequeno | 0.9rem/1.45 Atkinson 400 | meta |

Mais espaço acima de um título do que abaixo. Linhas de texto com no máximo ~68ch.

### Espaço, raio, sombra
- Escala de espaço (múltiplos de 4 px): `--e1 .25rem, --e2 .5rem, --e3 .75rem, --e4 1rem, --e5 1.5rem, --e6 2rem, --e7 3rem`.
- Raios: `--raio-placa 4px` (placas e selos retos), `--raio 8px` (campos, botões), `--raio-painel 12px` (painéis).
- Uma sombra só, para o que flutua (painel aberto, mapa fixo): `0 1px 2px rgb(31 42 48 / .08), 0 6px 16px rgb(31 42 48 / .08)`.
- Bordas de 1 px `--linha`. **Nenhuma borda lateral colorida** em cartões, avisos ou itens de lista.

## Componentes

**Placa de rua.** Duas versões:
- *Grande* (entrada, cabeçalho do detalhe): fundo `--placa`, filete branco de 2 px por dentro, nome da rua em Barlow 700, número numa caixa `--placa-escura` à direita.
- *Compacta* (listas, fila): uma linha, 0.95rem, sem filete externo, raio 4 px, altura 28 px. Mostra "Barão de Iguape · 288" (sem a palavra "Rua", que se repete em tudo).

**Selo de status.** Retângulo de raio 4 px (como placa, não pílula), texto 0.85rem 700, fundo claro da cor + texto escuro da cor: Aberto (lanterna-clara/lanterna), Em andamento (andamento-fundo/andamento), Resolvido (resolvido-clara/resolvido), Cancelado (fundo/asfalto-suave). Sempre na mesma posição: canto superior direito da linha.

**Número do registro.** `Registro nº 0003` usa algarismos tabulares em azul de placa, com contorno fino e sem imitar protocolo oficial. É o ID local da API, visível na confirmação, no detalhe e em Meus registros; não substitui um protocolo SP156.

**Linha de ocorrência** (morador). Não é cartão solto: as linhas ficam dentro de um painel branco, separadas por linhas de 1 px. Estrutura: [ícone da categoria 28 px num quadrado `--placa-clara`, com o número do mapa no canto, na cor do status] [categoria em Corpo forte + selo à direita] / [placa compacta] / [descrição em uma linha, truncada] / [meta: "há 88 dias · 3 apoios"]. A linha inteira é um link (alvo grande), com foco visível.

**Linha da fila** (gestor). Grade: Prioridade (número grande + nível) | Problema (categoria + descrição) | Endereço (placa compacta) | Apoios | Aberto há / prazo (vermelho só quando passou do prazo) | botão secundário "Agendar". Ao clicar em Agendar, a linha se expande (sem modal) mostrando: "Por que 71 pontos?" (composição vinda da API), equipe (só equipes ativas da mesma subprefeitura, começa em "Escolha a equipe"), data (mínimo hoje) e o botão principal "Agendar visita". Só uma linha aberta por vez.

**Prioridade.** Número em Título/Número + nível (Alta ≥ 60 vermelho, Média ≥ 40 âmbar, Baixa cinza) + botão de texto "Por que?" que abre a composição:
`Gravidade da categoria (peso 4) ... 40` / `3 apoios de vizinhos ... 6` / `A 120 m de Escola ... 15` / `Registrado por pessoa idosa ou com deficiência ... 10` / total.

**Botões.** Principal: fundo `--faixa`, texto `--asfalto`, borda 2 px `--asfalto`, altura mínima 52 px. Secundário: branco com borda `--asfalto`. Perigo: branco, borda e texto `--lanterna`. De texto: sublinhado com `text-underline-offset: .2em`. Estados: hover (principal escurece para `--faixa-escura`), foco (anel `--faixa` 3 px + contorno `--asfalto`), desabilitado (opacidade .55), carregando (texto troca para "Enviando…" e o botão fica desabilitado).

**Campo.** Rótulo em Corpo forte acima; dica em Pequeno ligada por `aria-describedby`; erro abaixo do campo, em `--lanterna`, com ícone, também ligado por `aria-describedby` e `aria-invalid="true"`.

**Aviso.** Painel com borda de 1 px e fundo claro da cor (sucesso: resolvido-clara; erro: lanterna-clara; info: placa-clara), ícone SVG à esquerda, texto `--asfalto`. Sem borda lateral grossa.

**Emergência.** Na escolha da categoria, aviso em `--lanterna-clara` orienta ligar para 199 (Defesa Civil) ou 156 em caso de risco imediato. Os telefones são links `tel:`.

**Comprovante do registro.** No detalhe, ações para copiar o link, compartilhar pelo WhatsApp e imprimir. A impressão omite navegação, controles e mapa, preservando endereço, número local, situação e histórico. O detalhe compartilhado pode ser consultado sem perfil; apoiar continua exigindo um perfil de morador.

**Abas.** No celular, as 3 abas dividem a largura em partes iguais (grade), sem rolagem horizontal; a ativa tem fundo `--fundo` e texto `--placa`.

**Marcador do mapa.** Alfinete de 36 px com o número da linha da lista (1, 2, 3...), na cor do status, borda branca de 2 px. O número no mapa é o mesmo da lista.

**Linha do tempo.** Lista vertical com pontos; a linha de ligação de 2 px é o desenho da linha do tempo (permitido). Cada evento: o que aconteceu + data.

**Ícones.** SVG próprios em `web/img/icones.svg` (sprite com `<symbol>`), traço de 2 px, 24 px, cantos arredondados, mesmo estilo em todos: buraco, bueiro, calçada, entulho, guia, varrição, lixeira, local, alvo (centro do mapa), check, alerta, info, relógio, pessoas (apoios), seta.

**Superfícies do navegador.** `::selection` com fundo `--placa-clara`; `caret-color: var(--placa)`; barra de rolagem fina na cor `--linha`; favicon SVG (mini placa "RV").

## Telas

### 1. Entrada
`h1` = placa grande "RuaViva". Linha "Liberdade · Sé · São Paulo". Frase do que o app faz. Dois caminhos claros, um abaixo do outro no celular e lado a lado no desktop: "Sou morador" (escolher morador da demonstração + botão principal) e "Sou da subprefeitura" (botão secundário). Uma nota discreta: "Versão de demonstração: os moradores e atendimentos são simulados."

### 2. Mapa do bairro (morador)
Título "Problemas no bairro" + resumo vivo: "5 problemas não resolvidos na Liberdade". Filtro em 3 botões segmentados: Pendentes / Resolvidos / Todos. No celular, alternância "Lista | Mapa" (lista primeiro). No desktop: lista à esquerda (40%) e mapa fixo à direita, cada um em painel. O número da lista aparece sobre o ícone da categoria e corresponde ao marcador do mapa. Legenda das cores com texto.

### 3. Registrar problema (3 passos numa página)
1. **O que é?** Grade de categorias: ícone + nome + um exemplo curto ("Tapa-buraco — buraco no asfalto da rua"). Escolha única, alvos grandes. Ao selecionar, mostrar prazo de referência e Subprefeitura Sé. Aviso de emergência fica visível nesta etapa.
2. **Onde fica?** Campo "Rua e número" + botão "Buscar endereço" (OpenStreetMap Nominatim, restrito à região) → resultados como opções de rádio em texto. Ou "Usar minha localização". O mapa mostra o ponto e permite ajustar (toque, arrastar, ou setas + "Marcar o centro do mapa" com a mira). Confirmação sempre em texto: "Local escolhido: Rua Barão de Iguape, 288 — Liberdade" (geocodificação reversa; se falhar, "ponto marcado no mapa, perto de -23,5584, -46,6341").
3. **Detalhes.** Descrição (opcional, com contador) + resumo do que vai ser enviado. Botão principal "Enviar registro".
Aviso de possível repetição aparece no passo 2 quando há registro da mesma categoria a até 60 m: mostra a linha da ocorrência e o botão "Apoiar este em vez de registrar". O rascunho fica salvo (sessionStorage) se a pessoa sair para ver o outro registro.
Depois de enviar: tela de confirmação com a placa do endereço, número local `Registro nº 0003` e "O que acontece agora": entra na fila da subprefeitura; você acompanha em Meus registros. Meus registros também permite buscar pelo número local.

### 4. Detalhe do problema
Ordem: placa grande do endereço → número local do registro → categoria + selo → copiar link, compartilhar e imprimir → **bloco de situação** (frase grande: "Aguardando equipe" / "Visita agendada para 12/11" / "Resolvido em 05/11"; abaixo: última movimentação e próxima etapa, só com fatos do sistema; prazo de referência da categoria e se passou dele) → orientação para a Ouvidoria Geral do Município no SP156 se o prazo venceu → linha do tempo → apoio ("Isso também me afeta": explica que apoios entram no cálculo de prioridade, sem prometer rapidez; mostra quantos vizinhos apoiaram) → mapa pequeno no fim. O detalhe abre em modo somente leitura sem perfil, para que um link compartilhado possa ser consultado.

### 5. Meus registros
Duas seções: "Problemas que eu registrei" e "Problemas que eu apoiei", com a Linha de ocorrência. Estados vazios que convidam a agir ("Você ainda não registrou nenhum problema. Registrar agora").

### 6. Fila de trabalho (gestor, desktop)
Linha de resumo em texto, sem cartões de métrica: "5 aguardando equipe · 3 passaram do prazo · 1 visita agendada". Duas áreas: Fila (2/3 da largura, tabela de Linhas da fila, ordenada por prioridade) e Visitas agendadas (1/3, lista com "Marcar como resolvido", que abre confirmação na própria linha com campo "O que foi feito", e "Cancelar visita").

### 7. Categorias (gestor)
Formulário à esquerda com a régua de peso como sugestão (opcional); tabela à direita com espaçamento confortável (padding 12/16), números tabulares, peso também como texto.

## Textos que mudam
- "a equipe está a caminho" → "Visita agendada para {data} com {equipe}."
- "Peça para os vizinhos apoiarem" → "Vizinhos podem apoiar este registro: cada apoio entra no cálculo da prioridade."
- "quanto mais apoios, mais rápido ele sobe na fila" → "Apoios ajudam a subprefeitura a ver quantas pessoas são afetadas."
- Nomes com acento correto em todos os dados (Barão, Remoção, Calçada, Varrição, Lixeira pública).
- Idade do registro: "hoje", "há 1 dia", "há 2 dias". Não mostrar "0 dias".

## Acessibilidade (obrigatório)
Link "Pular para o conteúdo"; um `h1` por página; ordem de títulos sem saltos; todos os campos com rótulo; dicas e erros com `aria-describedby`; mudanças de estado anunciadas (`aria-live="polite"`); foco vai para o aviso de erro; alvos ≥ 48 px; nada depende só de cor (selos têm texto); `prefers-reduced-motion` desliga animações; sem rolagem horizontal em 320 px; zoom de 200% sem quebrar.

## Movimento
Um momento só: na confirmação de envio, a placa do endereço entra com um leve deslize de baixo (200 ms, ease-out). O resto da interface não anima.
