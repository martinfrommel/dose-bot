# Roadmap

This file is the source of truth for high-level work tracking.

- Top-level items under **Features**, **DX**, and **Potential** are synced to Gitea issues via `scripts/gitea-roadmap-sync.mjs`.
- Use `- [x]` when an item is complete (the sync script won’t auto-close issues; close via commit keywords like `Closes #123`).

## Features

- [x] Authentication and roles (Cedar dbAuth + role checks)
- [x] Add bulk delete actions for API keys, doses, and substances (with confirmation)
- [x] Add per-substance charts (analytics)
- [x] Add substance slug routing (human-friendly URLs)
- [x] Add theme switching (persisted)
- [x] Group doses list by day
- [x] Add canonical unit field on substance (default unit groundwork)
- [ ] Add “scheduled doses” (recurring plan) and quick “taken” logging
- [ ] Add safe unit conversions (e.g. mg ⇄ g)
- [ ] Add personal dashboard (last 7/30 days) with streak + totals
- [ ] Add audit log entries for sensitive actions (API keys, auth changes)

## DX

- [x] Release `0.7.0` (lint/type-check/tests) and push tag
- [x] Add Gitea Actions CI workflow (lint/type-check/tests)
- [x] Add tag-based deploy workflow (Coolify webhooks)
- [x] Build and push Docker image on release tags
- [x] Add Husky git hooks (pre-commit/pre-push)
- [x] Add contributing guidelines and development instructions
- [x] Demo reset automation for the demo deployment (handled by Coolify cron)
- [ ] Set up a Gitea Actions runner (act_runner) for CI
- [ ] Add Coolify webhook secrets in Gitea (`COOLIFY_WEBHOOK_DEMO`, `COOLIFY_WEBHOOK_PRIVATE`)
- [ ] Verify tag-based deploy workflow triggers Coolify on release tags
- [ ] Fix deploy and release-docker scripts
- [ ] Add automated release notes / changelog process
- [ ] Document backup/restore procedure for the production database
- [ ] Add a Cedar Cell for the main dashboard to reuse across pages

## Potential

- [ ] [Feature] Add export/import for doses (CSV/JSON) for backups and portability
- [ ] [Feature] Add reminders/notifications for scheduled doses (email/push)
- [ ] [Feature] Add “stack builder”: define a protocol with substances + timing
- [ ] [Feature] Add analytics improvements: rolling averages
