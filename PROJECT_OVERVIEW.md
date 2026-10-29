# Projeto LGI / feira — AI Context Document

> **Purpose:** Marketplace web (PWA-like, mobile-first) para conectar **prestadores de serviços** (eletricistas, encanadores, pintores, profissionais de TI, etc.) a consumidores. Cada usuário tem perfil profissional ("Ficha Técnica"), pode postar conteúdo (feed estilo Instagram), curtir, comentar e ter sua agenda financeira.
>
> **Repositório:** `C:\Users\italo\Downloads\feira\feira`
> **Branding:** LGI (logo em `frontend/src/assets/LGI-brandlogo.png`)
> **Idioma do código/UI:** Português (Brasil)

---

## 1. Estrutura geral do repositório

```
feira/
├── backend/                  # Spring Boot 3.1.4 (Java 17) — porta 8080
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/lgi/...
│       └── resources/application.properties
├── frontend/                 # React 18 + TypeScript + Vite — porta 3000
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx           # Router
│       ├── main.tsx          # Entry
│       ├── styles.css        # CSS global (único arquivo)
│       ├── pages/            # Login, Register, Main, Prestador, Post
│       └── components/       # BottomNav, PostCard, modais, etc.
├── package-lock.json         # (root vazio — provavelmente artefato)
└── README.md                 # README do root (corrompido/vazio)
```

---

## 2. Backend (`backend/`)

### 2.1 Stack
- **Spring Boot:** `3.1.4` (parent POM)
- **Java:** 17
- **Dependências (pom.xml):**
  - `spring-boot-starter-web`
  - `spring-boot-starter-data-jpa`
  - `spring-boot-starter-mail`
  - `mysql-connector-j` (runtime)
- **Build:** Maven (`mvn spring-boot:run` em `backend/`)
- **Sem testes unitários.**

### 2.2 Configuração (`backend/src/main/resources/application.properties`)
- `server.port=8080`
- MySQL: `jdbc:mysql://localhost:3308/feira_db`
  - usuário: `italo`
  - senha: `Italo02122008` **(plain text — risco de segurança)**
- `spring.jpa.hibernate.ddl-auto=update` (Hibernate cria/atualiza tabelas JPA)
- `spring.jpa.show-sql=true` + logs Hibernate DEBUG
- SMTP Gmail configurado mas com **placeholders** (`seu-email@gmail.com` / `sua-senha-de-app`) — email **não funcional** até preencher.
- Flag importante: `spring.jpa.properties.hibernate.temp.use_jdbc_metadata_defaults=false` (evita erro "Unknown column RESERVED").

### 2.3 CORS (`config/CorsConfig.java`)
- Global: `addMapping("/**")` permite **apenas** `http://localhost:3000`.
- Métodos: GET, POST, PUT, DELETE, OPTIONS. `allowCredentials=true`.
- Cada Controller também declara `@CrossOrigin(origins = "http://localhost:3000")` (redundante mas presente).

### 2.4 Entry point (`Application.java`)
Standard `@SpringBootApplication` com `main()`.

### 2.5 Modelo de dados (`model/`)

| Entidade       | Tabela        | PK                  | Observações                                                                 |
| -------------- | ------------- | ------------------- | --------------------------------------------------------------------------- |
| `Login`        | `login`       | `documento_log` (String) | **Não é auto-gerada.** CPF/CNPJ. Senha em **plain text**. Inclui campos de perfil profissional. |
| `Post`         | `posts`       | `id` (Long, IDENTITY) | `mediaContent` como `LONGTEXT` (base64). `userName` e `isLikedByUser` são `@Transient`. |
| `Comment`      | `comments`    | `id` (Long)         | `userName` é `@Transient` (populado pelo controller).                       |
| `Like`         | `post_likes`  | `id` (Long)         | Unique constraint `(post_id, user_documento)`.                              |
| `Appointment`  | `appointments`| `id` (Long)         | Campos: `cli_id`, `service`, `date`, `time`, `duration`, `price`, `status_id`, `pre_id` (BigInteger). |

