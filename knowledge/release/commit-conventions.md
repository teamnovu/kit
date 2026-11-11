---
type: Playbook
title: Commit conventions
description: Which conventional commit type to use for which change, and what release-please releases for it.
resource: https://www.conventionalcommits.org/en/v1.0.0/
tags: [git, conventional-commits, release-please]
status: stable
---

# Rules

- Every commit is a conventional commit: `type(scope)!: subject`.
- **Never edit `version` fields by hand.** release-please owns them.
- One logical change per commit. A commit counts for **every package whose files it touches**, so don't mix
  packages unless the change genuinely concerns all of them.
- Breaking changes get `!` **and** a `BREAKING CHANGE: <what consumers must do>` footer. The footer text is the
  migration note readers see in the changelog and in Slack.
- PRs are rebase-merged, never squashed.

# Type table

| Change | Message | Releases |
|---|---|---|
| new tests | `test(<pkg>): …` | no |
| test, CI or build infrastructure | `test: …`, `ci: …`, `build: …` | no |
| dev-tooling dependency bump (also `packages/*` devDependencies) | `chore(deps): …` | no |
| lint autofix fallout | `style: …` | no |
| documentation | `docs(<pkg>): …` | no |
| bug fix | `fix(<pkg>): …` | patch |
| runtime dependency or peer range raised (non-breaking) | `fix(deps): …` | patch for each touched package |
| change bundled code (e.g. `@shopware/helpers`) | `fix(deps): …` | patch |
| new feature | `feat(<pkg>): …` | minor |
| breaking change | `fix(deps)!: …` / `feat(<pkg>)!: …` + `BREAKING CHANGE:` footer | major (minor below 1.0.0) |

See the [release-please migration](release-please-migration.md) for the surrounding setup.
