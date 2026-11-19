# prompts.md: como usamos IA no RuaViva

Equipe RuaViva · Anthony Gonçalves Sforzin (RM 562096) e Cesar Aaron Herrera (RM 565398)

O enunciado permite IA "para aprender e revisar" e pede que os prompts fiquem registrados aqui. Este arquivo cobre as sessões que eu, Cesar, conduzi. Os pedidos estão copiados do jeito que escrevi, com os erros de digitação. Ficaram de fora só as confirmações curtas ("Pronto", "Sim, aplicar", "pausa tudo"), as mensagens sobre um problema do seletor de arquivos e as mensagens com dados de acesso.

## Como eu trabalhei

**Ferramentas**

| Ferramenta | Para que usei |
|---|---|
| Claude Code (app desktop) | Assistente principal. Lê o repositório, explica, escreve código e texto, roda testes e opera o navegador, o Figma e o Packet Tracer. |
| Codex CLI (OpenAI) | Segunda opinião e trabalho delegado. Eu dizia o que revisar ou corrigir. O Claude transformava isso em pedido para o Codex e conferia a resposta comigo antes de aplicar. Modelos: `gpt-6-luna`, `gpt-6-astra`, `gpt-6.1-sol`, `gpt-6.2-astra` e `gpt-6.2-sol`. |
| Playwright | Usuários simulados clicando no site, para achar erro antes do professor. |
| Figma (conector) | Telas e diagrama de casos de uso num arquivo que eu também posso editar. |
| edge-tts (Microsoft) | Voz gerada para a narração do pitch geral da GS. O pitch de Agile eu narrei com a minha voz, como o enunciado pede. |

**Regras que eu defini e mantive**

1. Nada entra neste arquivo sem eu autorizar (09/11). A versão final foi organizada a meu pedido em 18/11.
2. Peço revisão antes dos commits importantes. Nas rodadas grandes, usei modelos diferentes para um conferir o outro.
3. Sem dados pessoais reais no sistema. Os moradores da demonstração são fictícios e os dados do SP156 são públicos.
4. Senhas e logins (Oracle, Render, YouTube) eu mesmo digitei nos sites.
5. A IA não decide o que é produto. Problema, bairro, regra de prioridade, faixa de IPs e escopo do MVP foram decisões da equipe. A IA propunha e eu aceitava, corrigia ou pedia explicação.

## 1. Entender o enunciado (09/11)

> quero que analise esse slide que tem dentro da pasta, é da GS da fiap, quero fazer esse projeto, realmente funcionando, é eu e um amigo meu que estamos fazendo, o que precisar é só dizer

> onde pede ou fala algo sobre o uso de ia?

> nao quero que voce registre nada no prompts.md sem que eu deixe, depois faremos uma atualização geral do que colocamos e nao vamos colocar

> tem mais algo que eu precise saber?

**Por quê:** antes de escrever qualquer linha, eu queria saber o que cada disciplina cobra e qual é a regra de IA. Daí veio a regra 1.

## 2. Escolher o problema e o lugar (10/11)

> ok, então começamos escolhendo o nosso problema, de uma lista de opções que possamos selecionar, que sejam minimamente descentes, nao quero coisas futeis

> explica um pouco mais sobre essa zeladoria do bairro

> ok gostei da ideia, podemos prosseguir

> nomes: Cesar Aaron Herrera, Anthony Gonçalves Sforzin
>
> RM: CESAR: 565398, ANTHONY: 562096
>
> O bairro que podemos observar pode ser um da liberdade? rua barão de iguape
>
> como assim o numero da equipe?
> nao sei dizer essa do professor de java
> ainda temos que escolher o nome
>
> além disso temos que criar ja o repo no github, mas nao quero que voce de push em nada com seu nome "claude" e etc, quero que apenas apareça eu ali no commit push e etc, mas que voce possa fazer isso por mim usand oo gh que ta autenticado no meu terminal

> corriji eu acho o problema do github, o professor mal tem exercicio de java, ele pediu de alguma maneira no doc da GS entao faremos dessa maneira, ja perguntei pro proff de network qual seria o numero do meu gp, agora só decidirmos o proximo passo

**Decisão:** a IA listou opções e eu escolhi zeladoria. O lugar é a Rua Barão de Iguape, na Liberdade, região onde eu moro. Fui eu que perguntei ao professor de Network o número da equipe.

