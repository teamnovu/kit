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

# Facts

- All 10 package versions in git equal the npm versions as of 2026-11-11. That makes them a clean seed for
  the release-please manifest.
- Changelogs exist only for [vue-forms](../packages/vue-forms.md), written by hand.

Replaced by the [release-please migration](release-please-migration.md).
