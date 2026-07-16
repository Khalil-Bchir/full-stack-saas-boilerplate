# @saas-boilerplate/ai

Flask AI service for **Option C**: async job worker + internal health API.

**Full integration guide:** [doc/features/ai-async-jobs.md](../../doc/features/ai-async-jobs.md)

```mermaid
flowchart LR
    API[Fastify API] -->|XADD ai:jobs| Redis[(Redis Streams)]
    API --> PG[(PostgreSQL AiJob)]
    Redis -->|XREADGROUP| Worker[Flask worker]
    Worker --> PG
    Worker --> Models[Inference stubs / models]
```

## Responsibilities

| Does | Does not |
| --- | --- |
| Consume Redis Streams jobs | Own public product auth |
| Update `AiJob` status in Postgres | Talk to the browser |
| Expose `/health` for probes | Persist product domain data beyond job results |

## Job types

- `ANALYZE_VIDEO`
- `VERIFY_IDENTITY`
- `EMBED`
- `MATCH`

Processors under `app/processors/` are stubs ready to be replaced with Matchy model pipelines.

## Local development

`pnpm dev` / `turbo run dev` does **not** start this package (avoids failing when Python/Docker is missing). Use Compose or an explicit host run.

```bash
# from monorepo root (recommended)
pnpm infra:up

# or run worker on the host
cd apps/ai
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
export REDIS_URL=redis://localhost:6379/0
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_db?schema=public
# from root:
pnpm dev:ai
# or: pnpm --filter @saas-boilerplate/ai dev:local
```

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | Liveness/readiness for Docker/K8s |
| `GET` | `/ready` | Redis + consumer group ready |
| `GET` | `/internal/jobs/:id` | Requires `x-ai-internal-token` |

Public AI job APIs live on Fastify (`/api/v1/ai/jobs`), not here.

## Deploy

- Local: `compose.dev.yaml` service `ai`
- Staging/prod: `deploy/k8s/base/ai/` (ClusterIP)
- Image: `ghcr.io/khalil-bchir/saas-boilerplate-ai`
