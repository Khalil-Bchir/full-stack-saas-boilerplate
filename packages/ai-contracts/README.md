# @saas-boilerplate/ai-contracts

Shared contracts for the Option C async AI architecture.

**Full guide:** [doc/features/ai-async-jobs.md](../../doc/features/ai-async-jobs.md)

## What this package is

| Shared here | Not shared here |
| --- | --- |
| Job types & statuses | Flask runtime |
| Stream / cache key names | Model weights |
| Request/response TypeScript types | GPU / inference code |
| JSON schemas under `schemas/` | Deployable services |

Fastify imports TypeScript exports. Flask mirrors the same constants and JSON schemas.

## Usage

```ts
import {
  AI_JOB_TYPES,
  AI_STREAM_KEY_DEFAULT,
  AI_CONSUMER_GROUP_DEFAULT,
  type CreateAiJobRequest,
  type AiJobResponse,
  isAiJobType,
  buildCacheKey,
} from '@saas-boilerplate/ai-contracts';
```

## Scripts

| Script | Description |
| --- | --- |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm test` | Node test runner checks |
| `pnpm clean` | Remove build artifacts |

## Schemas

- `schemas/create-job.request.json` — body for `POST /api/v1/ai/jobs`
