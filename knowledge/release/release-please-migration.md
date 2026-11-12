---
type: Decision Record
title: release-please setup
description: How @teamnovu/kit packages are released with release-please, including the one-off pins of the first release.
resource: https://github.com/googleapis/release-please
tags: [release, release-please, changelog, ci]
status: stable
---

# Setup (implemented 2026-11-12)

## Configuration

- **Manifest mode:** `release-please-config.json` and `.release-please-manifest.json` define one component per
  `packages/*` directory (10).
- **Options:** `release-type: node`, `bump-minor-pre-major: true`, plugin `node-workspace`.
- **`bootstrap-sha`:** `f1d6ea6` (the `main` commit the dependency update branched from). Older free-form
  commits are ignored.
- **`node-workspace`:** it leaves `workspace:*` ranges untouched (`updateDependencies` skips any `^[a-z]+:`
  protocol) and patch-bumps dependents, e.g. components when composables is released. pnpm replaces
  `workspace:*` with the exact version on publish.

## Workflow (`.github/workflows/release.yml`)

Jobs: `verify` → `release-please` (main only) → `publish` (only if `releases_created`), plus `docs-build` →
`docs`.

- **`release-please`** opens or updates the release PR. Merging it creates the tags and GitHub releases.
- **`publish`** runs `pnpm -r publish`, which only publishes versions missing from npm, then
  `scripts/notify-changelog.js`; see [Slack notifications](../integrations/slack-notifications.md).
- **Release PR tokens:** PRs opened with `GITHUB_TOKEN` don't trigger `pull_request` workflows. If `verify`
  should run on release PRs, use a PAT or GitHub App token.

## Process rules

- **Changelogs:** release-please writes each package's `CHANGELOG.md`. In vue-forms, the hand-written history
  up to 0.4.1 is kept below the new entries.
- **Merging:** rebase-merge only, never squash. Commit rules are in [commit conventions](commit-conventions.md)
  and `docs/contribute.md`.

# First release: pinned versions

The user's rule for the first release: **major** if a package has breaking changes (including raised peer
requirements), **minor** otherwise, never a patch. 0.x packages follow semver's 0.x convention (minor).
Implemented as `release-as` per package:

| Package | Version | Why |
|---|---|---|
| animations | 2.0.0 | nanoid 6 needs Node ≥ 22 |
| components, composables | 2.0.0 | Vue ≥ 3.5 (VueUse 15) |
| nuxt | 2.0.0 | Nuxt ≥ 3.13.1, Nuxt 4 support |
| cookieconsent | 3.1.0 | vanilla-cookieconsent 3.3 support, dependency floors |
| vue-forms | 0.5.0 | Vue ≥ 3.5, zod 4.6 fix |
| shopware-composables | 0.2.0 | Vue ≥ 3.5, vue-query 5.107 compatibility |
| api-platform-types | 0.3.0 | TypeScript 6, glob 14 |
| operations, shopware-api-client | 0.1.0 | vue-query 5.107 / zod 4 |

**After that release is published, remove every `release-as` entry.** Otherwise release-please keeps
proposing the same versions.