**Campos de `Login` (todos com prefix `_log` na coluna):**
`documento, nome, dataNasc, email, senha, descricao, servico, especialidade, formacao, tempoArea, valorHora (Double), qualidade (Double), credibilidade (String), emailComercial, telefone, recoveryCode, recoveryCodeExpiration`.

### 2.6 Tabelas extras (NÃO gerenciadas por JPA — apenas via JdbcTemplate)
- **`serviço`** (com cedilha!): `cod_serv`, `classe_serv` — lista de classes de serviço.
- **`serviço1`**: `cod_serv1`, `descr_serv1`, `cod2_serv1` (FK para `cod_serv` de `serviço`) — especialidades dentro de cada serviço.

> ⚠️ **Atenção:** A coluna `serviço_log` em `login` também tem cedilha. Queries em SQL raw precisam usar o nome exato com cedilha.

### 2.7 Repositórios (`repository/`)
Todos `JpaRepository<Entity, IdType>`:
- `LoginRepository extends JpaRepository<Login, String>` + `findByEmail(String)`
- `PostRepository` + `findAllByOrderByCreatedAtDesc()`, `findByUserDocumentoOrderByCreatedAtDesc(String)`
- `CommentRepository` + `findByPostIdOrderByCreatedAtAsc(Long)`, `deleteByPostId(Long)`
- `LikeRepository` + `findByPostIdAndUserDocumento`, `existsByPostIdAndUserDocumento`, `deleteByPostId`, `countByPostId`
- `AppointmentRepository` + `@Query` JPQL `findByYearAndMonth(int, int)`

### 2.8 Serviços (`service/`)
- **`EmailService`** — usa `JavaMailSender` para enviar código de recuperação. **Captura exceção e apenas loga** (não falha a request se SMTP estiver fora).

### 2.9 Controllers (`controller/`)

#### `RootController` — `GET /`
Redireciona 302 para `http://localhost:3000`.

#### `AuthController` — `@RequestMapping("/api")`
| Método | Rota                          | Função                                                                    |
| ------ | ----------------------------- | ------------------------------------------------------------------------- |
| GET    | `/user/{documento}`           | Retorna dados completos do usuário                                        |
| GET    | `/providers`                  | Lista todos prestadores (via JdbcTemplate, com fallback se col. faltar)   |
| POST   | `/login`                      | Body: `{credenciais, senha}`. `credenciais` pode ser documento ou email.  |
| POST   | `/register`                   | Body: `{documento, nome, dataNasc, email, senha}`. Valida idade 18–100.   |
| PUT    | `/user/{documento}`           | Atualiza perfil (nome, descricao, servico, especialidade, etc.)           |
| POST   | `/verify-password`            | Confere senha atual                                                       |
| PUT    | `/update-password`            | Atualiza senha sem código                                                 |
| POST   | `/forgot-password`            | Gera código 6 dígitos, salva no DB, envia email                           |
| POST   | `/verify-recovery-code`       | Confere código (com expiração 10 min)                                     |
| POST   | `/reset-password-recovery`    | Reseta senha usando código                                                |
| POST   | `/admin/fix-ages`             | Endpoint admin: força idade=18 para usuários inválidos                    |
| GET    | `/services`                   | Lista classes de serviço (raw SQL na tabela `serviço`)                    |
| GET    | `/specialties/{serviceCode}`  | Lista especialidades por código (raw SQL na tabela `serviço1`)            |

#### `PostController` — `@RequestMapping("/api/posts")`
| Método | Rota                          | Função                                                                    |
| ------ | ----------------------------- | ------------------------------------------------------------------------- |
| GET    | `/?currentUser=...`           | Todos os posts (com `userName` e `isLikedByUser` populados)               |
| GET    | `/user/{documento}`           | Posts de um usuário específico                                            |
| GET    | `/{id}`                       | Post único                                                                |
| POST   | `/`                           | Cria post. Body: `{userDocumento, mediaContent, mediaType, descricao}`    |
| POST   | `/{id}/like`                  | Curte (incrementa contador + cria Like)                                   |
| POST   | `/{id}/unlike`                | Descurte                                                                  |
| GET    | `/{id}/comments`              | Lista comentários                                                         |
| POST   | `/{id}/comments`              | Adiciona comentário                                                       |
| DELETE | `/{id}` (com body!)           | Deleta post (apenas pelo dono). Body: `{userDocumento}`. Cascade deleta comments e likes. |

