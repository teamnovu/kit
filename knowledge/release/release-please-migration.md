---
type: Decision Record
title: release-please migration
description: Decisions for moving @teamnovu/kit package releases from manual version bumps to release-please.
resource: https://github.com/googleapis/release-please
tags: [release, release-please, changelog, ci]
status: draft
---

# Decisions (2026-11-11)

- **Mode:** manifest mode with one component per `packages/*` directory (10). `release-type: node`,
  `bump-minor-pre-major: true`, plugin `node-workspace`.
- **`bootstrap-sha`** is `f1d6ea6` (the `main` commit before the dependency-update branch). The first release
  PR then contains only conventional commits. Older history used free-form messages like `feat: v0.4.1 - …`.
- **Manifest seed:** `.release-please-manifest.json` starts from the current package versions, which equal npm.
- **Merging:** rebase-merge only, never squash. release-please attributes commits to packages by the files
  they touch, and squashing would collapse per-package commits into one entry. See the
  [commit conventions](commit-conventions.md).
- **Publishing:** CI runs `pnpm -r publish` only when the action reports `releases_created`. The `release-*`
  date tags and the "versions changed" check go away; release-please creates the tags and GitHub releases.
- **Changelogs:**
  - release-please writes each package's `CHANGELOG.md`.
  - In vue-forms, the hand-written history stays: new entries go above the first existing `## [x.y.z]`
    heading. Only the Keep-a-Changelog intro gets reworded.
  - Migration guidance goes into `BREAKING CHANGE:` footers, which render under "⚠ BREAKING CHANGES".
- **Slack:** posts release-please's own notes; see [Slack notifications](../integrations/slack-notifications.md).
- **Guardrail:** a CI `verify` job (lint, typecheck, unit tests, contract tests, docs build) runs on PRs and
  gates release and publish.

# Facts about release-please behaviour

- **Visible changelog sections:** feat, fix, perf and revert. Hidden types (chore, docs, test, build, ci,
  style, refactor) appear only when breaking, and don't trigger releases on their own.
- **`node-workspace`:** patch-bumps dependents of released workspace packages and notes `workspace:` updates.
- **Action outputs:** `releases_created`, `paths_released` (a JSON array), and per path
  `<path>--release_created`, `--version`, `--tag_name`, `--html_url` and `--body` (the release notes).
- **Release PR tokens:** release PRs opened with `GITHUB_TOKEN` don't trigger `pull_request` workflows. A
  PAT or GitHub App token is needed if `verify` should run on them.

# Expected first release PR

| Package | Next version |
|---|---|
| animations, components, composables | 2.0.0 |
| nuxt | 2.0.0 |
| cookieconsent | 3.1.0 |
| vue-forms | 0.5.0 |
| shopware-composables | 0.2.0 |
| shopware-api-client | 0.0.16 |
| operations | 0.0.7 |
| api-platform-types | 0.2.6 |

The reasons for each bump are in the [update plan](../dependencies/update-plan.md).
