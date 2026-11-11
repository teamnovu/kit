---
okf_version: "0.2"
---

# Repository

* [Workspace layout](repository/workspace.md) - pnpm monorepo of 10 published @teamnovu/kit-* packages, tooling versions, Node baseline
* [Packages](packages/) - one concept per published package: entries, dependencies, risks, test status

# Build and release

* [Build pipeline](build/build-pipeline.md) - Vite library builds, declaration generation, externals and their pitfalls
* [Current release process](release/current-release-process.md) - CI publishes on every push to main; being replaced by release-please
* [release-please migration](release/release-please-migration.md) - decisions for moving package releases to release-please
* [Commit conventions](release/commit-conventions.md) - conventional commit types and what each one releases
* [Slack release notifications](integrations/slack-notifications.md) - how release notes reach Slack, today and after the migration

# Quality

* [Linting](quality/lint.md) - ESLint setup, the hoisting pitfall, error baseline
* [Testing](quality/testing.md) - test conventions, coverage, harness requirements
* [Known bugs](quality/known-bugs.md) - pre-existing defects found during the dependency review

# Dependencies

* [Dependency update plan](dependencies/update-plan.md) - phased, test-gated update of all dependencies
* [Compatibility constraints](dependencies/compatibility.md) - engine and peer limits that cap the upgrades
* [Migration notes](dependencies/migration-notes.md) - breaking API changes in upgraded dependencies and where they hit this repo
* [Audit baseline](dependencies/audit-baseline.md) - pnpm audit findings before the update

# Documentation site

* [VitePress docs site](docs-site/vitepress.md) - how kit.novu.ch is built and deployed

# Environment

* [Agent sandbox](environment/agent-sandbox.md) - what Claude Code sessions can and cannot do in this repo
