---
type: Playbook
title: Dependency update plan
description: Phased, test-gated plan for updating every dependency, with one conventional commit per change.
tags: [dependencies, upgrade, plan]
status: draft
---

# Decisions (2026-11-11)

- **Runtime deps:** move to their latest majors, shipped as breaking releases with proper footers.
- **Nuxt:** kit-nuxt and cookieconsent support Nuxt 3 **and** 4.
- **Landing:** one PR from `chore/dependency-updates`, **rebase-merged**.
- **CI:** runs lint, typecheck and tests.
- **Branch base:** `f1d6ea6`, which is also the release-please `bootstrap-sha`.

# Phases

0. **Baseline** without commits: build, docs build, lint and existing tests. All green except lint (see
   [linting](../quality/lint.md)).
1. **Safety net (done 2026-11-11):**
   - test infrastructure, package-contract tests over a clean `dist`, behaviour tests per package (see
     [testing](../quality/testing.md))
   - `fix(components)` for the exports map
   - lint down to 0 errors
   - CI `verify` job
2. **Cleanup (done 2026-11-11):**
   - refresh the lockfile within the declared ranges
   - remove unused root devDeps (`@vue/cli-service` and others)
   - declare `@stylistic/eslint-plugin` at the root
   - drop the duplicate eslint toolchain in shopware-composables
   - move `vite` out of shopware-composables' runtime deps
   - Audit: 309 → 216.
   - **The in-range refresh was not zero-risk.** Several ranges allowed behaviour-changing versions that
     consumers already receive today, and the test tripwires caught them. These were held back and get their
     own fix steps:
     - zod 4.0 → 4.6 (vue-forms reactive schema)
     - vue-query 5.85 → 5.107 (shopware-composables callbacks, operations types)
     - vanilla-cookieconsent 3.1 → 3.3
     - TypeScript
     - See the [migration notes](migration-notes.md).
3. **Dev-tooling majors, one per commit:**
   - Node 24
   - TypeScript 6.0
   - lint stack (ESLint 10 only if the plugins allow it)
   - vite 7 → 8 with plugin-vue 6 and vite-plugin-dts 5
   - vitest 5 with happy-dom 21
   - docs stack
4. **Consumer-facing runtime deps:**
   - security floors (lodash-es, defu, zod, nanoid)
   - drop unused deps
   - VueUse 15 and Vue ≥ 3.5 peers (breaking)
   - nanoid 6 (breaking)
   - Nuxt 3/4 support
   - See the [migration notes](migration-notes.md).
5. **release-please:** see the [release-please migration](../release/release-please-migration.md).

# Gate after every update commit

1. `pnpm install`. pnpm's `minimumReleaseAge` stays on.
2. `pnpm lint` and `pnpm typecheck`: no new errors.
3. `pnpm test` and `pnpm test:contract`: green.
4. `pnpm docs:build`: green.
5. Diff `dist` (JS and `.d.ts`) against the previous step.
6. `pnpm audit`: the count never goes up.

If a step fails and the fix isn't obvious, revert that bump and record it as held back.

# Deliberate hold-backs

- TypeScript 7
- VitePress 2 (alpha)
- `@types/node` beyond the Node runtime (24)
- ESLint 10, if the plugin chain blocks it

See [compatibility](compatibility.md).
