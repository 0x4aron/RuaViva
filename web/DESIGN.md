# RuaViva — componentes do site

Usamos a placa de rua para destacar o endereço de cada ocorrência. As cores e as medidas estão em [css/estilo.css](css/estilo.css).

## Mapa, formulários e fila

- **Mapa do bairro:** os tiles do OpenStreetMap ficam em tons de cinza com contraste e brilho reduzidos. A atribuição continua legível e os pinos mantêm a cor do status. Na impressão, o filtro é desligado.
- **Lista e mapa conectados:** passar o mouse ou focar uma ocorrência destaca seu pino numerado; passar o mouse ou focar um pino destaca a linha correspondente. O pino ativo cresce, recebe um anel azul de placa e fica acima dos demais. Clicar abre um popup com categoria, endereço e o link "Ver registro".
- **Ação no celular:** em telas menores que 640 px, Voltar, Continuar e Enviar registro ficam numa barra sticky no rodapé, com fundo papel, borda superior, área segura do aparelho e espaço depois do formulário.
- **Carregamento:** bairro, Meus registros e fila do gestor mostram três linhas-esqueleto com blocos nas dimensões do conteúdo. A pulsação é desligada com `prefers-reduced-motion`; o leitor de tela ouve "Carregando registros".
- **Composição da fila:** acima da lista de motivos em "Por que N pontos?", uma barra empilhada representa a parcela de cada motivo. O azul de placa, azul escuro, azul claro contornado e faixa amarela diferenciam os segmentos; a lista de motivos e pontos continua sendo o conteúdo principal.
- **Entrada:** o caminho do morador recebe o destaque visual com borda de placa. A entrada do gestor aparece numa linha secundária abaixo, sem painel.

## Cores e público

| Cor | Uso |
|---|---|
| Azul placa `#1A4D8F` | Endereço e navegação |
| Amarelo faixa `#F2C200` | Ação principal |
| Vermelho `#C8102E` | Erro, atraso ou prioridade alta |
| Verde `#176B43` | Serviço resolvido ou confirmação |
| Âmbar `#7A5C00` sobre `#FFF6CC` | Em andamento ou prioridade média |

Na entrada, um poste com placas identifica o RuaViva. No celular, o morador vê a lista antes do mapa e usa controles de pelo menos 48 px de altura. No gestor, adotamos 44 px como referência de toque. A tabela permite comparar os casos e abrir o formulário na linha escolhida.

## Variáveis do site

### Variáveis de cor no CSS
```
--placa: #1A4D8F        --placa-escura: #123A6D   --placa-clara: #E8EFF8
--asfalto: #1F2A30      --asfalto-suave: #4A5961  --linha: #D3DAD7
--faixa: #F2C200        --faixa-escura: #D9AD00
--lanterna: #C8102E     --lanterna-clara: #FCEBEE
--andamento: #7A5C00    --andamento-fundo: #FFF6CC
--resolvido: #176B43    --resolvido-clara: #E6F3EC
--fundo: #F4F6F5        --papel: #FFFFFF
```
Usamos `--asfalto-suave` no texto secundário. O contraste sobre branco é de 7,3:1. Sobre o azul das placas, usamos texto branco.

### Tipografia
- **Barlow Semi Condensed 600/700**: títulos, placas, números (prioridade, contagens). Números com `font-variant-numeric: tabular-nums`.
- **Atkinson Hyperlegible 400/700**: todo o resto. Corpo 18 px (1rem com `html{font-size:112.5%}`), com textos auxiliares menores (0,8 rem na linha do atendimento).

| Estilo | CSS | Uso |
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
- Bordas de 1 px `--linha`.

## Componentes

**Placa de rua.** Duas versões, com proporção de placa esmaltada, cantos de 4 px e filete branco interno:
- *Grande* (entrada e detalhe): fundo `--placa`, nome da rua em Barlow 700 e número numa caixa `--placa-escura` à direita.
- *Compacta* (listas e fila): uma linha, 0.95rem e número numa caixa `--placa-escura`. Mostra a rua sem a palavra "Rua", que se repete em tudo. A marca no cabeçalho usa o mesmo filete em escala menor.

**Selo de status.** Retângulo de raio 4 px (como placa, não pílula), texto 0.85rem 700, fundo claro da cor + texto escuro da cor: Aberto (lanterna-clara/lanterna), Em andamento (andamento-fundo/andamento), Resolvido (resolvido-clara/resolvido), Cancelado (fundo/asfalto-suave). Sempre na mesma posição: canto superior direito da linha.

**Número do registro.** `Registro nº 0003` usa algarismos tabulares em azul de placa, com contorno fino e sem imitar protocolo oficial. É o ID local da API, visível na confirmação, no detalhe e em Meus registros; não substitui um protocolo SP156.

**Pictogramas de categoria.** Os símbolos de categoria mantêm os ids de `img/icones.svg`, com traço de 2,25 px, branco sobre quadrado `--placa` com raio de 4 px. Tamanhos: 48 px na escolha da categoria, 40 px nas listas e 32 px no detalhe. Ícones de interface (alerta, informação, relógio, apoios e controles do mapa) usam o mesmo traço.

