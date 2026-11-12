# Documentos das entregas

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
