# Getting Started — Clone to Running App (A–Z)

This guide walks you through setting up the **Full Stack SaaS Boilerplate** from a fresh clone to a running local environment.

**Repository:** [github.com/Khalil-Bchir/full-stack-saas-boilerplate](https://github.com/Khalil-Bchir/full-stack-saas-boilerplate)

## Setup flow

```mermaid
flowchart TD
    A[Clone repo] --> B[pnpm install]
    B --> C[cp .env.example .env.development]
    C --> D[Start PostgreSQL]
    D --> E[pnpm db:push / migrate]
    E --> F[pnpm dev<br/>Redis + AI + API + Next.js]
    F --> G{Verify}
    G --> H[pnpm test]
    G --> I[curl /api/v1/health]
    G --> J[curl AI /health]
    G --> K[Register & login in browser]
    H --> L[Ready to develop]
    I --> L
    J --> L
    K --> L
```

## What you will have at the end

- PostgreSQL running locally (Docker)
- Redis + Flask AI worker via `compose.dev.yaml`
- Fastify API on `http://localhost:8000`
- Next.js app on `http://localhost:3000`
- AI health on `http://localhost:5000/health`
- Prisma schema synced (including `AiJob`)
- Ability to register, log in, enqueue AI jobs, and access the dashboard

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
git clone https://github.com/Khalil-Bchir/full-stack-saas-boilerplate.git
cd full-stack-saas-boilerplate
```

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

## 4. Start PostgreSQL + Redis + AI (Docker)

### Option A — compose (recommended)

Redis + AI also start automatically with `pnpm dev`. To start them alone:

```bash
pnpm infra:up

# Optional Postgres via compose profile
docker compose -f compose.dev.yaml --profile db up -d postgres
```

### Option B — Postgres only (legacy)

```bash
docker run --name saas_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=saas_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Verify:

```bash
docker ps | grep -E 'saas_postgres|saas_redis|saas_ai'
```

If port 5432 is already in use, use `-p 5433:5432` and set `DATABASE_URL` to port `5433` in the next step.

---

## 5. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.development
```

Set these values in `.env.development` (Redis/AI defaults are already in `.env.example`):

```env
NODE_ENV=development
SERVER_PORT=8000
SERVER_HOST=localhost
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_db?schema=public
ACCESS_TOKEN_SECRET=dev-access-token-secret
ACCESS_TOKEN_TTL=1d
COOKIE_SECRET=dev-cookie-secret
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
REDIS_URL=redis://localhost:6379/0
```

Generate stronger secrets for shared environments:

```bash
openssl rand -base64 32   # ACCESS_TOKEN_SECRET
openssl rand -base64 32   # COOKIE_SECRET
```

See [Environment Variables](./environment-variables.md) for staging and production templates.

---

## 6. Sync the database schema

Push the Prisma schema to the local database:

```bash
pnpm db:push
```

This creates the `User` table (and any other models defined in `packages/database/prisma/schema.prisma`).

Open Prisma Studio:

```bash
pnpm db:studio
```

Seed development data:

```bash
pnpm --filter @saas-boilerplate/database db:seed:dev
```

---

## 7. Start everything

From the monorepo root:

```bash
pnpm dev
```

This runs `infra:up` first (Redis + Flask AI via Docker), then Turbo for the Node apps:

| Service | URL | How it starts |
| --- | --- | --- |
| Redis | `localhost:6379` | `compose.dev.yaml` |
| Flask AI worker | http://localhost:5000 | `compose.dev.yaml` |
| Next.js frontend | http://localhost:3000 | Turbo `@saas-boilerplate/app` |
| Fastify API | http://localhost:8000 | Turbo `@saas-boilerplate/api` |
| API health | http://localhost:8000/api/v1/health | — |
| Swagger UI | http://localhost:8000/docs | — |
| AI health | http://localhost:5000/health | — |

Node-only (infra already up): `pnpm dev:web`  
Stop Redis/AI: `pnpm infra:down`  
AI logs: `pnpm infra:logs`

---

## 8. Verify the setup

### Run unit tests

```bash
pnpm test
```

### API health

```bash
curl http://localhost:8000/api/v1/health
```

Expected response:

```json
{"status":"ok","message":"All systems operational"}
```

### Register a user

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

### Log in via the app

1. Open http://localhost:3000/register
2. Create an account
3. Log in at http://localhost:3000/login
4. You should land on the dashboard at `/`

---

## 9. Staging locally

```bash
cp .env.staging.example .env.staging
pnpm stage
```

---

## 10. Production build

Verify everything compiles:

```bash
pnpm test
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

## 11. Common issues

### `pnpm install` fails on Prisma generate

Ensure `DATABASE_URL` is set in `.env.development` — Prisma 7 reads config from `prisma.config.ts`.

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
docker start saas_postgres
docker logs saas_postgres
```

### `ACCESS_TOKEN_SECRET` missing

The API will fail JWT signing. Set it in `.env.development` before starting the API.

---

## Next steps

- [Development Workflow](./development.md) — daily commands and conventions
- [Testing](./testing.md) — unit test commands and structure
- [Deployment](./deployment.md) — Kubernetes and ArgoCD
- [Authentication](../features/authentication.md) — how auth works end-to-end
- [UI System](../features/ui-system.md) — adding shadcn components
- [API Architecture](../features/api-architecture.md) — adding new routes
