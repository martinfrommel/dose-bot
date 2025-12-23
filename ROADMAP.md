# Roadmap

This file is the source of truth for high-level work tracking.

- Top-level items under **Next** and **Later** are synced to Gitea issues via `scripts/gitea-roadmap-sync.mjs`.
- Items under **Potential** are intentionally not synced (idea parking lot).
- Use `- [x]` when an item is complete (the sync script won’t auto-close issues; close via commit keywords like `Closes #123`).

## Features

- [x] Authentication and roles (Cedar dbAuth + role checks)
- [ ] Add “scheduled doses” (recurring plan) and quick “taken” logging
- [ ] Add per-substance default unit + safe unit conversions (e.g. mg ⇄ g)
- [ ] Add personal dashboard (last 7/30 days) with streak + totals
- [ ] Add audit log entries for sensitive actions (API keys, auth changes)

## DX

- [x] Release `0.7.0` (lint/type-check/tests) and push tag
- [x] Add Gitea Actions CI workflow (lint/type-check/tests)
- [x] Add tag-based deploy workflow (Coolify webhooks)
- [x] Demo reset automation for the demo deployment (handled by Coolify cron)
- [ ] Set up a Gitea Actions runner (act_runner) for CI
- [ ] Add Coolify webhook secrets in Gitea (`COOLIFY_WEBHOOK_DEMO`, `COOLIFY_WEBHOOK_PRIVATE`)
- [ ] Verify tag-based deploy workflow triggers Coolify on release tags
- [ ] Add automated release notes / changelog process
- [ ] Document backup/restore procedure for the production database
- [ ] Add a Cedar Cell for the main dashboard to reuse across pages

## Potential

- [ ] [Feature] Add export/import for doses (CSV/JSON) for backups and portability
- [ ] [Feature] Add reminders/notifications for scheduled doses (email/push)
- [ ] [Feature] Add “stack builder”: define a protocol with substances + timing
- [ ] [Feature] Add analytics improvements: rolling averages, per-substance charts
