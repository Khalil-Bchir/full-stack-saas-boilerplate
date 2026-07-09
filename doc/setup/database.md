# Database Setup

The boilerplate uses **PostgreSQL** with **Prisma 7** in `@saas-boilerplate/database`. Generated types are exported from `@saas-boilerplate/types`.

## Architecture

```mermaid
flowchart TB
    subgraph DatabasePkg["packages/database"]
        Schema[schema.prisma]
        Migrations[migrations/]
        Config[prisma.config.ts]
        Client[client.ts singleton]
        Seed[seed scripts]
    end

    subgraph TypesPkg["packages/types"]
        Generated[generated/prisma/]
    end

    subgraph Consumers
        API[apps/api]
    end

    PG[(PostgreSQL)]

    Schema -->|prisma generate| Generated
    Schema --> Migrations
    Config --> Client
    Client --> Generated
    Client --> PG
    API -->|fastify.prisma| Client
    Seed --> Client
```

Prisma generates the client **into** `packages/types` so both API and other packages import types from one place:

```ts
import { User, PrismaClient } from '@saas-boilerplate/types';
import { prisma } from '@saas-boilerplate/database';
```

---

## Local PostgreSQL with Docker

```bash
docker run --name saas_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=saas_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Set in `.env.development`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_db?schema=public
```

---

## Commands

Run from the **monorepo root**:

| Command | Description |
| --- | --- |
| `pnpm db:generate` | Regenerate Prisma client into `packages/types` |
| `pnpm db:push` | Push schema to DB (dev prototyping) |
| `pnpm db:studio` | Open Prisma Studio GUI |
| `pnpm db:reset` | Reset database (destructive) |

Run from **`packages/database`** for environment-specific tasks:

| Command | Description |
| --- | --- |
| `pnpm db:migrate:dev` | Create and apply migrations (development) |
| `pnpm db:migrate:staging` | Apply migrations (staging) |
| `pnpm db:migrate:prod` | Apply migrations (production) |
| `pnpm db:seed:dev` | Seed development data |
| `pnpm db:setup` | Migrate + seed (development) |

---

## Schema changes workflow

```mermaid
flowchart TD
    A[Edit schema.prisma] --> B[pnpm db:generate]
    B --> C{Environment}
    C -->|local prototyping| D[pnpm db:push]
    C -->|production-ready| E[db:migrate:dev]
    E --> F[db:migrate:staging/prod]
    D --> G[pnpm build]
    F --> G
```

1. Edit `packages/database/prisma/schema.prisma`
2. Generate client: `pnpm db:generate`
3. Choose one:
   - **Prototyping**: `pnpm db:push` (fast, no migration file)
   - **Production-ready**: `pnpm --filter @saas-boilerplate/database db:migrate:dev`

4. Rebuild affected packages: `pnpm build`

---

## Current models

### User

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | cuid primary key |
| `name` | `String` | Display name |
| `email` | `String` | Unique, indexed |
| `password` | `String` | bcrypt hash |
| `create_at` | `DateTime` | Auto-set on create |
| `updated_at` | `DateTime` | Auto-updated |

---

## Prisma 7 notes

- Config lives in `packages/database/prisma.config.ts` (not in schema)
- Uses `@prisma/adapter-pg` with the `pg` driver for serverless-friendly connections
- `postinstall` runs `db:generate` automatically on `pnpm install`

---

## Troubleshooting

### `db:push` warns about data loss

Prisma detected destructive changes. Review the diff carefully. For local dev:

```bash
pnpm --filter @saas-boilerplate/database db:reset:dev
pnpm db:push
```

### Types out of sync after schema change

```bash
pnpm db:generate
pnpm build --filter=@saas-boilerplate/types
```

### Connection errors

Verify Postgres is running and `DATABASE_URL` matches your Docker container credentials.
