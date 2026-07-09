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
        Plugins[Plugins auth cors]
        Services[Services auth users]
        AJV[JSON Schema AJV]
    end

    subgraph Data["@saas-boilerplate/database"]
        Prisma[Prisma 7 + pg adapter]
    end

    PG[(PostgreSQL)]

    Browser -->|HTTPS| App
    App -->|REST axios| API
    Proxy --> Redux
    App --> UIComp
    API --> Plugins
    Plugins --> Services
    Services --> AJV
    Services --> Prisma
    Prisma --> PG
```

## Shared packages

```mermaid
flowchart LR
    Schema[schema.prisma] -->|prisma generate| Types["@saas-boilerplate/types"]
    Types --> Database["@saas-boilerplate/database"]
    Types --> API["@saas-boilerplate/api"]
    UI["@saas-boilerplate/ui"] --> App["@saas-boilerplate/app"]
    Config["eslint / prettier / ts configs"] --> All[All workspaces]
```

## Request lifecycle (authenticated)

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

## Technology choices

| Concern | Choice | Why |
| --- | --- | --- |
| Monorepo | Turborepo + pnpm | Fast builds, shared packages |
| Frontend | Next.js 16 App Router | RSC, Turbopack, production-ready |
| API | Fastify 5 | Performance, plugin ecosystem |
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
    K8s --> MigrateJob[Migration Job]
    APIPod --> PG[(PostgreSQL)]
    Ingress[NGINX Ingress] --> AppPod
    Ingress --> APIPod
    Users[Users] --> Ingress
```

| Environment | Frontend | API |
| --- | --- | --- |
| Staging | `staging.saas-boilerplate.io` | `api.staging.saas-boilerplate.io` |
| Production | `app.saas-boilerplate.io` | `api.saas-boilerplate.io` |

Images: `ghcr.io/khalil-bchir/saas-boilerplate-api` and `ghcr.io/khalil-bchir/saas-boilerplate-app`

See [Deployment](../setup/deployment.md) and [deploy/README.md](../../deploy/README.md).

## Extension points

| Feature | Where to extend |
| --- | --- |
| New pages | `apps/app/src/app/` |
| New API endpoints | `apps/api/src/routes/v1/` |
| New DB models | `packages/database/prisma/schema.prisma` |
| New UI components | `pnpm dlx shadcn add` from `apps/app` |
| New shared types | Auto-generated from Prisma schema |
| Admin features | `apps/api/src/routes/v1/admin/` |