## 3. Rede: confirmar com o professor (10/11)

> antes disso o professor de network pediu um print da parte que pede o numero da equipe, pode abrir pra mim? na pagina pra eu printar?

> ta o proff respondeu a gnt pode escolher
> ex:
> Equipe: 192.168.10.0
> Cidadão: 192.168.20.0
> Servidores: 192.168.30.0
>
> (resposta do professor) Esse X pode ser qualquer número, mas é um número para cada setor. Pode ser 1, 2 ou 3, ou 10, 20, 30
>
> a gnt escolhe
>
> e pode dar commit, mas antes revise pra que nao possa haver algum erro ou contradição que nos atrapalhe futuramente

**Decisão:** usamos 10, 20 e 30, como o professor orientou: uma rede /24 para cada setor, em vez de dividir um único /24 em três. Antes do commit, pedi revisão para não ter contradição entre o README, as configurações e o plano de endereços.

## 4. Banco de dados: entender antes de aceitar (10/11)

> Sim, modelo de dados

> Sim, DML e consultas

> perai, como assim usam IDs fixos? ele entende a categoria? e o peso e ja coloca o ID que ja tem reservado? ou cria um novo? nao entendi bem isso, e consequentemente nao entendi o resto

> pera e se formos registrar novas categorias quem faria essa medição de peso? pra adicionar

> pode deixar como sugestão mas nao obrigatorio essa regua sabe?

> voce entendeu que eu quero que a sugestão apareça para o gestor e nao que fique só no banco de dados certo?

**Decisão:** o peso de uma categoria nova é escolhido pelo gestor, de 1 a 5. A régua só sugere um valor e aparece na tela de categorias, não fica escondida no banco. Essa regra está no backlog (US14), na API e no site.

## 5. API Java e MVP web (10/11)

> API Java + Render

> antes revise e veja se nao há possiveis erros, alem disso quero que me faça um resumo do que foi feito

> antes de qualquer coisa queria definir um objetivo, tipo, faremos o mvp como? em formato web? ou o que?

> pode ser, web então, vamos fazer tudo, e se vermos que é possivel ja implementamos, login real, fotos e todas essas ideias, além disso quero que integre junto ao figma, para que eu possa alterar também, e pode fazer o commit, mas espero que terminemos tudo logo, para começarmos a melhorar ainda mais o projeto

**Decisão:** o MVP é web (HTML, CSS e JavaScript), consumindo a API Spring Boot. A API foi publicada no Render depois, em 16/11. Login real e fotos ficaram fora da entrega. Comecei uma versão com login à parte, fora da entrega (seção 9).

## 6. Data Science e Figma (10/11 e 11/11)

> Data Science

> agora eu tenho o figma pro, pode tentar integrar, além disso me passe um resumo um pouco curto para que eu possa entender as mudanças e adicionais que fizemos tanto no front (que vamos mudar com toda certeza) quanto em data science

> tem figma instalado nessa maquina? se for possivel instale

**Por quê:** o resumo curto era o jeito de eu conseguir explicar cada parte. Exemplo: na tela de categorias, a régua só sugere um peso; o que entra na prioridade é o peso que o gestor salva (`web/js/pagina-categorias.js`).

## 7. Orquestrar duas IAs (11/11)

A partir daqui, parte das revisões e correções foi delegada ao Codex. O Claude conferia o resultado no código e nos testes, e eu decidia o que entrava.

> quero começar a fazer uma orquestração, entre LLMs, tem alguma skill sobre isso, para fazer essa conexão entre LLMs, e delegação entre agentes?

> quero conectar diferentes proveodores, e ver os chats trabalhando juntos, nao há nada em relação a isso?

> voce nao consegue fazer a chamada usando a validação que ja tem no terminal, como por exemplo o codex com dangerous skips, e ir delegando a tarefa entre voces e lançando subagents do codex e voce revisando? nao tem nenhuma ferramenta que faça isso, ja usei o Orca, mas queria me mandar aqui no app do desktop enquanto você faz algo nesse estilo

> e se tivesse uma interface para que eu possa vizualizar essas chamadas dos agentes, aqui mesmo no app desktop, sera que nao podemoos fazer uma skill do genero? uma vizualização bem simples, minimalista sabe?

