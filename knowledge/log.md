# Knowledge Update Log

## 2026-11-12 (Phases 4 and 5 complete)
* **Update**: The [release-please setup](release/release-please-migration.md) is implemented, with pinned first-release versions (`release-as`, to be removed afterwards).
* **Update**: [Slack notifications](integrations/slack-notifications.md) are implemented. A real webhook test post is still open.
* **Update**: [Known bugs](quality/known-bugs.md) gained the published-type issues in shopware-composables and the `.env` publishing risk.
* **Update**: The [update plan](dependencies/update-plan.md) records the final results (audit 310 → 33), the verification and the follow-ups.

## 2026-11-12 (Phase 3 complete)
* **Update**: [Migration notes](dependencies/migration-notes.md) cover the TS 6 `rootDir`, vite 7 target, vite 8 `keepNames`, dts `processor: 'vue'`, vitest 5, the deferred ESLint 10/@stylistic 5, and the held-back runtime fixes.
* **Update**: The [build pipeline](build/build-pipeline.md) reflects vite 8, TS 6 and vite-plugin-dts 5, with follow-ups.
* **Update**: The [agent sandbox](environment/agent-sandbox.md) entry is corrected: `!` installs work; the real trap is pnpm 11's automatic install before pnpm commands after `package.json` edits.

## 2026-11-11 (Phase 2 complete)
* **Update**: [Update plan](dependencies/update-plan.md): the cleanup is done (audit 309 → 216). Four behaviour-changing in-range updates were held back.
* **Update**: [Migration notes](dependencies/migration-notes.md) cover zod 4.6 vs Vue reactivity, vue-query 5.107 callbacks, and the eslint-plugin-tailwindcss crash.
* **Update**: [Workspace](repository/workspace.md) gained the pnpm update lessons (`--no-save`, exclusions, auto-installed peers).

## 2026-11-11 (Phase 1 complete)
* **Update**: [Testing](quality/testing.md) now documents 587 unit tests in all 10 packages, 28 package-contract tests and the deliberate upgrade tripwires.
* **Update**: [Known bugs](quality/known-bugs.md) gained ~17 defects found while writing tests. The components exports bug is fixed.
* **Update**: [Linting](quality/lint.md) is at 0 errors and enforced in CI. The [release process](release/current-release-process.md) now has a `verify` job.
* **Update**: [Agent sandbox](environment/agent-sandbox.md) records the sandboxed-install pitfall and the commit/approval workflow.

## 2026-11-11
* **Initialization**: Created this OKF bundle while planning the dependency update and the release-please migration on branch `chore/dependency-updates` (base `f1d6ea6`).
* **Creation**: Recorded the [workspace](repository/workspace.md), all [packages](packages/), the [build pipeline](build/build-pipeline.md), the [current release process](release/current-release-process.md) and the [release-please decisions](release/release-please-migration.md).
* **Creation**: Recorded baselines: [lint](quality/lint.md), [tests](quality/testing.md), [audit](dependencies/audit-baseline.md), and the [known bugs](quality/known-bugs.md) found by the review.
