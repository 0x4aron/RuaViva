# Domain Driven Design (Java): API REST de zeladoria

API RESTful em **Spring Boot 3.5** (Java 21) com banco **Oracle** da FIAP. Ela implementa a parte central da CitizenTech: o cidadão registra ocorrências e apoia as dos vizinhos, a API calcula a prioridade e a subprefeitura agenda e conclui os atendimentos.

## Camadas

```
br.com.fiap.gs.zeladoria
├── model/       classes do domínio, uma por tabela (+ enums de status e tipo)
├── dao/         acesso ao banco com SQL (JdbcTemplate), uma classe por tabela
├── bo/          regras de negócio (validações, prioridade, mudanças de status)
├── controller/  endpoints REST (GET, POST, PUT, DELETE)
├── exception/   tratamento de exceções → respostas HTTP padronizadas
├── config/      configuração do CORS
└── dto/         objetos de resposta que não são tabelas (régua de pesos)
```

Fluxo de uma requisição: **Controller → BO → DAO → Oracle**.

## Regras de negócio (camada BO)

- **Prioridade da ocorrência:** peso da categoria × 10, + 2 por apoio, + 15 se estiver a até 200 m de um ponto sensível (distância pela fórmula de Haversine), + 10 se quem registrou é idoso ou PcD. É recalculada sempre que algo de que ela depende muda: um apoio é dado ou retirado, um ponto sensível muda, o peso de uma categoria muda ou um cidadão passa a ser (ou deixa de ser) prioritário.
- **Ciclo de vida da ocorrência:**

  ```
  ABERTA ──agendar atendimento──▶ EM_ANDAMENTO ──concluir atendimento──▶ RESOLVIDA
    ▲                                  │
    └── cancelar o único agendamento ──┘
  ABERTA / EM_ANDAMENTO ──PUT com status CANCELADA──▶ CANCELADA
  ```

  O status muda pelos atendimentos. Pelo `PUT /ocorrencias/{id}`, a única mudança de status aceita é cancelar, o que também cancela as visitas agendadas. Ocorrências `RESOLVIDA` ou `CANCELADA` são histórico e não podem mais ser alteradas. Quem registrou e a data de abertura nunca mudam.
- **Apoio ("também me afeta"):** o cidadão não pode apoiar a própria ocorrência nem apoiar a mesma ocorrência duas vezes. Ocorrências resolvidas ou canceladas não recebem apoio.
- **Atendimento:**
  - Só equipes ativas podem ser agendadas, e a data agendada não pode ser anterior à abertura da ocorrência.
  - Só atendimentos `AGENDADO` podem ser alterados. `CONCLUIDO` e `CANCELADO` são histórico, e um atendimento concluído não pode ser excluído.
  - Ao concluir, as outras visitas agendadas para a mesma ocorrência são canceladas. Se a equipe concluir antes do dia marcado, a data agendada passa a ser o dia da execução.
- **Cidadão:** o email é único. Se `prioritario` não for enviado no cadastro, vale `false`; se não for enviado no PUT, o valor atual é mantido.
- **Equipe:** se `ativa` não for enviada no cadastro, vale `true`; se não for enviada no PUT, o valor atual é mantido.
- **Categoria:** o peso vai de 1 a 5. A API oferece uma **régua sugerida** (`GET /categorias/regua-peso`) para o gestor consultar ao cadastrar uma categoria; ela não é obrigatória.
- **Datas:** "hoje" é sempre calculado no horário de São Paulo, mesmo com o servidor do Render em UTC.
- **CORS liberado:** uma página web em outro endereço (o futuro front-end) pode chamar a API.

## Tratamento de exceções

Todo erro volta no mesmo formato JSON (`dataHora`, `status`, `erro`, `mensagem`, `caminho`, `campos`):

