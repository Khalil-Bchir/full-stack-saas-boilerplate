# @saas-boilerplate/database

Prisma 7 database layer — schema, migrations, client, and seeding.

## Data flow

```mermaid
flowchart LR
    Schema[schema.prisma] -->|generate| Types[packages/types]
    Schema --> Migrations[migrations/]
    Client[client.ts] --> Types
    Client --> PG[(PostgreSQL)]
    API[apps/api] --> Client
    Seed[seed/] --> Client
    AI[apps/ai worker] -->|SQL status updates| PG
```

`AiJob` rows are created by Fastify and updated by the Flask worker. See [AI Async Jobs](../../doc/features/ai-async-jobs.md).

## Overview

| Item | Value |
| --- | --- |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Driver | `@prisma/adapter-pg` + `pg` |
| Generated types | Output to `@saas-boilerplate/types` |

## Directory structure

```
prisma/
  schema.prisma         Model definitions
  migrations/           Migration SQL files
prisma.config.ts        Prisma 7 CLI config
src/
  client.ts             Singleton PrismaClient
  index.ts              Package exports
  seed/
    index.ts            Seed orchestrator
    development.ts      Dev seed data
    staging.ts          Staging seed data
    production.ts       Production seed data
```

## Usage

```ts
import { prisma } from '@saas-boilerplate/database';

const users = await prisma.user.findMany();
```

Types:

```ts
import { User, Prisma } from '@saas-boilerplate/types';
```

## Scripts

| Script | Description |
| --- | --- |
| `pnpm db:generate` | Generate Prisma client → `packages/types` |
| `pnpm db:push` | Push schema to DB (dev) |
| `pnpm db:migrate:dev` | Create + apply migration |
| `pnpm db:migrate:prod` | Apply migrations (production) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed:dev` | Seed development data |
| `pnpm db:setup` | Migrate + seed (dev) |
| `pnpm db:reset:dev` | Reset DB (destructive) |
| `pnpm build` | Compile TypeScript |

Root shortcuts: `pnpm db:push`, `pnpm db:generate`, `pnpm db:studio`.

## Schema

Current models defined in `prisma/schema.prisma`. Generated client outputs to:

```
packages/types/src/generated/prisma/
```

## Environment

All scripts load `DATABASE_URL` from the env file matching the command (see [Environments & NODE_ENV](../../doc/setup/environments-and-node-env.md)).

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_db?schema=public
```

## Workflow

1. Edit `prisma/schema.prisma`
2. `pnpm db:generate`
3. `pnpm db:push` (dev) or `pnpm db:migrate:dev` (with migration file)
4. Rebuild: `pnpm build`

See [Database Setup](../../doc/setup/database.md).

## Related docs

- [Database Layer](../../doc/features/database-layer.md)
- [Environment Variables](../../doc/setup/environment-variables.md)
