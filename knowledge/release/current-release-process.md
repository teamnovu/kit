---
type: Playbook
title: Current release process
description: The pre-release-please CI flow, which publishes any unpublished package version on every push to main.
resource: https://github.com/teamnovu/kit/blob/main/.github/workflows/release.yml
tags: [release, ci, npm, github-actions]
status: deprecated
---

# Flow (`.github/workflows/release.yml`, as of 2026-11-11)

1. Trigger: every push to `main`, plus manual dispatch. No PR checks; lint and tests never run in CI.
2. Setup: `pnpm install --frozen-lockfile` on Node 22, then `pnpm build` and `pnpm docs:build`.
3. Publish: `pnpm -r publish --access public --no-git-checks`. It skips versions already on npm, so a release
   means hand-editing a package's `version` and pushing to `main`. pnpm rewrites `workspace:*` to the exact
   version at publish time.
4. If `git diff HEAD~1` touched any `"version"` line in `packages/*/package.json`, CI:
   - pushes a tag `release-YYYYMMDD-HHMMSS`
   - runs the [Slack notifier](../integrations/slack-notifications.md)
5. Docs are deployed to GitHub Pages (kit.novu.ch) on every push.

# Since `ci: run lint, typecheck, unit and contract tests` (2026-11-11)

- **Triggers:** the workflow also runs on `pull_request`.
- **`verify` job:** lint, typecheck, unit tests, package-contract tests and the docs build, on PRs and on
  `main`.
- **Publish and docs:** run on `main` only, after `verify`.
- **Permissions:** scoped per job. The default is `contents: read`. Publishing gets `contents: write` and
  `pages: write`, and the docs deploy gets `pages` and `id-token`. The publish job runs without dependency
  caching.
- **Action majors:** checkout v7, setup-node v7, pnpm/action-setup v6, configure-pages v6,
  upload-pages-artifact v5, deploy-pages v5.
- **pnpm 11:** pnpm/action-setup **v6 is the first version supporting pnpm 11**, which the repo pins. Before,
  CI used v3.
- **CI Node:** still 22 until the Node 24 step of the [update plan](../dependencies/update-plan.md).

# Facts

- All 10 package versions in git equal the npm versions as of 2026-11-11. That makes them a clean seed for
  the release-please manifest.
- Changelogs exist only for [vue-forms](../packages/vue-forms.md), written by hand.

Replaced by the [release-please migration](release-please-migration.md).