| Situação | HTTP |
|---|---|
| Campo inválido (`@NotBlank`, `@Email`, `@Min`...) | 400 |
| JSON mal formado ou valor não aceito (ex.: status inexistente) | 400 |
| Registro não encontrado | 404 |
| Registro em uso ou valor único repetido (o banco recusou) | 409 |
| Regra de negócio violada | 422 |
| Banco indisponível | 503 |
| Método HTTP não permitido / Content-Type não aceito | 405 / 415 |
| Erro inesperado | 500 |

## Endpoints

Documentação interativa (Swagger): **`/swagger-ui.html`**

| Recurso | GET | POST | PUT | DELETE |
|---|---|---|---|---|
| `/subprefeituras` | listar, `/{id}` | ✔ | `/{id}` | `/{id}` |
| `/distritos` | listar, `/{id}` | ✔ | `/{id}` | `/{id}` |
| `/categorias` | listar, `/{id}`, `/regua-peso` | ✔ | `/{id}` | `/{id}` |
| `/cidadaos` | listar, `/{id}` | ✔ | `/{id}` | `/{id}` |
| `/pontos-sensiveis` | listar, `/{id}` | ✔ | `/{id}` | `/{id}` |
| `/equipes` | listar, `/{id}` | ✔ | `/{id}` | `/{id}` |
| `/ocorrencias` | listar (`?status=ABERTA`), `/{id}`, `/fila`, `/{id}/apoios`, `/{id}/atendimentos` | ✔ | `/{id}` | `/{id}` |
| `/apoios` | listar, `/{id}` | ✔ | não tem* | `/{id}` |
| `/atendimentos` | listar, `/{id}` | ✔ | `/{id}` | `/{id}` |

\* Um apoio só registra "este cidadão apoia esta ocorrência", então não há o que editar. Para desfazer, usa-se o DELETE.

### Exemplo: registrar uma ocorrência

```http
POST /ocorrencias
Content-Type: application/json

{
  "idCidadao": 2,
  "idCategoria": 1,
  "idDistrito": 1,
  "descricao": "Buraco grande perto da esquina",
  "logradouro": "Rua Barao de Iguape",
  "numero": "300",
  "latitude": -23.5584,
  "longitude": -46.6340
}
```

Resposta `201 Created`, com `status: "ABERTA"`, `dataAbertura` de hoje e `prioridade: 55.0` (tapa-buraco = 40, mais 15 por estar perto da escola).

## Como executar

### Ferramentas e versões

- Java JDK 21
- Maven 3.9 ou superior (ou a IDE, por exemplo IntelliJ)
- Banco Oracle (servidor da FIAP)
- Docker (opcional, para rodar igual ao Render)

### 1. Preparar o banco

No SQL Developer, conectado ao Oracle da FIAP, rode nesta ordem os scripts da pasta [`database/`](../database): `01_ddl.sql` e `02_dml.sql`.

### 2. Rodar localmente

```bash
export DB_URL="jdbc:oracle:thin:@oracle.fiap.com.br:1521:ORCL"
export DB_USER="seu_usuario_oracle"
export DB_PASSWORD="sua_senha_oracle"
mvn spring-boot:run
```

Abra <http://localhost:8080/swagger-ui.html>.

### 3. Deploy no Render

1. Em <https://render.com>, clique em **New → Web Service** e conecte o repositório do GitHub.
2. Configure:
   - **Root Directory:** `java-api`
   - **Language/Runtime:** `Docker` (o Render usa o [`Dockerfile`](Dockerfile) desta pasta)
   - **Branch:** `main`
   - **Instance Type:** Free
3. Em **Environment Variables**, cadastre `DB_URL`, `DB_USER` e `DB_PASSWORD`, com os mesmos valores do passo 2.
4. Clique em **Deploy**. Quando terminar, a API estará em `https://<nome-do-servico>.onrender.com/swagger-ui.html`.

> **Atenção:** no plano gratuito, o Render "dorme" depois de cerca de 15 minutos sem acesso. A primeira requisição depois disso pode levar até 1 minuto. Basta esperar e recarregar.

### Links

- Repositório: <https://github.com/0x4aron/RuaViva>
- Deploy: _a preencher após o deploy no Render_