#### `AppointmentController` — `@RequestMapping("/api/appointments")`
- `GET /?year=YYYY&month=M` — retorna `List<Appointment>` filtrado por ano/mês via `YEAR()/MONTH()` em JPQL.

### 2.10 Limitações / dívidas técnicas conhecidas
1. **Senhas em plain text** — sem BCrypt nem qualquer hash.
2. **Sem autenticação JWT/OAuth/Sessão.** Login retorna apenas `{message, documento}`; frontend guarda `documento` em `localStorage`. Qualquer rota é acessível sem token.
3. **CSRF, rate limiting, validação de entrada minimalista.**
4. **SMTP placeholder** — recuperação de senha não enviará email até configurar `application.properties`.
5. **Endpoint `/admin/fix-ages` sem proteção** — qualquer um pode chamar.
6. **DELETE com body** — anti-pattern HTTP, mas usado para passar `userDocumento`.
7. **Sem testes.**

---

## 3. Frontend (`frontend/`)

### 3.1 Stack
- **React:** `^18.2.0` + `react-dom`
- **react-router-dom:** `^6.11.2`
- **Vite:** `^5.0.0` (`@vitejs/plugin-react ^4.0.0`)
- **TypeScript:** `^5.1.6`, `strict: true`, `target: ESNext`, `jsx: react-jsx`
- **Sem libs de UI** (sem Tailwind, MUI, Antd, etc.) — todo o estilo em CSS plano em `src/styles.css`.
- **Sem libs de state management** — `useState`/`useEffect` + `localStorage`.

### 3.2 Scripts (`frontend/package.json`)
- `npm run dev` → Vite dev server (porta **3000**, definido em `vite.config.ts`)
- `npm run build`
- `npm run preview`

### 3.3 Roteamento (`src/App.tsx`)
| Rota                | Componente | Descrição                                       |
| ------------------- | ---------- | ----------------------------------------------- |
| `/`                 | `Login`    | Tela de login                                   |
| `/register`         | `Register` | Cadastro de novo usuário                        |
| `/main`             | `Main`     | App principal com tabs (Início, Procurar, Financeiro, Perfil) |
| `/prestador/:id`    | `Prestador`| Perfil público de um prestador                  |
| `/posts/:id`        | `PostPage` | Detalhe de um post                              |

`App.tsx` também aplica tema dark/light na montagem lendo `localStorage.theme`.

### 3.4 Estado e persistência no cliente
Tudo via `localStorage`:
- `documento` — ID do usuário logado (a "sessão").
- `theme` — `'dark'` ou `'light'`.
- `profileImageLocal_{documento}` — foto de perfil em base64 (por usuário).
- `bgImageLocal_{documento}` — imagem de capa em base64 (por usuário).

> ⚠️ Não há "logout" implementado em sentido formal — apenas limpar `localStorage`.

### 3.5 Pages (`src/pages/`)

#### `Login.tsx`
- Form: `credenciais` (documento ou email) + `senha`.
- POST `http://localhost:8080/api/login` → guarda `data.documento` em localStorage → navega para `/main`.
- Botão "Entrar com Google" presente mas **não funcional** (placeholder).
- Modal `PasswordRecoveryModal` para esqueci-senha.

#### `Register.tsx`
- Campos: `nome, documento, dataNasc, email, senha, senha2` (confirmar).
- Validação client-side: senhas coincidem; idade 18–100 (também valida server-side).
- POST `/api/register` → redireciona para `/` após 1.2s.

