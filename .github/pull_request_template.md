## Summary

<!-- What does this PR change, and why? -->

## Ticket / task

<!-- Link the Jira / Linear / GitHub issue (required when one exists). -->

- Ticket:

## Target branch check

Confirm this PR targets the correct branch:

- [ ] `feature/*` or `fix/*` → **`dev`**
- [ ] `dev` → **`staging`** (promotion for QA)
- [ ] `staging` → **`main`** (production promotion)

## Checklist

- [ ] I have tested this locally (`pnpm lint`, `pnpm test`, and relevant manual checks)
- [ ] CI is green (or I understand why it is not and called it out above)
- [ ] This PR only contains changes related to the ticket / summary
- [ ] I have requested at least one reviewer

## Social contract — do not self-merge

**Do not merge your own pull request.**

A teammate must review and merge. Authors may rebase, push fixes, and respond to review comments, but merging is reserved for a reviewer (or an agreed release owner for `dev` → `staging` / `staging` → `main` promotions).
