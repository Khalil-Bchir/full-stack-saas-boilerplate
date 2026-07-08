# Architecture Overview

High-level system design of the Full Stack SaaS Boilerplate.

## System diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTPS
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    @saas-boilerplate/app                         │
│                    Next.js 16 (App Router)                       │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ proxy.ts   │  │ Redux Auth   │  │ @saas-boilerplate/ui   │  │
│  │ (routing)  │  │ (client)     │  │ (shadcn components)    │  │
│  └────────────┘  └──────────────┘  └────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────┘
                               │ REST (axios)
                               │ NEXT_PUBLIC_API_URL
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    @saas-boilerplate/api                         │
│                    Fastify 5                                   │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Plugins    │  │ Services     │  │ JSON Schema Validation │  │
│  │ (auth,cors)│  │ (auth,users) │  │ (AJV)                  │  │
│  └────────────┘  └──────────────┘  └────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────┘
                               │ Prisma Client
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    @saas-boilerplate/database                    │
│                    Prisma 7 + @prisma/adapter-pg               │
└──────────────────────────────┬───────────────────────────────────┘
                               │ SQL
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PostgreSQL                                    │
└──────────────────────────────────────────────────────────────────┘
```

## Shared packages

```
@saas-boilerplate/types ◀── prisma generate ── schema.prisma
@saas-boilerplate/ui    ◀── used by app (components, utils, hooks)
@saas-boilerplate/eslint-config, prettier-config, typescript-config
```

## Request lifecycle (authenticated)

1. User visits `/projects`
2. `proxy.ts` checks `access_token` cookie → allows through
3. Dashboard layout renders with sidebar (Redux provides user data)
4. Component calls API via `lib/api.ts` axios instance
5. API `verifyToken` validates JWT → attaches `loggedUser`
6. Service queries database via Prisma → returns data
7. Frontend renders response

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

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │     │  VM/Docker  │     │  PostgreSQL │
│  (Next.js)  │────▶│  (Fastify)  │────▶│  (managed)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

See [Deployment](../setup/deployment.md) for details.

## Extension points

| Feature | Where to extend |
| --- | --- |
| New pages | `apps/app/src/app/` |
| New API endpoints | `apps/api/src/routes/v1/` |
| New DB models | `packages/database/prisma/schema.prisma` |
| New UI components | `pnpm dlx shadcn add` from `apps/app` |
| New shared types | Auto-generated from Prisma schema |
| Admin features | `apps/api/src/routes/v1/admin/` |