#### `Main.tsx` — **arquivo central, ~400 linhas**
- 4 tabs controladas por `tab: 'home' | 'finance' | 'profile' | 'inicio'` (default: `inicio`).
- **Tab `inicio`** (Feed): lista todos posts via `GET /api/posts?currentUser={doc}`. Renderiza com `<PostCard>`.
- **Tab `home`** (Procurar): lista prestadores via `GET /api/providers`. Filtros por categoria (`Todos, Eletricista, Encanador, Pintor, TI`) + busca por nome/serviço/descrição. Renderiza com `<CardPrestador>`. Usa imagens placeholder (Unsplash + pravatar).
- **Tab `finance`** (Financeiro): renderiza `<FinanceiraTab>` (calendário + cards de ganhos).
- **Tab `profile`** (Perfil): mostra dados do usuário (nome, idade calculada, valor/hora, qualidade em estrelas, credibilidade, etc.) + lista posts próprios via `GET /api/posts/user/{doc}`. Botões: postar, alterar tema, configurações, editar perfil.
- Imports: `BottomNav, ProfileEditModal, PostModal, PostCard, CardPrestador, UserSettingsModal, FinanceiraTab`.
- ⚠️ Tem campo `cidade` no estado/UI, mas backend **não retorna** `cidade` ainda — TODO marcado no código.

#### `Prestador.tsx`
- Perfil público de outro usuário.
- GET `/api/user/{id}` para dados e `/api/posts/user/{id}` para posts.
- Não exibe campos sensíveis nem permite editar.

#### `Post.tsx`
- Detalhe de um único post. Fallback: se 404, baixa lista de posts e filtra localmente.

### 3.6 Components (`src/components/`)

| Componente               | Função                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `BottomNav.tsx`          | Navegação inferior fixa com 4 ícones (Início, Procurar, Financeiro, Perfil).         |
| `CardPrestador.tsx`      | Card de prestador para o grid de busca. Navega para `/prestador/:id`.               |
| `FinanceiraTab.tsx`      | Tab Financeiro: cards de saldo, sub-tabs Consumidor/Prestador, **`<ServiceCalendar>`** interno que busca appointments do mês via `/api/appointments?year=&month=`. Lista mockada de "Controle de Serviços" (Possíveis/Hoje/Agendados/Recusados). |
| `PasswordRecoveryModal.tsx` | 3 steps: email → código (6 dígitos) → nova senha. Usa endpoints `/forgot-password`, `/verify-recovery-code`, `/reset-password-recovery`. |
| `PostCard.tsx`           | Card de post (estilo Instagram): foto/vídeo, like (com double-click), comentários inline, opções (interesse/denúncia/deletar). Reporta via modal mockado. Compartilhar via `navigator.share` ou clipboard. |
| `PostModal.tsx`          | Modal de criar post. Upload de arquivo → converte para base64 via `FileReader`. Limite: vídeos **até 215 segundos**. POST `/api/posts`. |
| `ProfileEditModal.tsx`   | Editar perfil. Campos: nome, email comercial, cidade, serviço (dropdown via `/api/services`), especialidade (dropdown via `/api/specialties/{code}`), descrição, formação, tempo na área, valor/hora. Imagens (avatar+capa) ficam em `localStorage` (por usuário) — **não vão para o backend**. |
| `UserSettingsModal.tsx`  | Configurações com sidebar: Login (credenciais + histórico), Pagamento (placeholder), Associação (placeholder). Fluxo de alteração de senha em 3 etapas usando `/verify-password` e `/update-password`. Histórico de login é **mockado**. |

### 3.7 Convenções de fetch
- Todos os fetchs apontam para `http://localhost:8080` **hardcoded**.
- Sempre `headers: {'Content-Type': 'application/json'}` quando há body.
- Tratamento de erro mínimo (`alert()` ou `console.error`).

---

## 4. Banco de dados (`feira_db`)

### 4.1 Conexão
- MySQL em **localhost:3308** (não a 3306 padrão).
- Usuário `italo`, senha `Italo02122008`.
- Database: `feira_db`.