> tudo bem, agora faça a correção usando o codex também, e revise parte do projeto e melhorias que possam ser feitas

> ok enquanto eles vao fazendo, acha que essa skill, de agentes pode ser melhorada? tipo uma coisa que eu to curioso e em dúvida é sobre a (responsividade, UI\UX, e também sobre os modelos que o GPT esta usando para fazer cada tarefa e se é possivel alterar)

> antes disso peça e também faça uma revisao usando o 6.1 sol, e veja se não há nenhum possivel erro ou algo do genero

> ok quero que faça TUDO E DA MANEIRA MAIS PERFEITA POSSIVEL, USANDO O CODEX com o Astra 6 no high, e quero que faça tudo que precisa, e revise tudo, garantindo que esteja tudo certo, quero que use o figma, conectado pra interface web, e quero que melhore e nao deixe com cara de AI sloop, quero realmente um projeto que possa me fazer ganhar

**Resultado:** um painel (`/agentes`) no app mostra cada chamada ao Codex, com modelo, título e resposta. A partir daí, nas rodadas grandes, um modelo fazia e outro revisava.

## 8. Revisão de professor e comparação com o SP156 (11/11)

> antes faça a revisao, e melhora dessa UI, nao precisa mais usar o Astra, pode usar o Luna no max, e faça comparação com o 156 e veja se há possiveis melhorias, em paralelo revise rigorozamente o projeto em si na visao de um professor e veja se não há nada que eles possam criticar ou descontar notas, como comentario de IA no projeto e etc, quero realmente fazer um site funcionando, com login e etc, mas isso pode deixar que nao vou entregar, é só por que quero realmente fazer algo funcional.

**Resultado:** a comparação com o SP156 trouxe duas mudanças no site: o número do registro para o morador acompanhar e o caminho para a Ouvidoria do SP156 quando o prazo vence. A revisão "como professor" leu o enunciado item por item contra o repositório.

## 9. Visual, usuários simulados e versão com login (12/11)

> quero ajustar o visual do site, estou com o figma no meu computador, consegue usar e me mostrar? além disso liste o que falta que eu tenha que fazer? e como faremos

> voce sabe que voce pode fazer esse do packet tracer sim, alem disso sobre o visual, eu acho ainda que está muito generico, quero algo realmente lindo de se usar, mas que também nao saia do escopo visual e fique algo um pouco, desconectado, pode tomar exemplos *QUE DERAM CERTO* e ver de se basear neles, e realmente caprichar no detalhamento, além de simular users ou QAs para que nao haja possiveis erros, e veja o que mais é possivel você fazer

**Resultado:** a identidade veio da própria rua: endereço como placa azul de São Paulo e a etapa do pedido desenhada como linha de metrô ("Linha do atendimento"). Três personas simuladas (Helena, numa janela estreita de 640 px, que simula zoom de 200%, registrando com o teclado; Rafael, num celular de 360 px; e Márcia, na fila do gestor) e uma checagem automática de acessibilidade (axe) fazem 38 verificações no site. Os testes e as revisões de código acharam defeitos reais, todos corrigidos:

- o Enter não buscava o endereço;
- a marca de seleção aparecia em todas as categorias;
- o prazo era cortado na fila do gestor;
- na revisão de código: o nome da estação atual era anunciado duas vezes para leitor de tela.

A versão com login segue em andamento numa cópia separada do projeto e não faz parte da entrega.

## 10. Deploy, Packet Tracer e a etapa Escutar (15/11 e 16/11)

> meu RM (cesar aaron) pode ser o que vai rodar o no Render, pode voce mesmo continuar a instalar esse do packet tracer, e alem disso quero ainda melhorar o Frontend

> o que falta?

Para a etapa Escutar, respondi eu mesmo, como morador da rua:

> buraco na estrada e lixo na calçada, iluminação que fica apagada
>
> nao conhecia o 156 entao nunca pedi
>
> nao sei foi resolvido ainda
>
> os buracos na estrada é um problema ainda que nao foi resolvido
>
> acho que o carrinho de bebe por conta dos mendigos que jogam lixo na calçada la

O que levamos para o projeto: o lixo bloqueia a calçada e quem empurra carrinho precisa desviar. O relato veio depois das primeiras telas e serviu para conferir as escolhas que já tínhamos feito.

