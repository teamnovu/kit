---
type: Reference
title: Workspace layout
description: pnpm monorepo of 10 published @teamnovu/kit-* packages with shared root tooling.
resource: https://github.com/teamnovu/kit
tags: [monorepo, pnpm, tooling]
---

# Layout

- `packages/*` holds the 10 published packages; see [Packages](../packages/).
- `pnpm-workspace.yaml` includes `packages/*`. The `workspaces` array in the root `package.json` is stale (it
  misses vue-forms) and is ignored by pnpm.
- Root `package.json` carries the shared build/lint/docs tooling as devDependencies. Packages call `vite`,
  `eslint` etc. from the root `node_modules/.bin`, which pnpm puts on `PATH` for workspace scripts.
- `.vitepress/`, `docs/` and `packages/*/docs/` form the [docs site](../docs-site/vitepress.md).
- `knowledge/` is this OKF bundle. It is excluded from the docs site via `srcExclude`.
- `scripts/notify-changelog.js` is the [Slack notifier](../integrations/slack-notifications.md).
- `CLAUDE.md` and `.serena/` are gitignored local agent files.

# Tooling versions (2026-11-11)

| Tool | Version | Note |
|---|---|---|
| pnpm | 11.7.0 | pinned via `packageManager` |
| Node, local | 24.11 | |
| Node, CI | 22 | `.github/workflows/release.yml` |
| Node, `.nvmrc` | 18 | stale; current tooling needs ≥ 22.12, see [compatibility](../dependencies/compatibility.md) |

# pnpm settings

- `allowBuilds` allows install scripts for `@parcel/watcher`, `esbuild`, `unrs-resolver` and `vue-demi`.
- `minimumReleaseAgeExclude` lists `@teamnovu/eslint-config-vue@9.0.19`, which means pnpm 11's
  minimum-release-age protection is active. Keep it; don't add excludes casually.
- The lockfile settings include `autoInstallPeers: true`. Peers like `vue` and `@tanstack/vue-query` get
  auto-installed, sometimes at stale versions.
- The store lives at `~/Library/pnpm/store/v11`. See the [agent sandbox](../environment/agent-sandbox.md)
  for the consequences.
