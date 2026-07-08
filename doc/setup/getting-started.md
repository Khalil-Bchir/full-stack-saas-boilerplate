# Getting Started — Clone to Running App (A–Z)

This guide walks you through setting up the **Full Stack SaaS Boilerplate** from a fresh clone to a running local environment.

## What you will have at the end

- PostgreSQL running locally (Docker)
- Fastify API on `http://localhost:8000`
- Next.js app on `http://localhost:3000`
- Prisma schema synced to the database
- Ability to register, log in, and access the dashboard

---

## 1. Prerequisites

Install these before cloning:

| Tool | Minimum version | Verify |
| --- | --- | --- |
| **Node.js** | 20.9+ (22 recommended) | `node -v` |
| **pnpm** | 10+ | `pnpm -v` |
| **Docker** | Latest stable | `docker -v` |
| **Git** | Any recent | `git -v` |

Enable pnpm if needed:

```bash
corepack enable
corepack prepare pnpm@10.12.4 --activate
```

---

## 2. Clone the repository

```bash
git clone <your-repo-url> my-saas-app
cd my-saas-app
```

Replace `<your-repo-url>` with your Git remote (GitHub, GitLab, etc.).

---

## 3. Install dependencies

From the monorepo root:

```bash
pnpm install
```

This will:

- Install all workspace dependencies (`apps/*`, `packages/*`)
- Run Husky git hooks via the `prepare` script
- Trigger `prisma generate` in `@saas-boilerplate/database` (postinstall)

---

## 4. Start PostgreSQL (Docker)

Create and run a local Postgres container:

```bash
docker run --name saas_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=saas_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Verify it is running:

```bash
docker ps | grep saas_postgres
```

> If you already have Postgres on port 5432, change the host port (e.g. `-p 5433:5432`) and update `DATABASE_URL` accordingly.

---

## 5. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.development
```

Edit `.env.development` with your local values:

```env
NODE_ENV=development
SERVER_PORT=8000
SERVER_HOST=localhost
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_db?schema=public
ACCESS_TOKEN_SECRET=replace-with-a-long-random-string
ACCESS_TOKEN_TTL=1d
COOKIE_SECRET=replace-with-another-long-random-string
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Generate secrets (optional):

```bash
openssl rand -base64 32   # use for ACCESS_TOKEN_SECRET
openssl rand -base64 32   # use for COOKIE_SECRET
```

See [Environment Variables](./environment-variables.md) for the full reference and [Environments & NODE_ENV](./environments-and-node-env.md) for how env loading works across workspaces.

---

## 6. Sync the database schema

Push the Prisma schema to your local database:

```bash
pnpm db:push
```

This creates the `User` table (and any other models defined in `packages/database/prisma/schema.prisma`).

Optional — open Prisma Studio to inspect data:

```bash
pnpm db:studio
```

Optional — seed development data:

```bash
pnpm --filter @saas-boilerplate/database db:seed:dev
```

---

## 7. Start development servers

From the monorepo root:

```bash
pnpm dev
```

Turbo runs both workspaces in parallel:

| Service | URL | Package |
| --- | --- | --- |
| Next.js frontend | http://localhost:3000 | `@saas-boilerplate/app` |
| Fastify API | http://localhost:8000 | `@saas-boilerplate/api` |
| Swagger UI | http://localhost:8000/docs | (if enabled) |

---

## 8. Verify the setup

### API health

```bash
curl http://localhost:8000/api/v1/common/health
```

### Register a user

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"password123"}'
```

### Log in via the app

1. Open http://localhost:3000/register
2. Create an account
3. Log in at http://localhost:3000/login
4. You should land on the dashboard at `/`

---

## 9. Production build (optional)

Verify everything compiles:

```bash
pnpm build
```

Build only the frontend:

```bash
pnpm build --filter=@saas-boilerplate/app
```

Build only the API:

```bash
pnpm build:api
```

---

## 10. Common issues

### `pnpm install` fails on Prisma generate

Ensure `DATABASE_URL` is set in `.env.development` even for generate — Prisma 7 reads config from `prisma.config.ts`.

### Port already in use

- API: change `SERVER_PORT` in `.env.development`
- App: run `pnpm --filter @saas-boilerplate/app dev -- -p 3001`

### Styling looks broken in the app

Ensure `apps/app/src/app/globals.css` includes:

```css
@source '../../../../packages/ui/src';
@source '../';
```

Restart the dev server after CSS changes.

### Database connection refused

```bash
docker start saas_postgres   # if container was stopped
docker logs saas_postgres    # check for errors
```

### `ACCESS_TOKEN_SECRET` missing

The API will fail JWT signing. Set it in `.env.development` before starting the API.

---

## Next steps

- [Development Workflow](./development.md) — daily commands and conventions
- [Authentication](../features/authentication.md) — how auth works end-to-end
- [UI System](../features/ui-system.md) — adding shadcn components
- [API Architecture](../features/api-architecture.md) — adding new routes
