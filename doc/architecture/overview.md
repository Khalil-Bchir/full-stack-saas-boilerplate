# Architecture Overview

High-level system design of the Full Stack SaaS Boilerplate.

## System diagram

```mermaid
flowchart TB
    Browser[Client Browser]

    subgraph App["@saas-boilerplate/app — Next.js 16"]
        Proxy[proxy.ts]
        Redux[Redux Auth]
        UIComp["@saas-boilerplate/ui"]
    end

    subgraph API["@saas-boilerplate/api — Fastify 5"]
        Plugins[Plugins auth cors redis]
        Services[Services auth users ai-jobs]
        AJV[JSON Schema AJV]
    end

    subgraph AI["@saas-boilerplate/ai — Flask"]
        Worker[Redis Streams worker]
        Processors[Inference processors]
    end

    subgraph Data["@saas-boilerplate/database"]
        Prisma[Prisma 7 + pg adapter]
    end

    PG[(PostgreSQL)]
    Redis[(Redis)]

    Browser -->|HTTPS| App
    App -->|REST axios| API
    Proxy --> Redux
    App --> UIComp
    API --> Plugins
    Plugins --> Services
    Services --> AJV
    Services --> Prisma
    Prisma --> PG
    API -->|XADD ai:jobs| Redis
    Worker -->|XREADGROUP| Redis
    Worker --> Processors
    Worker --> PG
    API -->|optional cache| Redis
```

## Shared packages

```mermaid
flowchart LR
    Schema[schema.prisma] -->|prisma generate| Types["@saas-boilerplate/types"]
    Types --> Database["@saas-boilerplate/database"]
    Types --> API["@saas-boilerplate/api"]
    Contracts["@saas-boilerplate/ai-contracts"] --> API
    Contracts --> AI["@saas-boilerplate/ai"]
    UI["@saas-boilerplate/ui"] --> App["@saas-boilerplate/app"]
    Config["eslint / prettier / ts configs"] --> All[All workspaces]
```

## Request lifecycle (authenticated product API)

```mermaid
sequenceDiagram
    actor User
    participant App as Next.js App
    participant Proxy as proxy.ts
    participant API as Fastify API
    participant DB as PostgreSQL

    User->>App: Visit /projects
    App->>Proxy: Check access_token cookie
    Proxy-->>App: Allow
    App->>API: GET /api/v1/... (Bearer JWT)
    API->>API: verifyToken
    API->>DB: Prisma query
    DB-->>API: Data
    API-->>App: JSON response
    App-->>User: Render dashboard
```

## Request lifecycle (async AI job — Option C)

```mermaid
sequenceDiagram
    actor User
    participant App as Next.js App
    participant API as Fastify API
    participant DB as PostgreSQL
    participant Redis as Redis Streams
    participant AI as Flask worker

    User->>App: Request AI action
    App->>API: POST /api/v1/ai/jobs (JWT)
    API->>DB: INSERT AiJob QUEUED
    API->>Redis: XADD ai:jobs
    API-->>App: 202 job.id
    AI->>Redis: XREADGROUP
    AI->>DB: status RUNNING
    AI->>AI: run processor
    AI->>DB: status SUCCEEDED + result
    App->>API: GET /api/v1/ai/jobs/:id
    API->>DB: SELECT AiJob
    API-->>App: job + result
```

## Technology choices

| Concern | Choice | Why |
| --- | --- | --- |
| Monorepo | Turborepo + pnpm | Fast builds, shared packages |
| Frontend | Next.js 16 App Router | RSC, Turbopack, production-ready |
| API | Fastify 5 | Performance, plugin ecosystem |
| AI worker | Flask + Gunicorn | Python inference, async jobs |
| Queue / cache | Redis 7 Streams | Job delivery + optional result cache |
| ORM | Prisma 7 | Type-safe queries, migrations |
| UI | shadcn/ui | Own the code, Radix accessibility |
| Auth | JWT + cookie proxy | Simple, extensible |
| Styling | Tailwind v4 | Utility-first, CSS variables |

## Deployment topology

```mermaid
flowchart TB
    Dev[Developer] -->|git push| GH[GitHub]
    GH -->|trigger| GHA[GitHub Actions CI]
    GHA -->|lint test build| GHA
    GHA -->|push images| GHCR[GHCR Container Registry]

    GH -->|GitOps sync| Argo[ArgoCD]
    Argo -->|apply manifests| K8s[Kubernetes]

    GHCR -->|pull images| K8s
    K8s --> AppPod[saas-app Pod]
    K8s --> APIPod[saas-api Pod]
    K8s --> AIPod[saas-ai Pod]
    K8s --> RedisPod[saas-redis Pod]
    K8s --> MigrateJob[Migration Job]
    APIPod --> PG[(PostgreSQL)]
    APIPod --> RedisPod
    AIPod --> RedisPod
    AIPod --> PG
    Ingress[NGINX Ingress] --> AppPod
    Ingress --> APIPod
    Users[Users] --> Ingress
```

| Environment | Frontend | API |
| --- | --- | --- |
| Staging | `staging.saas-boilerplate.io` | `api.staging.saas-boilerplate.io` |
| Production | `app.saas-boilerplate.io` | `api.saas-boilerplate.io` |

| Image | Role |
| --- | --- |
| `ghcr.io/khalil-bchir/saas-boilerplate-api` | Fastify product API |
| `ghcr.io/khalil-bchir/saas-boilerplate-app` | Next.js frontend |
| `ghcr.io/khalil-bchir/saas-boilerplate-ai` | Flask AI worker |
| `redis:7.4-alpine` | In-cluster Redis (not built by CI) |

AI and Redis are ClusterIP-only (not on Ingress). See [Deployment](../setup/deployment.md), [AI Async Jobs](../features/ai-async-jobs.md), and [deploy/README.md](../../deploy/README.md).

## Extension points

| Feature | Where to extend |
| --- | --- |
| New pages | `apps/app/src/app/` |
| New API endpoints | `apps/api/src/routes/v1/` |
| New DB models | `packages/database/prisma/schema.prisma` |
| New UI components | `pnpm dlx shadcn add` from `apps/app` |
| New shared types | Auto-generated from Prisma schema |
| Admin features | `apps/api/src/routes/v1/admin/` |
| AI job contracts | `packages/ai-contracts` |
| AI processors | `apps/ai/app/processors/` |
| AI enqueue / poll API | `apps/api/src/routes/v1/ai/` |
