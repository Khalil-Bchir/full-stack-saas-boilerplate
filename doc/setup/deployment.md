# Deployment

Guide for building and deploying the boilerplate to staging and production.

## Build artifacts

| Package | Output | Command |
| --- | --- | --- |
| `@saas-boilerplate/app` | `.next/` | `pnpm build --filter=@saas-boilerplate/app` |
| `@saas-boilerplate/api` | `apps/api/dist/` | `pnpm build:api` |
| `@saas-boilerplate/database` | `packages/database/dist/` | `pnpm build --filter=@saas-boilerplate/database` |
| `@saas-boilerplate/types` | `packages/types/dist/` | `pnpm build --filter=@saas-boilerplate/types` |

Full monorepo build:

```bash
pnpm build
```

---

## Next.js app

### Environment

Set production env before building:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

The app build script loads `../../.env` + `../../.env.production`.

### Vercel (recommended for frontend)

1. Connect the repo to Vercel
2. Set **Root Directory** to `apps/app`
3. Set **Build Command**: `cd ../.. && pnpm build --filter=@saas-boilerplate/app`
4. Add environment variables in the Vercel dashboard
5. Deploy

### Self-hosted

```bash
pnpm build --filter=@saas-boilerplate/app
pnpm --filter @saas-boilerplate/app start
```

Runs on port 3000 by default.

---

## Fastify API

### Docker

A Dockerfile exists at `apps/api/Dockerfile`:

```bash
docker build -t saas-api -f apps/api/Dockerfile .
docker run -p 8000:8000 --env-file .env.production saas-api
```

### Production start

```bash
pnpm build:api
pnpm --filter @saas-boilerplate/api start
```

Requires compiled `dist/index.js` and `.env.production`.

### Database migrations on deploy

```bash
pnpm --filter @saas-boilerplate/database db:migrate:prod
```

Run this **before** or as part of your deploy pipeline.

---

## CI/CD

GitHub Actions workflow: `.github/workflows/ci-cd.yml`

Current pipeline (staging branch):

1. Build and push API Docker image
2. SSH deploy to VM
3. Run `prisma migrate deploy`

Required GitHub secrets:

| Secret | Purpose |
| --- | --- |
| `DOCKER_REGISTRY_USER` | Docker Hub username |
| `DOCKER_REGISTRY_PASS` | Docker Hub password |
| `TEST_KEY` | SSH private key |
| `VM_SSH_USER` | Deploy target user |
| `TEST_VM_IP` | Deploy target IP |

Customize the workflow for your hosting provider.

---

## Pre-deploy checklist

- [ ] `ACCESS_TOKEN_SECRET` is a strong unique value
- [ ] `COOKIE_SECRET` is set
- [ ] `DATABASE_URL` points to production database
- [ ] `NEXT_PUBLIC_API_URL` points to production API
- [ ] Migrations applied (`db:migrate:prod`)
- [ ] CORS configured for production frontend origin
- [ ] HTTPS enabled on API and app domains
