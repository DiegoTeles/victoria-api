# vic-api

API REST do portfólio Victória Maria, construída com [NestJS](https://nestjs.com) e PostgreSQL. Expõe rotas públicas (obras, categorias, conteúdos CMS) e rotas administrativas autenticadas por cookie HTTP-only e JWT.

## Requisitos

- Node.js 22.x (conforme `engines` em `package.json`)
- PostgreSQL 16+ (ou compatível)
- npm

## Configuração

1. Copie o ficheiro de ambiente:

```bash
cp .env.example .env
```

2. Ajuste as variáveis em `.env`. As principais:

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta HTTP da API (padrão `3000`) |
| `DATABASE_URL` | URI PostgreSQL (`postgres://user:pass@host:5432/db`) |
| `JWT_SECRET` | Segredo para assinatura do token de sessão admin |
| `ADMIN_PASSWORD` | Palavra-passe do painel administrativo |
| `FRONTEND_ORIGIN` | Origem do SPA para CORS (ex. `http://localhost:5173`) |
| `PUBLIC_ORIGIN` | URL pública do site (opcional; usada em URLs absolutas de upload e OG) |
| `USE_SECURE_COOKIE` | `true` em produção com HTTPS |
| `DATABASE_SSL` | `true` se o Postgres exigir SSL |
| `UPLOAD_DIR` | Diretório de ficheiros enviados (relativo ao cwd ou caminho absoluto) |
| `SPA_INDEX_PATH` | Caminho para `index.html` do build do front (Open Graph dinâmico) |

3. Instale dependências e execute as migrações:

```bash
npm install
npm run db:migrate
```

4. Arranque em desenvolvimento:

```bash
npm run start:dev
```

A API fica em `http://localhost:3000` (ou na porta definida em `PORT`). O prefixo global das rotas é `/api`.

## Scripts

| Comando | Função |
|---------|--------|
| `npm run start:dev` | Servidor com recarregamento automático |
| `npm run build` | Compilação TypeScript para `dist/` |
| `npm run start:prod` | Executa `node dist/main` (após `build`) |
| `npm run lint` | ESLint |
| `npm run test` | Testes unitários Jest |
| `npm run db:migrate` | Aplica migrações Sequelize |
| `npm run db:migrate:undo` | Reverte a última migração |

## Documentação interativa

Com o servidor em execução: **Swagger UI** em `/docs` (relativo à raiz da app, ou seja `http://localhost:3000/docs`).

## Funcionalidades principais

- **Autenticação admin:** `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`
- **Obras:** listagem e detalhe públicos; criação, atualização e remoção no admin
- **Categorias e subcategorias:** árvore pública e CRUD admin
- **Bio e currículo:** conteúdo por locale (público e admin)
- **Redes sociais:** listagem pública e CRUD admin
- **Mídia:** upload multipart autenticado (`POST /api/admin/blob`), ficheiros servidos em `GET /api/media/:name`, proxy opcional em `GET /api/blob/private`
- **Open Graph:** `GET /api/og-page?image=` para partilhas com meta tags dinâmicas
- **Saúde:** `GET /api/health`

## Docker e produção

O repositório inclui um exemplo de stack com Postgres, API e proxy Caddy em `../deploy/` (Docker Compose). Consulte `deploy/env.example` e monte o build estático do front onde o compose espera, conforme descrito nessa pasta.

## Licença

Projeto privado (`UNLICENSED`).
