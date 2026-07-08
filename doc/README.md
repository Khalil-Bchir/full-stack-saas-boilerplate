# Documentation

Central documentation for the **Full Stack SaaS Boilerplate** monorepo.

## Start here

| Document | Description |
| --- | --- |
| [Getting Started (A–Z)](./setup/getting-started.md) | Clone, install, configure, and run the entire stack |
| [Environments & NODE_ENV](./setup/environments-and-node-env.md) | How env files, NODE_ENV, and per-environment commands work |
| [Environment Variables](./setup/environment-variables.md) | All env vars explained per environment |
| [Database Setup](./setup/database.md) | PostgreSQL, Prisma, migrations, and seeding |
| [Development Workflow](./setup/development.md) | Daily dev commands, Turbo, and debugging |
| [Deployment](./setup/deployment.md) | Build, Docker, and CI/CD |

## Feature guides

| Document | Description |
| --- | --- |
| [Authentication](./features/authentication.md) | JWT auth flow across API and Next.js app |
| [Monorepo Workflow](./features/monorepo-workflow.md) | Turborepo, pnpm workspaces, and package boundaries |
| [UI System](./features/ui-system.md) | shadcn/ui, Tailwind v4, theming, and styling |
| [API Architecture](./features/api-architecture.md) | Fastify plugins, routes, and validation |
| [Database Layer](./features/database-layer.md) | Prisma schema, shared types, and client usage |

## Architecture

| Document | Description |
| --- | --- |
| [Overview](./architecture/overview.md) | High-level system diagram and data flow |

## Package documentation

Each workspace has its own README with package-specific details:

| Package | Path | README |
| --- | --- | --- |
| Root monorepo | `/` | [README.md](../README.md) |
| Next.js app | `apps/app` | [apps/app/README.md](../apps/app/README.md) |
| Fastify API | `apps/api` | [apps/api/README.md](../apps/api/README.md) |
| Database | `packages/database` | [packages/database/README.md](../packages/database/README.md) |
| Shared types | `packages/types` | [packages/types/README.md](../packages/types/README.md) |
| UI components | `packages/ui` | [packages/ui/README.md](../packages/ui/README.md) |
| ESLint config | `packages/eslint-config` | [packages/eslint-config/README.md](../packages/eslint-config/README.md) |
| Prettier config | `packages/prettier-config` | [packages/prettier-config/README.md](../packages/prettier-config/README.md) |
| TypeScript config | `packages/typescript-config` | [packages/typescript-config/README.md](../packages/typescript-config/README.md) |
