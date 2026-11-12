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

# pnpm update lessons (2026-11-11)

- **Lockfile-only refresh:** `pnpm update -r` rewrites `package.json` ranges to the new versions. In published
  packages that is a consumer-facing change, so use `--no-save` for a lockfile-only refresh.
- **Exclusions:** `pnpm update -r --no-save '!pkg' …` holds back direct dependencies. Transitive ones (e.g.
  eslint plugins of the shared config) still move.
- **Auto-installed peers:** a held-back auto-installed peer keeps its old peer binding. In shopware-composables,
  vue-query stayed bound to vue 3.5.13 after vue moved to 3.5.45, and pnpm then silently skips linking it.
  Neither a frozen nor a normal install repaired that. Declaring the peer as an explicit devDependency did.
- **Peer TypeScript:** pnpm auto-installs the highest version for optional peers. Vue's `typescript` peer
  resolves to 6.0.3, which doesn't affect tooling, since that uses the root TypeScript.
