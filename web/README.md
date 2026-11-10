# Site (MVP web)

Site responsivo em **HTML, CSS e JavaScript puro** que usa a API Java (`java-api/`). Funciona no celular e no computador.

## Telas

| Página | Quem usa | O que faz |
|---|---|---|
| `index.html` | Todos | Entrada: escolher "Sou morador" (um dos moradores fictícios) ou "Trabalho na subprefeitura" |
| `mapa.html` | Morador | Mapa e lista dos problemas do bairro, com cor por status |
| `registrar.html` | Morador | Registrar problema: categoria, ponto no mapa (ou GPS), endereço e descrição. **Avisa quando já existe um problema parecido a até 60 m**, para o morador apoiar em vez de repetir |
| `ocorrencia.html` | Morador e gestor | Detalhe: botão **"Isso também me afeta"**, linha do tempo e prazo |
| `minhas.html` | Morador | Problemas que registrei e que apoiei |
| `gestor.html` | Gestor | **Fila por prioridade**: agendar equipe, concluir ou cancelar visita |
| `categorias.html` | Gestor | Cadastrar categoria com a **régua de peso sugerida** (vinda de `GET /categorias/regua-peso`) |

Nesta versão não há login: o perfil escolhido na entrada fica guardado no navegador (`localStorage`).

## Identidade visual

- **Cores da rua:** azul das placas de rua de SP, asfalto, amarelo da faixa de pedestre e vermelho das lanternas da Liberdade (`css/estilo.css`).
- **Letras:** Atkinson Hyperlegible (feita para pessoas com baixa visão) e Barlow Semi Condensed (títulos, lembra sinalização viária).
- **Acessibilidade:** texto a partir de 18px, alto contraste e foco visível no teclado.
- **Elemento marcante:** o endereço de cada problema aparece como uma placa de rua.

## Como rodar

1. Suba a API (veja `java-api/README.md`).
2. Confira o endereço da API em [`js/config.js`](js/config.js) (`API_URL`).
3. Sirva a pasta `web/` com qualquer servidor estático, por exemplo:

```bash
python3 -m http.server 5500 --directory web
```

4. Abra <http://localhost:5500>.

Para publicar, a pasta `web/` pode ir para qualquer hospedagem de site estático (Render Static Site, GitHub Pages...). Antes, troque `API_URL` pelo endereço da API no Render.

## Arquivos

```
web/
├── css/estilo.css    identidade visual e componentes
├── js/config.js      nome do app, endereço da API e centro do mapa
├── js/api.js         chamadas à API (GET, POST, PUT, DELETE) e tratamento de erro
├── js/ui.js          sessão, cabeçalho, textos e avisos
├── js/mapa.js        mapa (Leaflet + OpenStreetMap)
└── *.html            uma página por tela
```
