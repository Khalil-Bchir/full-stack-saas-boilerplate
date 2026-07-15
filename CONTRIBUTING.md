# Contributing

This is a **free private** GitHub repo, so we cannot rely on branch protection rules. We keep the code safe with a clear social contract and local verification.

**Full walkthrough (diagrams, promotions, GitHub UI tips):** [doc/setup/pr-and-merge-flow.md](./doc/setup/pr-and-merge-flow.md).

## Branch flow

```text
feature/* or fix/*  →  dev  →  staging  →  main
                         ↑         ↑         ↑
                      daily work   QA     production
```

| Branch | Purpose |
| --- | --- |
| `feature/*`, `fix/*` | Your work in progress |
| `dev` | Integration branch for the team |
| `staging` | Pre-production / QA environment |
| `main` | Production |

## Social contract

1. **Never push directly** to `dev`, `staging`, or `main`. Always open a PR.
2. **Never merge your own PR.** Request a review; a teammate merges after approval.
3. **Work branches** start from the latest `dev`.
4. **Only promotion PRs** go up the chain: `dev` → `staging`, then `staging` → `main`.
5. Verify locally (`pnpm lint`, `pnpm test`) before asking for a merge. (CI is temporarily disabled.)

## Day-to-day steps

### 1. Start from `dev`

```bash
git checkout dev
git pull origin dev
git checkout -b feature/short-description
# or: git checkout -b fix/short-description
```

### 2. Develop and verify locally

```bash
pnpm install
pnpm lint
pnpm test
# optional: pnpm format
```

Commit with the project convention (`pnpm commit` / conventional commits).

### 3. Open a PR into `dev`

1. Push your branch and open a PR **targeting `dev`**.
2. Fill in the PR template (summary, ticket link, checklist).
3. Request at least one reviewer.
4. Address review comments; push more commits as needed.
5. **Let the reviewer merge** when CI is green and the review is approved.

### 4. Promote to staging

When `dev` is ready for QA:

1. Open a PR: **`dev` → `staging`**.
2. Get a review / release-owner sign-off.
3. Reviewer merges (not the author alone, when possible).
4. Verify the staging environment.

### 5. Promote to production

When staging is verified:

1. Open a PR: **`staging` → `main`**.
2. Get explicit approval from a release owner.
3. Reviewer merges.
4. Confirm production looks healthy.

## CI (temporarily disabled)

GitHub Actions is turned off for now (workflow file kept as `.github/workflows/ci.yml.disabled`). Rely on local checks and the PR template social contract until we re-enable it.

## Quick do / don’t

| Do | Don’t |
| --- | --- |
| Branch from `dev` | Commit straight to `dev` / `staging` / `main` |
| PR into `dev` for features/fixes | Open feature PRs straight to `main` |
| Get a teammate to merge | Click **Merge** on your own PR |
| Link the ticket in the PR | Leave the template blank |
| Run lint/tests locally before review | Skip local verification because CI is off |

## Need setup help?

See [Getting Started](./doc/setup/getting-started.md) and [Development Workflow](./doc/setup/development.md).
