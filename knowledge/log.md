# Knowledge Update Log

## 2026-11-11 (Phase 1 complete)
* **Update**: [Testing](quality/testing.md) now documents 587 unit tests in all 10 packages, 28 package-contract tests and the deliberate upgrade tripwires.
* **Update**: [Known bugs](quality/known-bugs.md) gained ~17 defects found while writing tests. The components exports bug is fixed.
* **Update**: [Linting](quality/lint.md) is at 0 errors and enforced in CI. The [release process](release/current-release-process.md) now has a `verify` job.
* **Update**: [Agent sandbox](environment/agent-sandbox.md) records the sandboxed-install pitfall and the commit/approval workflow.

## 2026-11-11
* **Initialization**: Created this OKF bundle while planning the dependency update and the release-please migration on branch `chore/dependency-updates` (base `f1d6ea6`).
* **Creation**: Recorded the [workspace](repository/workspace.md), all [packages](packages/), the [build pipeline](build/build-pipeline.md), the [current release process](release/current-release-process.md) and the [release-please decisions](release/release-please-migration.md).
* **Creation**: Recorded baselines: [lint](quality/lint.md), [tests](quality/testing.md), [audit](dependencies/audit-baseline.md), and the [known bugs](quality/known-bugs.md) found by the review.