### 4.2 Tabelas gerenciadas por JPA (`ddl-auto=update`)
- `login` (campos com sufixo `_log`)
- `posts`
- `comments`
- `post_likes` (com unique `(post_id, user_documento)`)
- `appointments`

### 4.3 Tabelas NÃO gerenciadas por JPA (devem existir no schema previamente)
- **`serviço`** (cedilha): `cod_serv`, `classe_serv`
- **`serviço1`** (cedilha): `cod_serv1`, `descr_serv1`, `cod2_serv1`

Estas duas só são lidas via `JdbcTemplate` raw SQL e populam os dropdowns de serviço/especialidade no `ProfileEditModal`.

---

## 5. Como rodar localmente

```bash
# 1) MySQL precisa estar rodando na porta 3308 com o database feira_db já criado
#    e as tabelas `serviço` e `serviço1` populadas (as outras o Hibernate cria sozinho).

# 2) Backend (porta 8080)
cd backend
mvn spring-boot:run

# 3) Frontend (porta 3000)
cd frontend
npm install
npm run dev
# abre http://localhost:3000
```

> O backend redireciona `GET http://localhost:8080/` para `http://localhost:3000` automaticamente.

---

## 6. Mapa rápido de "onde fica X" (para o AI)

| Quero...                                | Olhar em                                                      |
| --------------------------------------- | ------------------------------------------------------------- |
| Adicionar endpoint REST                 | `backend/src/main/java/com/lgi/controller/`                   |
| Adicionar campo no usuário              | `model/Login.java` + (frontend) `ProfileEditModal.tsx`, `AuthController.updateUser`, `AuthController.getUser` |
| Mudar query do banco                    | `repository/*.java` (JPA) ou `JdbcTemplate` em `AuthController` para tabelas raw |
| Adicionar página no app                 | `frontend/src/pages/` + registrar rota em `App.tsx`           |
| Mudar estilo                            | Único arquivo: `frontend/src/styles.css`                      |
| Configurar email/SMTP                   | `backend/src/main/resources/application.properties` (spring.mail.*) |
| Adicionar nova tab no Main              | `Main.tsx` (estado `tab`) + `BottomNav.tsx`                   |
| Lidar com auth                          | `localStorage.getItem('documento')` no frontend; nenhum middleware no backend |
| Tabelas com cedilha (`serviço`)         | Usar `JdbcTemplate` raw SQL, **não JPA**                      |

---

## 7. Bugs / TODOs visíveis no código

- `Main.tsx`: `user.cidade` é usado mas o backend não retorna esse campo (linhas comentadas com TODO).
- `PostCard.tsx`: "denúncia" é **mockada** (`setTimeout`); endpoint real não existe.
- `UserSettingsModal.tsx`: histórico de login é dado fictício hardcoded.
- `FinanceiraTab.tsx`: dados de "Possíveis/Hoje/Agendados/Recusados" são mockados; só o calendário usa dados reais via `/api/appointments`.
- `FinanceiraTab.tsx`: `today` está fixado em `new Date(2026, 4, 24)` (24 de maio de 2026) — não usa data real.
- `Login.tsx`: botão "Entrar com Google" é apenas visual.
- Backend pom.xml: faltam `<modelVersion>` properties como Java version explícita (depende do default do parent).

---

## 8. Resumo executivo (1 parágrafo)

App **mobile-first** estilo rede social profissional: usuários se cadastram com CPF/CNPJ, montam um perfil profissional (serviço, especialidade, valor/hora, qualidade, credibilidade), postam fotos/vídeos de até 215s, curtem e comentam. Há uma aba "Procurar" com filtros por categoria e uma aba "Financeiro" com calendário de agendamentos (`appointments`). Backend Spring Boot 3.1.4 monolítico expõe REST em `:8080`, sem autenticação real (login devolve `documento` em texto puro que o frontend guarda em `localStorage`). Frontend React+Vite em `:3000`, single-CSS, sem libs de UI ou state management. MySQL na porta **3308** com tabelas legadas (`serviço`, `serviço1`) com cedilha lidas via JdbcTemplate raw.