**Linha de ocorrência** (morador). As linhas ficam dentro de um painel branco, separadas por linhas de 1 px. Estrutura: [pictograma da categoria 40 px, com o número do mapa no canto na cor do status] [categoria em Corpo forte + selo à direita] / [placa compacta] / [descrição em até duas linhas, truncada] / [meta: "há 88 dias · 3 apoios"]. A linha inteira é um link (alvo grande), com foco visível. Em Meus registros, uma versão mini mostra os quatro pontos da linha e o nome da estação atual.

**Linha do atendimento.** Um `<ol>` com as estações Registrado, Na fila, Visita agendada e Resolvido. A estação atual recebe `aria-current="step"`, nome em negrito e círculo maior com anel. Estações já alcançadas são círculos cheios com contorno branco; as futuras são vazadas. O trecho percorrido tem 6 px em `--placa`, o futuro é tracejado em `--linha`, e o último trecho de um registro resolvido e sua estação final usam `--resolvido`. A linha aparece no bloco Situação do registro, na confirmação após registrar (Na fila atual) e em Meus registros, onde fica reduzida aos pontos e ao nome da estação atual.

Na abertura, a linha avança em uma animação de até 600 ms, ease-out, com os trechos percorridos crescendo em sequência. Em celular estreito ela fica vertical; em desktop fica horizontal. Para uma ocorrência cancelada, a linha termina depois de Na fila em um terminal cinza com o nome Cancelado. Cancelar uma visita deixa a linha em Na fila quando a API devolve a ocorrência para ABERTA; o cancelamento da visita continua no histórico. EM_ANDAMENTO sem visita AGENDADA mostra Em atendimento, sem data. Uma visita AGENDADA mostra Visita agendada, data e equipe.

**Linha da fila** (gestor). Grade: Prioridade (número grande + nível) | Problema (categoria + descrição) | Endereço (placa compacta) | Apoios | Aberto há / prazo (vermelho só quando passou do prazo) | botão secundário "Agendar". A linha tem hover discreto. Ao clicar em Agendar, a linha se expande (sem modal) mostrando: "Por que 71 pontos?" (composição vinda da API), barra empilhada acima dos motivos, equipe (só equipes ativas da mesma subprefeitura, começa em "Escolha a equipe"), data (mínimo hoje) e o botão principal "Agendar visita". A lista acessível de motivos e pontos continua como informação principal. Só uma linha aberta por vez.

**Prioridade.** Número em Título/Número + nível (Alta ≥ 60 vermelho, Média ≥ 40 âmbar, Baixa cinza) + botão de texto "Por que?" que abre a composição:
`Gravidade da categoria (peso 4) ... 40` / `3 apoios de vizinhos ... 6` / `Escola Estadual Barão (fictícia) a 40 m ... 15` / `Registrado por pessoa idosa ou com deficiência ... 10` / total de 71 pontos.

**Botões.** Principal: fundo `--faixa`, texto `--asfalto`, borda 2 px `--asfalto`, altura mínima 52 px. Secundário: branco com borda `--asfalto`. Perigo: branco, borda e texto `--lanterna`. De texto: sublinhado com `text-underline-offset: .2em`. Estados: hover (principal escurece para `--faixa-escura`), foco (anel `--faixa` 3 px e contorno `--asfalto` 1 px), pressionado (desce 1 px), desabilitado (opacidade .55), carregando (texto troca para "Enviando…" e o botão fica desabilitado). Transições de cor e sombra duram 150 ms e são desligadas com `prefers-reduced-motion`.

**Campo.** Rótulo em Corpo forte acima; dica em Pequeno ligada por `aria-describedby`; erro abaixo do campo, em `--lanterna`, com ícone, também ligado por `aria-describedby` e `aria-invalid="true"`.

**Aviso.** Painel com borda de 1 px e fundo claro da cor (sucesso: resolvido-clara; erro: lanterna-clara; info: placa-clara), ícone SVG à esquerda, texto `--asfalto`.

**Emergência.** Na escolha da categoria, aviso em `--lanterna-clara` orienta ligar para 199 (Defesa Civil) ou 156 em caso de risco imediato. Os telefones são links `tel:`.

**Comprovante do registro.** No detalhe, ações para copiar o link, compartilhar pelo WhatsApp e imprimir. A impressão omite navegação, controles e mapa, preservando endereço, número local, situação e histórico. O detalhe compartilhado pode ser consultado sem perfil; apoiar continua exigindo um perfil de morador.

**Abas.** No celular, as 3 abas dividem a largura em partes iguais (grade), sem rolagem horizontal; a ativa tem fundo `--fundo` e texto `--placa`.