> Sim, o frontend

**Resultado:** a API roda no Render ligada ao Oracle da FIAP com o meu RM. A senha eu digitei no painel do Render. O Packet Tracer foi instalado e a rede montada nele. O `running-config` dos documentos é a saída real dos equipamentos.

## 11. Pitch, Planning Poker e publicação (16/11 e 17/11)

> faça um planning poker que encaixe nos requisitos e analisando o que fizemos aqui, além disso quero que voce grave ambos os pitchs, porem deixe sem audio e me faça um roteiro pra que eu grave falando e voce apenas integre no video e poste,

> Sim, publique

> faça a revisao e melhora de tudo e tente terminar tudo que falta, pode usar o codex 6.2 astra com flash de velocidade, revise se nao há nenhuma AI sloop ou algum comentario de IA que possa fazer eu receber menos pontos, e melhore o que ja foi feito

> consegue fazer uma correção pra poder usar o packet tracer sem ocupar toda minha tela?

> Sim, poste o 3D

> olha pega tudo o que a gnt falou até agora, e deixa os prompt.md mais bonito, de um jeito que mostre que eu sei do que to falando e do que to pedindo, que to usando a IA como ferramenta, em paralelo ja faça o gpt terminar o planning poker, e acho que quero uma narração com voz gerada de IA ao inves de usar a minha, o que acha?

**Resultado:**

- Os vídeos do pitch juntam capturas do site real e slides (o geral também mostra a cena 3D). O roteiro tem as falas cronometradas e a narração entrou depois.
- O pitch geral da GS ganhou narração com voz gerada por IA. O do Agile eu narrei com a minha voz, porque o enunciado pede narração de integrante do grupo.
- O site estático foi publicado no Render.
- A revisão final procurou números que não batiam com o código e inconsistências entre disciplinas.
- O Packet Tracer passou a rodar numa tela virtual, sem ocupar a minha.
- O vídeo 3D foi publicado no YouTube.
- No Planning Poker, a IA não vota no meu lugar. Ela entra como estimador independente, e quem decide as divergências sou eu (seção 13).

## 12. Rodadas do Codex

Estas são as rodadas principais. Os pedidos foram escritos pelo Claude, a partir do que eu pedi, e enviados ao Codex. As revisões rodaram só com permissão de leitura. As correções podiam escrever apenas dentro da pasta do projeto. Os commits vieram depois da revisão e saíram no meu nome.

| Data | Modelo | Pedido | O que foi feito com a resposta |
|---|---|---|---|
| 11/11 | `gpt-6-luna` | Corrigir e revisar partes do projeto | O Claude conferiu e aplicou as correções aceitas |
| 11/11 | `gpt-6.1-sol` | Revisão independente procurando erros | Os achados viraram correções antes do commit |
| 11/11 | `gpt-6-astra` (high) | Rodada completa de melhorias e revisão | Revisada em partes pelo Claude e por outro modelo |
| 11/11 e 12/11 | `gpt-6-luna` (máximo) | UI comparada ao SP156 e revisão como professor | Lista de melhorias aplicada no site e nos documentos |
| 15/11 | `gpt-6.1-sol` | Revisão de código do visual v3: lógica, XSS, regressões e acessibilidade | 12 achados com arquivo e linha |
| 15/11 | `gpt-6-luna` | Corrigir os 12 achados, sem mudar textos nem rotas | O Claude conferiu cada um no código |
| 16/11 | `gpt-6-luna` | Acabamento v4: mapa calmo, lista ligada aos pinos, barra de ação no celular | Depois, o Claude rodou as personas simuladas no site |
| 17/11 | `gpt-6.2-astra` (rápido) | Revisão como professor, disciplina por disciplina | Lista de pontos que podiam tirar nota |
| 17/11 | `gpt-6.2-astra` (rápido) | Procurar comentários e textos com cara de gerados | Achados aplicados na rodada seguinte |
| 17/11 | `gpt-6.2-astra` (rápido) | Duas frentes em paralelo, uma para código e análise, outra para textos, com pastas separadas | Notebook reexecutado sem vazamento de dados e regras novas na API; depois, a regressão completa rodou com a API local e o Oracle de teste |
| 18/11 | `gpt-6.2-astra` e `gpt-6.2-sol` | Estimar as 25 histórias no Planning Poker | Ver seção 13 |
| 18/11 | `gpt-6.2-astra` (rápido) | Conferir o prompts.md e o roteiro do pitch contra o repositório | Corrigidos números (dez estimativas, 38 verificações), falas do roteiro e o texto da etapa Escutar |
| 19/11 | `gpt-6.2-sol` | Revisão final como professor, item por item da rubrica de cada disciplina | Legenda do diagrama de casos de uso, nome do modelo lógico, orientação de rede no PDF e as duas correções abaixo |
| 19/11 | `gpt-6.2-astra` (rápido) | Conferir de novo o prompts.md contra o repositório e o histórico do git | Datas, autoria das rodadas e a descrição dos vídeos e dos testes |
| 19/11 | `gpt-6.2-astra` (rápido) | Java: manter a regra de território quando a ocorrência ou a equipe é editada com visita agendada | Regressão completa com o Oracle de teste: 52 ok, 0 falhas |
| 19/11 | `gpt-6.2-astra` (rápido) | Data Science: tirar da amostra de treino o que só se sabia depois do corte | Notebook reexecutado do zero; números novos conferidos e atualizados nos documentos |

