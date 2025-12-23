# Contributing

Thanks for contributing to DoseBot.

## Development

- Requirements: Node.js 24.x, Yarn 4.x (Corepack recommended)
- Install: `yarn install`
- Run dev servers: `yarn cedar dev`

## Quality Gates (local)

- Lint: `yarn cedar lint`
- Type-check: `yarn cedar type-check`
- Tests (CI mode): `yarn cedar test --watch=false`
- Build: `yarn cedar build`

## Git Hooks (Husky)

This repo uses Husky to enforce basic quality gates:

- `pre-commit`: runs `yarn cedar test --watch=false`
- `pre-push`: runs `yarn cedar build`
- `post-commit`: best-effort roadmap sync (see below)

If you need to bypass hooks temporarily (e.g. during emergency debugging), you can set `HUSKY=0` for that command.

## Issue Closure Conventions

Use commit message keywords so Gitea can automatically close issues when changes land:

- Prefer: `Fixes: #123`
- Also supported: `Closes #123`

Tip: Put the trailer near the end of the commit message.

## Roadmap ↔ Issues Sync

The roadmap lives in [ROADMAP.md](ROADMAP.md). It is the source of truth for high-level work items.

- Top-level unchecked checklist items (`- [ ] ...`) are synced to Gitea issues.
- Checked items (`- [x] ...`) are treated as already done.

Run the sync:

- Dry run: `yarn roadmap:sync:dry --roadmap ROADMAP.md`
- Create/reopen issues: `yarn roadmap:sync -- --repo https://your.gitea.host/owner/repo`
- Also close roadmap-managed issues for checked items: `yarn roadmap:sync -- --repo https://your.gitea.host/owner/repo --close-done`

Authentication:

- Provide `GITEA_TOKEN` (env var or in `.env`) and `GITEA_REPO_URL` / `--repo`.

Notes:

- `post-commit` runs `yarn roadmap:sync -- --close-done` as a convenience when `GITEA_TOKEN` is available.
- Gitea has no built-in `post-push` git hook; syncing after commit is a best-effort local workflow.