**Marcador do mapa.** Círculo de 36 px em uma área de toque de 44 × 44 px, com o número da linha da lista (1, 2, 3...), na cor do status, borda branca de 2 px e sombra suave. O número no mapa é o mesmo da lista e do selo sobre o pictograma. Os tiles ficam acromáticos para os pinos serem percebidos primeiro; a atribuição do OpenStreetMap mantém contraste. O destaque cruzado mantém lista e pino sincronizados no mouse e no teclado. O popup abre ao selecionar o pino e deixa a navegação para o link "Ver registro".

**Situação do bairro.** Na entrada, uma faixa sem cartões mostra as contagens de pendentes (ABERTA e EM_ANDAMENTO) e resolvidos (RESOLVIDA) na Liberdade. Os números e a idade do registro pendente mais antigo vêm de `GET /ocorrencias` e do distrito devolvido pela API. O texto da ocorrência mais antiga só aparece quando houver pendentes; se a API falhar, a faixa fica oculta.

**Passos do registro.** As etapas Problema, Local e Detalhes aparecem como três estações ligadas por um traço azul. A linha percorre apenas o espaço entre os pontos e os rótulos ficam abaixo dela. O passo atual usa círculo cheio.

**Prioridade na fila.** O número fica numa placa compacta com algarismos tabulares: Alta em `--lanterna`, Média em `--andamento` sobre `--andamento-fundo`, Baixa em `--asfalto-suave`. A tabela mantém a densidade e o cabeçalho permanece visível ao rolar; o formulário aberto se liga visualmente à linha de origem.

**Linha do tempo.** Um traço de 2 px liga os eventos em ordem de data. Se faltar a data de cancelamento, a tela avisa.

**Ícones.** SVG próprios em `web/img/icones.svg` (sprite com `<symbol>`), traço de 2 px, 24 px, cantos arredondados, mesmo estilo em todos: buraco, bueiro, calçada, entulho, guia, varrição, lixeira, local, alvo (centro do mapa), check, alerta, info, relógio, pessoas (apoios), seta.

**Superfícies do navegador.** `::selection` com fundo `--placa-clara`; `caret-color: var(--placa)`; foco visível em todos os controles; links com `text-underline-offset: .2em`; barra de rolagem fina na cor `--linha`; favicon SVG (mini placa "RV"). Estados vazios mantêm uma frase e uma ação já disponível, com pictograma; as listas de ocorrência usam linhas-esqueleto no carregamento e os erros preservam a ação de tentar novamente.

## Telas

### Entrada

A placa identifica o bairro. Abaixo dela, a faixa mostra quantos registros estão pendentes, quantos foram resolvidos e há quanto tempo o mais antigo espera. O morador escolhe um perfil fictício. O botão “Entrar como gestor” abre a fila.

### Mapa do bairro

Os filtros são “Pendentes”, “Resolvidos” e “Todos”. No celular, a lista aparece primeiro. No computador, ela fica à esquerda do mapa. Cada linha mostra o endereço, o status por extenso e o número do pino correspondente.

### Registrar problema

1. O morador escolhe uma categoria pelo nome, pelo pictograma e pelo exemplo. A tela apresenta o prazo de referência.
2. O morador busca a rua, usa o GPS ou marca o ponto no mapa. Pode ajustar o ponto pelo teclado e conferir o endereço em texto. Se já houver um registro pendente da mesma categoria a até 60 m, aparece a opção “Apoiar este em vez de registrar”.
3. O morador confere o resumo e pode acrescentar uma descrição. Após o envio, a confirmação mostra o endereço, o número local do registro e a etapa “Na fila”. O rascunho fica na sessão do navegador enquanto o morador consulta outro registro.

### Detalhe do problema

O endereço e a situação aparecem antes do mapa. O histórico mostra a última movimentação e a data disponível. Quando o prazo da categoria vence, a tela informa o caminho da Ouvidoria no SP156. Junto ao botão “Isso também me afeta”, o morador vê quantas pessoas já apoiaram o registro. O link compartilhado abre o detalhe para leitura.

### Meus registros

O morador busca pelo número local ou consulta duas listas: os problemas que registrou e os que apoiou. Cada linha mostra a etapa atual do atendimento.

### Fila do gestor

À esquerda, o gestor compara os casos que aguardam equipe e abre o agendamento na linha escolhida. À direita ficam as visitas marcadas. Ao concluir uma visita, ele pode descrever o que foi feito. Também pode cancelá-la.

### Categorias

O formulário de cadastro fica ao lado da tabela. O gestor pode consultar a régua de gravidade ao escolher o peso, de 1 a 5. A tabela mostra também o prazo em dias e as horas de serviço.

## Acessibilidade

O link “Pular para o conteúdo” leva ao conteúdo principal. Os campos têm rótulos e ligam dicas e erros por `aria-describedby`. Avisos usam `aria-live`. O foco de teclado fica visível e cada selo traz o status por escrito.

## Movimento
A linha do atendimento avança até a etapa atual em até 600 ms. As linhas de carregamento pulsam enquanto a lista carrega. Ambas respeitam `prefers-reduced-motion`.
