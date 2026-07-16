# AI Async Jobs (Option C)

Complete guide for the **async AI integration** in this monorepo:

**Fastify product API → Redis Streams queue → Flask worker → PostgreSQL job status**

**Repository:** [github.com/Khalil-Bchir/full-stack-saas-boilerplate](https://github.com/Khalil-Bchir/full-stack-saas-boilerplate)

Related package docs:

- [`apps/ai/README.md`](../../apps/ai/README.md)
- [`packages/ai-contracts/README.md`](../../packages/ai-contracts/README.md)
- [`apps/api/README.md`](../../apps/api/README.md)
- [Environment Variables](../setup/environment-variables.md)
- [Deployment](../setup/deployment.md)
- [Practical AI Lab](../practical-ai-lab.md) — hands-on exercises to add a new job type end-to-end

---

## 1. Goals

| Goal | How Option C delivers it |
| --- | --- |
| Keep AI in Python (Flask) | `apps/ai` |
| Keep product logic in Fastify | `apps/api` owns auth, DB, public routes |
| Avoid Fastify acting as a live AI proxy | API only enqueues jobs and returns status |
| Survive long inference (video, CV) | Async queue + worker retries |
| Stay monorepo-friendly | `apps/ai` + `packages/ai-contracts` |
| Local vs prod parity | Compose locally, Kubernetes in staging/prod |

### What Fastify is **not**

Fastify is **not** a general API gateway for all backend services.

It is the **product API** that:

1. authenticates the user
2. persists a durable `AiJob`
3. enqueues work on Redis Streams
4. lets the client poll status/results

Flask never talks to the browser.

---

## 2. Architecture

```mermaid
flowchart LR
    Browser[Browser / Next.js] -->|JWT REST| API["apps/api<br/>Fastify"]
    API --> PG[(PostgreSQL<br/>AiJob)]
    API -->|XADD| Redis[(Redis Streams<br/>ai:jobs)]
    API -->|optional cache| Redis
    Redis -->|XREADGROUP| AI["apps/ai<br/>Flask worker"]
    AI --> PG
    AI --> Proc[Processors<br/>embed / match / video / identity]
```

### Responsibility split

| Layer | Owns | Does not own |
| --- | --- | --- |
| `apps/app` | UI, polling UX | Redis, Flask, models |
| `apps/api` | Auth, validation, `AiJob` CRUD, enqueue | Model inference |
| `apps/ai` | Consume jobs, inference, update job status | Public auth, product domain APIs |
| `packages/ai-contracts` | Job types, stream names, schemas | Runtime code |
| Redis | Queue transport + optional cache | Source of truth for job status |
| PostgreSQL | Durable job status + audits | Queue delivery |

### Why Postgres **and** Redis

| Store | Role |
| --- | --- |
| **PostgreSQL `AiJob`** | Source of truth for polling, audits, idempotency |
| **Redis Streams** | Fast delivery to workers, reclaim/retry of unacked messages |
| **Redis cache keys** | Optional short-circuit for repeatable `EMBED` / `MATCH` results |

If Redis loses a message, the DB record still exists for investigation.  
If a worker dies mid-job, `XAUTOCLAIM` can reclaim idle messages.

---

## 3. End-to-end job lifecycle

```mermaid
stateDiagram-v2
    [*] --> QUEUED: POST /api/v1/ai/jobs
    QUEUED --> RUNNING: worker claims job
    RUNNING --> SUCCEEDED: processor OK
    RUNNING --> QUEUED: retryable failure
    RUNNING --> FAILED: maxAttempts reached
    QUEUED --> CANCELLED: future cancel API
    SUCCEEDED --> [*]
    FAILED --> [*]
    CANCELLED --> [*]
```

### Happy path

1. Client calls `POST /api/v1/ai/jobs` with JWT.
2. Fastify inserts `AiJob` with `status=QUEUED`.
3. Fastify `XADD`s to Redis stream `ai:jobs`.
4. API returns `202` with `job.id`.
5. Flask worker `XREADGROUP`s the message.
6. Worker sets `status=RUNNING`, increments `attempts`.
7. Processor runs (stub or real model).
8. Worker writes `result` and `status=SUCCEEDED`, then `XACK`s.
9. Client polls `GET /api/v1/ai/jobs/:id` until terminal status.

### Failure path

1. Processor throws.
2. If `attempts < maxAttempts`, status returns to `QUEUED` and message stays unacked for reclaim.
3. If `attempts >= maxAttempts`, status becomes `FAILED`, error is stored, message is acked (poison pill stopped).

---

## 4. Repository map

```text
full-stack-saas-boilerplate/
├── compose.dev.yaml                 # local Redis + AI (+ optional Postgres)
├── apps/
│   ├── api/
│   │   ├── src/plugins/redis.ts     # redisClient decorator
│   │   ├── src/services/ai-jobs.ts  # enqueue + poll
│   │   ├── src/services/ai-cache.ts # EMBED/MATCH cache
│   │   ├── src/routes/v1/ai/        # public AI job routes
│   │   └── src/schemas/v1/ai.ts     # JSON Schema
│   └── ai/
│       ├── app/entrypoint.py        # health API + worker thread
│       ├── app/worker.py            # stream consumer loop
│       ├── app/queue.py             # Redis Streams helpers
│       ├── app/db.py                # AiJob status updates
│       ├── app/processors/          # inference stubs
│       ├── Dockerfile
│       └── requirements.txt
├── packages/
│   ├── ai-contracts/                # shared types + JSON schemas
│   └── database/prisma/
│       ├── schema.prisma            # AiJob model
│       └── migrations/..._add_ai_jobs/
└── deploy/k8s/base/
    ├── redis/                       # ClusterIP Redis
    └── ai/                          # ClusterIP Flask worker
```

---

## 5. Data model

Prisma model (simplified):

```prisma
enum AiJobType {
  ANALYZE_VIDEO
  VERIFY_IDENTITY
  EMBED
  MATCH
}

enum AiJobStatus {
  QUEUED
  RUNNING
  SUCCEEDED
  FAILED
  CANCELLED
}

model AiJob {
  id             String
  type           AiJobType
  status         AiJobStatus @default(QUEUED)
  userId         String?
  idempotencyKey String?     @unique
  payload        Json
  result         Json?
  error          String?
  attempts       Int         @default(0)
  maxAttempts    Int         @default(3)
  queuedAt       DateTime
  startedAt      DateTime?
  finishedAt     DateTime?
  createdAt      DateTime
  updatedAt      DateTime
}
```

Migration: `packages/database/prisma/migrations/20260716120000_add_ai_jobs/`.

---

## 6. Job types

| Type | Intended use | Processor |
| --- | --- | --- |
| `ANALYZE_VIDEO` | Video → structured profile fields | `apps/ai/app/processors/analyze_video.py` |
| `VERIFY_IDENTITY` | Face / liveness verification | `verify_identity.py` |
| `EMBED` | Text → embedding vector | `embed.py` |
| `MATCH` | Candidate ranking / rerank | `match.py` |

Current processors are **deterministic stubs** so the pipeline is testable. Replace their bodies with Matchy model code (Whisper, DeepFace, Ollama, etc.) without changing the Fastify API surface.

### Suggested payloads

#### `EMBED`

```json
{
  "type": "EMBED",
  "payload": {
    "text": "I provide web development in Tunis",
    "model": "mxbai-embed-large"
  },
  "idempotencyKey": "embed-user123-profile-v1"
}
```

#### `MATCH`

```json
{
  "type": "MATCH",
  "payload": {
    "query": "looking for a React developer",
    "candidateIds": ["u1", "u2", "u3"]
  }
}
```

#### `ANALYZE_VIDEO`

```json
{
  "type": "ANALYZE_VIDEO",
  "payload": {
    "mediaUrl": "s3://bucket/path/video.webm",
    "language": "fr"
  }
}
```

#### `VERIFY_IDENTITY`

```json
{
  "type": "VERIFY_IDENTITY",
  "payload": {
    "selfieUrl": "s3://bucket/selfie.jpg",
    "idDocumentUrl": "s3://bucket/id.jpg"
  }
}
```

---

## 7. Public API reference (Fastify)

Base path: `/api/v1/ai`  
Auth: required on all routes (`Authorization: Bearer <access_token>`)  
Autohook: `apps/api/src/routes/v1/ai/autohooks.ts`

### `POST /api/v1/ai/jobs`

Enqueue a job.

**Request body**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `type` | string enum | yes | See job types |
| `payload` | object | no | Processor input |
| `idempotencyKey` | string (8–128) | no | Same key returns existing job |
| `maxAttempts` | int 1–10 | no | Default `3` |

**Responses**

| Status | Meaning |
| --- | --- |
| `202` | Job accepted (`{ job }`) |
| `401` | Missing/invalid JWT |
| `400` | Schema validation failed |
| `503` | `AI_QUEUE_UNAVAILABLE` (no Redis) |

### `GET /api/v1/ai/jobs/:id`

Fetch one job owned by the authenticated user.

| Status | Meaning |
| --- | --- |
| `200` | `{ job }` |
| `404` | `AI_JOB_NOT_FOUND` |

When status is `SUCCEEDED`, Fastify may warm Redis cache for `EMBED` / `MATCH`.

### `GET /api/v1/ai/jobs?limit=20`

List recent jobs for the current user (newest first). `limit` max `100`.

### Job response shape

```json
{
  "job": {
    "id": "clx...",
    "type": "EMBED",
    "status": "SUCCEEDED",
    "userId": "clx...",
    "idempotencyKey": "embed-demo-001",
    "payload": { "text": "..." },
    "result": { "embedding": [], "dimensions": 32 },
    "error": null,
    "attempts": 1,
    "maxAttempts": 3,
    "queuedAt": "2026-07-16T10:00:00.000Z",
    "startedAt": "2026-07-16T10:00:01.000Z",
    "finishedAt": "2026-07-16T10:00:02.000Z",
    "createdAt": "2026-07-16T10:00:00.000Z",
    "updatedAt": "2026-07-16T10:00:02.000Z"
  }
}
```

### Example curl flow

```bash
# 1) login
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"secret"}' | jq -r .access_token)

# 2) enqueue
JOB_ID=$(curl -s -X POST http://localhost:8000/api/v1/ai/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"type":"EMBED","payload":{"text":"hello matchy"},"idempotencyKey":"embed-demo-001"}' \
  | jq -r .job.id)

# 3) poll
curl -s http://localhost:8000/api/v1/ai/jobs/$JOB_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 8. Internal AI service (Flask)

Public product traffic must **not** hit Flask. Only:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness (Redis ping) |
| `GET` | `/ready` | Readiness (Redis + consumer group) |
| `GET` | `/internal/jobs/:id` | Debug lookup; requires `x-ai-internal-token` |

Entrypoint (`python -m app.entrypoint`) runs:

1. Gunicorn/Flask health server
2. Background worker thread (when `AI_ENABLE_WORKER=true`)

---

## 9. Redis protocol

### Stream message fields

Stream key default: `ai:jobs`  
Consumer group default: `ai-workers`

| Field | Description |
| --- | --- |
| `jobId` | Postgres `AiJob.id` |
| `type` | Job type enum string |
| `userId` | Owning user (may be empty) |
| `payload` | JSON string |
| `enqueuedAt` | ISO timestamp |

### Cache keys

Pattern: `ai:cache:{TYPE}:{sha256(payload)[0:32]}`  
TTL: `AI_CACHE_TTL_SECONDS` (default `300`)

Used only for deterministic / repeatable jobs (`EMBED`, `MATCH`).

---

## 10. Environment variables

| Variable | Used by | Required | Default |
| --- | --- | --- | --- |
| `REDIS_URL` | api, ai | yes for jobs | — |
| `DATABASE_URL` | api, ai | yes | — |
| `AI_STREAM_KEY` | api, ai | no | `ai:jobs` |
| `AI_CONSUMER_GROUP` | api, ai | no | `ai-workers` |
| `AI_CACHE_TTL_SECONDS` | api | no | `300` |
| `AI_SERVICE_HOST` | ai | no | `0.0.0.0` |
| `AI_SERVICE_PORT` | ai | no | `5000` |
| `AI_ENABLE_WORKER` | ai | no | `true` |
| `AI_WORKER_CONCURRENCY` | ai | no | `1` |
| `AI_INTERNAL_TOKEN` | ai | staging/prod | — |
| `AI_DATABASE_URL` | compose ai | local helper | host.docker.internal DSN |

Templates:

- `.env.example` → development
- `.env.staging.example` → staging
- `.env.production.example` → production

---

## 11. Local development

### Prerequisites

- Node 22 + pnpm 10
- Docker (for Redis + AI)
- PostgreSQL (compose profile or existing container)

### Boot sequence

```bash
cp .env.example .env.development
pnpm install

# Redis + Flask AI worker
pnpm infra:up
# equivalent: docker compose -f compose.dev.yaml up -d redis ai

# Optional Postgres via compose
docker compose -f compose.dev.yaml --profile db up -d postgres

pnpm db:generate
pnpm --filter @saas-boilerplate/database db:migrate:dev
# or: pnpm db:push

pnpm dev
```

### Verify

| Check | URL / command |
| --- | --- |
| API health | `http://localhost:8000/api/v1/health` → `redis: "up"` |
| AI health | `http://localhost:5000/health` |
| Compose logs | `pnpm infra:logs` |
| Stop infra | `pnpm infra:down` |

### Run AI worker outside Docker

```bash
cd apps/ai
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
export REDIS_URL=redis://localhost:6379/0
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_db?schema=public
python -m app.entrypoint
```

### Useful root scripts

| Script | Action |
| --- | --- |
| `pnpm infra:up` | Start Redis + AI |
| `pnpm infra:down` | Stop infra |
| `pnpm infra:logs` | Tail Redis + AI logs |

---

## 12. Staging & production (Kubernetes)

Local Compose is **not** used in staging/production. Deployment follows the existing stack:

**GitHub Actions → GHCR images → ArgoCD → Kubernetes**

### Manifests

| Resource | Path | Exposure |
| --- | --- | --- |
| Redis | `deploy/k8s/base/redis/` | ClusterIP only |
| AI worker | `deploy/k8s/base/ai/` | ClusterIP only |
| API / App | existing manifests | Ingress |

Overlays set image tags:

- staging → `ghcr.io/khalil-bchir/saas-boilerplate-ai:staging`
- production → `...:production`

### Secrets

```bash
./deploy/scripts/bootstrap-secrets.sh saas-staging .env.staging
./deploy/scripts/bootstrap-secrets.sh saas-production .env.production
```

Creates:

- `saas-api-env` (includes `REDIS_URL`, stream config)
- `saas-ai-env` (DB + Redis + worker config)
- `saas-app-env`

### In-cluster Redis URLs

| Env | Example `REDIS_URL` |
| --- | --- |
| Staging | `redis://saas-redis.saas-staging.svc.cluster.local:6379/0` |
| Production | `redis://saas-redis.saas-production.svc.cluster.local:6379/0` |

### Production recommendations

1. Staging can keep in-cluster Redis.
2. Production should prefer **managed Redis** when HA matters; only change `REDIS_URL`.
3. Scale `saas-ai` replicas independently of `saas-api`.
4. Keep AI/Redis off Ingress forever.
5. Rotate `AI_INTERNAL_TOKEN` per environment.

### Image build

```bash
docker build -t ghcr.io/khalil-bchir/saas-boilerplate-ai:staging \
  -f apps/ai/Dockerfile apps/ai
```

CI template (`.github/workflows/ci.yml.disabled`) already includes the AI image publish step.

---

## 13. Contracts package

`@saas-boilerplate/ai-contracts` is the shared **library** (not a runtime service).

Use it from Fastify:

```ts
import {
  AI_JOB_TYPES,
  AI_STREAM_KEY_DEFAULT,
  type CreateAiJobRequest,
} from '@saas-boilerplate/ai-contracts';
```

JSON Schema source files live in `packages/ai-contracts/schemas/`.

Rule of thumb:

- shared shapes → `packages/ai-contracts`
- deployable Python runtime → `apps/ai`
- never put Flask inside `packages/`

---

## 14. Extending for Matchy

When migrating Matchy AI into this boilerplate:

| Old Matchy piece | New home |
| --- | --- |
| `identity_ai_service` | `apps/ai/app/processors/verify_identity.py` |
| Video analyze proxy | enqueue `ANALYZE_VIDEO`, process in Flask |
| Ollama embeddings in Node | `EMBED` processor in Flask |
| Matching / rerank service | `MATCH` processor in Flask |
| Frontend AI score UI | keep UX; poll job results from Fastify |

Do **not** call Flask from Next.js.  
Do **not** put model dependencies in the Fastify image.

---

## 15. Testing

### API (Vitest)

```bash
pnpm --filter @saas-boilerplate/api test
```

Includes:

- `ai-jobs.test.ts` — enqueue / idempotency / Redis-missing `503`
- health check reports `redis: "disabled"` when `REDIS_URL` unset

### AI processors (pytest)

```bash
cd apps/ai
pip install -r requirements-dev.txt
pytest -q
```

### Contracts

```bash
pnpm --filter @saas-boilerplate/ai-contracts test
```

---

## 16. Observability & ops checklist

| Check | Expected |
| --- | --- |
| `GET /api/v1/health` | `status: ok`, `redis: up` |
| `GET http://ai:5000/health` | `status: ok`, `redis: true` |
| Stuck `RUNNING` jobs | worker crash → idle reclaim via `XAUTOCLAIM` |
| Many `FAILED` jobs | inspect `AiJob.error`, processor logs |
| `503 AI_QUEUE_UNAVAILABLE` | Redis down or `REDIS_URL` missing |
| Scale AI | increase `saas-ai` replicas / `AI_WORKER_CONCURRENCY` |

Logging:

- Fastify: standard pino logs on enqueue failures
- Flask: stdout worker logs (`Processing job id=...`)

---

## 17. Security model

| Control | Implementation |
| --- | --- |
| Browser never reaches Flask | ClusterIP + no Ingress route |
| Job APIs require JWT | `autohooks.ts` → `verifyToken` |
| Users only see own jobs | `getJobForUser` / `listJobsForUser` |
| Internal AI debug route | `x-ai-internal-token` |
| Secrets | K8s secrets via bootstrap script |
| Rate limits | shared across API replicas when Redis is up |

---

## 18. FAQ

**Q: Do we need Redis on day one?**  
Yes for this Option C integration. Queue transport is Redis Streams.

**Q: Is Postgres enough as a queue?**  
Possible, but this integration standardized on Redis for delivery + reclaim + cache.

**Q: Why not put AI in `packages/` like database?**  
`packages/database` is an importable Node library. Flask is a separate runtime/process.

**Q: Why Flask instead of FastAPI?**  
Product preference and sync inference workloads; Gunicorn + worker thread fits Option C.

**Q: Can Fastify call Flask synchronously as a fallback?**  
Not in this design. Keep sync out of the hot path; use jobs.

**Q: Where do I change stream names?**  
Set `AI_STREAM_KEY` / `AI_CONSUMER_GROUP` in env for **both** api and ai.

---

## 19. Quick reference

```bash
# local infra
pnpm infra:up

# migrate AiJob table
pnpm --filter @saas-boilerplate/database db:migrate:dev

# run app stack
pnpm dev

# enqueue (after login)
curl -X POST http://localhost:8000/api/v1/ai/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EMBED","payload":{"text":"hello"}}'
```

For high-level system diagrams, see [Architecture Overview](../architecture/overview.md).