Exemplo de pedido ao Codex, o do Planning Poker, completo:

```text
Você é um estimador independente numa sessão de Planning Poker do backlog do RuaViva (FIAP GS 2026.2). Só leitura: não altere arquivos.
Leia agile/backlog.csv (25 histórias com critérios de aceite) e olhe o código que implementa cada uma (web/, java-api/, data-science/, dynamic-programming/) para julgar esforço, regras e incerteza. NÃO olhe a coluna "pontos" do CSV: ignore-a, ela é a estimativa anterior e não pode influenciar seu voto.
Para cada história, escolha uma carta Fibonacci (1, 2, 3, 5, 8 ou 13) comparando as histórias entre si (pontos medem esforço relativo, regras e incerteza, não horas). Use como âncora: a história mais simples do backlog vale 1 ou 2.
Responda SOMENTE com linhas no formato CSV abaixo, sem texto antes ou depois:
id;carta;motivo
O motivo tem no máximo 15 palavras, em português, citando o que pesa (ex.: "três passos, busca de endereço, rascunho e aviso de repetido").
```

## 13. Planning Poker com IA

Dois modelos estimaram as 25 histórias, cada um sem ver o voto do outro. Os dois receberam a ordem de ignorar a coluna de pontos do backlog, mas a coluna estava no arquivo que leram. Os votos iguais, em 20 histórias, foram aceitos. As divergências eu decidi:

| História | gpt-6.2-astra | gpt-6.2-sol | Final | Por quê |
|---|---:|---:|---:|---|
| US01 Escolher perfil | 1 | 2 | 2 | Mantive o valor do backlog: tem lista da API, perfil guardado e entrada do gestor |
| US08 Meus registros | 2 | 3 | 3 | Duas listas e estados vazios com ação |
| US09 Prioridade | 8 | 5 | 8 | Soma quatro regras, aplica o bônus uma vez só e explica cada parcela |
| US15 Cidadãos pela API | 3 | 5 | 5 | Recalcula as pendências quando a condição prioritária muda |
| US19 Notebook | 13 | 8 | 13 | Dois modelos e o cuidado com vazamento temporal, que deu retrabalho de verdade |

A sessão mudou dez estimativas anteriores (US03, US04, US06, US09, US10, US14, US15, US16, US17 e US19). As 14 histórias Must passaram a somar 69 pontos. O resultado está em `agile/backlog.csv` e no documento de Agile.

## 14. Testes e conferências

- Regressão da API: 52 verificações com `curl` contra a API local e o Oracle de teste (`java-api/testes/regressao.sh`). Última rodada completa em 19/11: 52 ok, 0 falhas.
- Site: 38 verificações com três personas simuladas e o axe, apontando para a API local para não sujar o banco da FIAP.
- Programação dinâmica: 19 testes automatizados.
- Notebook: reexecutado do zero, com corte temporal antes do treino.
- Rede: `running-config` exportado do Packet Tracer e testes de ping e de ACL com resultado observado.
- Deploy: API e site abertos no Render, inclusive com o servidor saindo do modo de espera.
