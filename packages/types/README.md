# @saas-boilerplate/types

Shared TypeScript types generated from the Prisma schema.

## Overview

This package re-exports the Prisma-generated client so all workspaces import types from one place:

```ts
import { User, PrismaClient, Prisma } from '@saas-boilerplate/types';
```

## Generated output

Prisma generates into:

```
src/generated/prisma/
  client.ts
  models/
  enums.ts
  ...
```

Configured in `packages/database/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../../types/src/generated/prisma"
}
```

## Build

```bash
pnpm db:generate    # Regenerate from schema (root command)
pnpm build          # Compile TypeScript to dist/
```

Turbo runs `db:generate` before `types#build` automatically.

## Usage in workspaces

| Consumer | Import |
| --- | --- |
| API | `import { User, PrismaClient } from '@saas-boilerplate/types'` |
| Database | `import { PrismaClient } from '@saas-boilerplate/types'` |
| App | Types only (no direct DB access) |

## Adding new types

1. Add model to `packages/database/prisma/schema.prisma`
2. Run `pnpm db:generate`
3. Types appear automatically — no manual exports needed

For non-Prisma shared types, add files under `src/` and export from `src/index.ts`.

## Related docs

- [Database Layer](../../doc/features/database-layer.md)
- [Database Setup](../../doc/setup/database.md)
