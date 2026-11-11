# Geração das entregas

Os cinco HTMLs usam `estilo.css` e podem ser abertos diretamente no Chrome.
As fontes vêm do Google Fonts. O Java carrega Mermaid 10.9.1 do jsDelivr;
a conexão com esses serviços é necessária para a renderização completa.

Na raiz do repositório:

```bash
./docs/gerar_pdfs.sh
```

Destino padrão: `entregas/`, ao lado de `docs/`. Para manter inclusive os
PDFs dentro de `docs/`:

```bash
./docs/gerar_pdfs.sh "$PWD/docs/entregas"
```

Saídas previstas: `Agile-RuaViva.pdf`, `Database-RuaViva.pdf`,
`Java-RuaViva.pdf`, `Network-RuaViva.pdf` e `ARVR-RuaViva.pdf`.
O script lista as imagens ausentes e usa áreas identificadas no lugar delas.
Acrescente as capturas reais e substitua `LINK_PITCH`, `LINK_DEPLOY` e
`LINK_VIDEO_3D` antes da entrega.

## Verificação nesta sessão

- Sintaxe Bash conferida.
- Estrutura HTML, ordem dos integrantes, seis itens e 100 pontos do Agile conferidos.
- Catálogo com 36 casos, backlog com 25 histórias e 14 Must/MVP (64 pontos).
- Java com 50 combinações método/rota extraídas dos dez controllers.
- Vistas Mermaid incluem todas as classes dos seis pacotes solicitados;
  DER contém as nove tabelas e dez FKs do DDL.
- As cinco evidências de rede permanecem identificadas como pendentes;
  os blocos IOS são referências de configuração, não capturas de execução.
- `gerar_pdfs.sh` foi executado com destino em `docs/entregas`, mas o
  Chrome foi interrompido pelo ambiente antes de gerar o primeiro PDF:
  `setsockopt: Operation not permitted` (crashpad). Uma tentativa diagnóstica
  também encontrou `shutdown: Operation not permitted`.
- O navegador alternativo estava indisponível/em uso. Portanto, **os cinco
  PDFs e a revisão visual de paginação/Mermaid ainda não foram validados**.

A imagem `img/diagrama-casos-de-uso.png` apareceu durante o trabalho e foi
preservada. As demais imagens continuam pendentes. Nenhum commit foi feito.
