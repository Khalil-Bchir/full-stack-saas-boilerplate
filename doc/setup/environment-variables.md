# Environment Variables

Environment files live at the **monorepo root** and are loaded via `dotenv-cli` in workspace scripts.

**Repository:** [github.com/Khalil-Bchir/full-stack-saas-boilerplate](https://github.com/Khalil-Bchir/full-stack-saas-boilerplate)

> Read [Environments & NODE_ENV](./environments-and-node-env.md) for how to choose the right env file and what `NODE_ENV` controls.

## File layout

```mermaid
flowchart TB
    subgraph Committed["Committed templates"]
        EX[".env.example"]
        EXS[".env.staging.example"]
        EXP[".env.production.example"]
    end

    subgraph Local["Local runtime gitignored"]
        ED[".env.development"]
        ES[".env.staging"]
        EP[".env.production"]
        EL[".env.local"]
    end

    EX -->|cp| ED
    EXS -->|cp| ES
    EXP -->|cp| EP
    EL -.->|overrides| ED
```

| File | Purpose | Committed? |
| --- | --- | --- |
| `.env.example` | Development template | Yes |
| `.env.staging.example` | Staging template | Yes |
| `.env.production.example` | Production template | Yes |
| `.env.development` | Local development | No (gitignored) |
| `.env.staging` | Staging runtime | No (gitignored) |
| `.env.production` | Production runtime | No (gitignored) |
| `.env.local` | Local overrides | No (gitignored) |

### Create env files

```bash
cp .env.example .env.development
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

### Load order (root `pnpm dev`)

```mermaid
flowchart LR
    A[".env"] --> B[".env.development"] --> C[process.env]
```

---

## Variable reference

### Core

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `development`, `staging`, or `production` | `development` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |

### API server

| Variable | Required | Description | Default |
| --- | --- | --- | --- |
| `SERVER_PORT` | No | Fastify listen port | `8000` |
| `SERVER_HOST` | No | Fastify bind address | `localhost` |
| `FASTIFY_CLOSE_GRACE_DELAY` | No | Graceful shutdown delay (ms) | `500` |

### Authentication

| Variable | Required | Description |
| --- | --- | --- |
| `ACCESS_TOKEN_SECRET` | Yes | JWT signing secret |
| `ACCESS_TOKEN_TTL` | No | Token expiry (`1d`, `7d`, `12h`) |
| `COOKIE_SECRET` | Yes (staging/prod) | Fastify cookie signing |

### Frontend (Next.js)

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Public API base URL (inlined at build) |

> Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in them.

### Option C — AI queue / cache / worker

| Variable | Required | Description | Default |
| --- | --- | --- | --- |
| `REDIS_URL` | Yes (for AI jobs) | Redis connection URL | — |
| `AI_STREAM_KEY` | No | Redis Streams key | `ai:jobs` |
| `AI_CONSUMER_GROUP` | No | Consumer group name | `ai-workers` |
| `AI_CACHE_TTL_SECONDS` | No | Cache TTL for EMBED/MATCH | `300` |
| `AI_SERVICE_PORT` | No | Flask health port | `5000` |
| `AI_ENABLE_WORKER` | No | Run worker thread in AI container | `true` |
| `AI_WORKER_CONCURRENCY` | No | Jobs claimed per loop | `1` |
| `AI_INTERNAL_TOKEN` | Staging/prod | Protects AI internal endpoints | — |
| `AI_DATABASE_URL` | Local compose | DB URL seen from AI container | `host.docker.internal` DSN |

Local Redis/AI: `pnpm infra:up` (`compose.dev.yaml`).  
Staging/prod: Kubernetes Services `saas-redis` + `saas-ai` (see [AI Async Jobs](../features/ai-async-jobs.md)).

---

## Per-environment values

### Development (`.env.development`)

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
AI_STREAM_KEY=ai:jobs
AI_CONSUMER_GROUP=ai-workers
```

### Staging (`.env.staging`)

Copy from `.env.staging.example` (includes in-cluster `REDIS_URL`).

### Production (`.env.production`)

Copy from `.env.production.example`. Prefer a managed Redis URL in production when you need HA.

---

## Turbo cache invalidation

These variables are declared in `turbo.json` under `globalEnv`:

- `NODE_ENV`
- `DATABASE_URL`
- `NEXT_PUBLIC_API_URL`
- `REDIS_URL`
- `AI_STREAM_KEY`
- `AI_CONSUMER_GROUP`
- `AI_CACHE_TTL_SECONDS`

Changing them invalidates Turbo build caches across workspaces.

---

## Security checklist

- [ ] Never commit `.env.development`, `.env.staging`, or `.env.production` with real secrets
- [ ] Use `openssl rand -base64 32` for `ACCESS_TOKEN_SECRET` and `COOKIE_SECRET`
- [ ] Use different secrets per environment
- [ ] Use separate databases per environment
- [ ] Store production secrets in Kubernetes Secrets via `deploy/scripts/bootstrap-secrets.sh`
