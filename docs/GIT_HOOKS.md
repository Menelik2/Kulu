# Git hooks (KULU)

Hooks live in **`.githooks/`** and are activated with:

```bash
npm run hooks:install
# or
bash scripts/setup-git-hooks.sh
```

This sets `git config core.hooksPath .githooks` for **this clone only**.

## What runs

| Hook | When | Checks |
|------|------|--------|
| **pre-commit** | `git commit` | Blocks `.env` files and high-confidence secrets in the diff; runs `npm run typecheck` if any `.ts` / `.tsx` is staged |
| **commit-msg** | `git commit` | Subject required (8–100 chars); soft Conventional Commits tip |
| **pre-push** | `git push` | `npm run typecheck` |

## Skip once (emergency only)

```bash
git commit --no-verify -m "…"
git push --no-verify
```

Prefer fixing the failure over skipping.

## Disable

```bash
git config --unset core.hooksPath
```

## Note for CI / GitHub web UI

Hooks run only on **local** machines after `hooks:install`. Vercel and GitHub Actions still need their own checks.
