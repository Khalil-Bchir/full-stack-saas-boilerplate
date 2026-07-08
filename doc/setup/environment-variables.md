# Environment Variables

Environment files live at the **monorepo root** and are loaded via `dotenv-cli` in workspace scripts.

> **Important:** Read [Environments & NODE_ENV](./environments-and-node-env.md) for how to choose the right env file, run staging/production, and what `NODE_ENV` controls in each workspace.

## File layout

| File | Purpose | Committed? |
| --- | --- | --- |
| `.env.example` | Template with placeholder values | Yes |
| `.env.development` | Local development defaults | Usually yes (no secrets) |
| `.env.staging` | Staging deployment | Yes (no secrets) |
| `.env.production` | Production deployment | Yes (no secrets) |
| `.env.local` | Local overrides and secrets | **No** (gitignored) |
| `.env.development.local` | Dev secrets override | **No** (gitignored) |

### Load order (root `pnpm dev`)

The root dev script loads:

```
.env → .env.development
```

Individual workspaces may load additional files:

- **API**: `../../.env.development` via `dotenv-cli`
- **App**: `../../.env` + `../../.env.production` (build) or `../../.env.development` (dev)

---

## Variable reference

### Core

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | Runtime environment — must match the env file in use (`development`, `staging`, `production`) | `development` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |

### API server

| Variable | Required | Description | Default |
| --- | --- | --- | --- |
| `SERVER_PORT` | No | Fastify listen port | `8000` |
| `SERVER_HOST` | No | Fastify bind address | `localhost` |
| `FASTIFY_CLOSE_GRACE_DELAY` | No | Graceful shutdown delay (ms) | `500` |

### Authentication

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `ACCESS_TOKEN_SECRET` | Yes | JWT signing secret | long random string |
| `ACCESS_TOKEN_TTL` | No | Token expiry | `1d`, `7d`, `12h` |
| `COOKIE_SECRET` | Prod recommended | Fastify cookie signing | long random string |

### Frontend (Next.js)

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Public API base URL (inlined at build) | `http://localhost:8000/api/v1` |

> Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in them.

---

## Per-environment examples

### Development (`.env.development`)

```env
NODE_ENV=development
SERVER_PORT=8000
SERVER_HOST=localhost
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_db?schema=public
ACCESS_TOKEN_SECRET=dev-secret-change-me
ACCESS_TOKEN_TTL=1d
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Staging (`.env.staging`)

```env
NODE_ENV=staging
SERVER_PORT=8000
SERVER_HOST=0.0.0.0
DATABASE_URL=postgresql://user:pass@staging-db:5432/saas_staging?schema=public
ACCESS_TOKEN_SECRET=<staging-secret>
ACCESS_TOKEN_TTL=1d
COOKIE_SECRET=<staging-cookie-secret>
NEXT_PUBLIC_API_URL=https://api.staging.example.com/api/v1
```

### Production (`.env.production`)

```env
NODE_ENV=production
SERVER_PORT=8000
SERVER_HOST=0.0.0.0
DATABASE_URL=postgresql://user:pass@prod-db:5432/saas_prod?schema=public
ACCESS_TOKEN_SECRET=<production-secret>
ACCESS_TOKEN_TTL=1d
COOKIE_SECRET=<production-cookie-secret>
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
```

---

## Turbo cache invalidation

These variables are declared in `turbo.json` under `globalEnv`:

- `NODE_ENV`
- `DATABASE_URL`
- `NEXT_PUBLIC_API_URL`

Changing them invalidates Turbo build caches across workspaces.

---

## Security checklist

- [ ] Never commit real secrets to `.env.development` / `.env.production`
- [ ] Use `.env.local` or your hosting provider's secret manager for production secrets
- [ ] Rotate `ACCESS_TOKEN_SECRET` if compromised
- [ ] Use different secrets per environment
- [ ] Scope `DATABASE_URL` narrowly per environment (dev DB ≠ prod DB)
