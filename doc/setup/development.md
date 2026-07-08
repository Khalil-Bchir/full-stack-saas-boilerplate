# Development Workflow

Day-to-day commands and conventions for working in the monorepo.

> For env file selection and `NODE_ENV` behavior, see [Environments & NODE_ENV](./environments-and-node-env.md).

## Root scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `pnpm dev` | Start all dev servers (Turbo) |
| `test` | `pnpm test` | Start app + API with staging config |
| `start` | `pnpm start` | Build then start app + API (production) |
| `build` | `pnpm build` | Build all packages |
| `build:api` | `pnpm build:api` | Build API and dependencies |
| `lint` | `pnpm lint` | Lint all workspaces |
| `format` | `pnpm format` | Prettier format entire repo |
| `clean` | `pnpm clean` | Remove node_modules and Turbo cache |
| `db:*` | `pnpm db:push` etc. | Database commands via Turbo |

## Run a single workspace

```bash
# Frontend only
pnpm --filter @saas-boilerplate/app dev

# API only
pnpm --filter @saas-boilerplate/api dev

# Database package watch
pnpm --filter @saas-boilerplate/database dev
```

## Git hooks (Husky)

| Hook | Tool | Purpose |
| --- | --- | --- |
| `pre-commit` | lint-staged | Format/lint staged files |
| `commit-msg` | commitlint | Enforce conventional commits |

Create commits interactively:

```bash
pnpm commit
```

## Conventional commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile page
fix: resolve login redirect loop
docs: update setup guide
chore: bump dependencies
```

## Adding a new API route

1. Create `apps/api/src/routes/v1/<feature>/actions.ts`
2. Add JSON schema in `apps/api/src/schemas/v1/`
3. Add service logic in `apps/api/src/services/`
4. Routes auto-load via `@fastify/autoload` under `/api/v1/<feature>/`

See [API Architecture](../features/api-architecture.md).

## Adding a new app page

1. Create route under `apps/app/src/app/`
2. Compose UI from `@saas-boilerplate/ui` components
3. Put business logic in `apps/app/src/features/<name>/`
4. Protected routes are guarded by `src/proxy.ts` (cookie check)

## Adding a shadcn component

```bash
cd apps/app
pnpm dlx shadcn@latest add dialog checkbox
```

Components install into `packages/ui/src/components/ui/`.

## TypeScript

Shared configs in `packages/typescript-config/`:

| Config | Used by |
| --- | --- |
| `base.json` | All packages |
| `nextjs.json` | Next.js app |
| `node.json` | API, database |
| `react-library.json` | UI package |

## Debugging

### API logs

Development uses `pino-pretty` for readable logs. Set `NODE_ENV=development`.

### Next.js

Use browser DevTools and React DevTools. Server components log in the terminal running `pnpm dev`.

### Database

```bash
pnpm db:studio
```

## IDE setup

Recommended VS Code / Cursor extensions:

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense

Use the workspace TypeScript version (`pnpm exec tsc --version`).
