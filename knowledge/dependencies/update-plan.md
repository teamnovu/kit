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
3. **Dev-tooling majors (done 2026-11-12):**
   - Node 24 (`.nvmrc`, which CI now reads)
   - TypeScript 6.0
   - `@eslint/compat` 2
   - plugin-vue 6
   - vite 7, then 8
   - vitest 5 with happy-dom 21
   - vite-plugin-dts 5
   - glob 14 (docs)
   - `@types/node` 24
   - Audit: 216 → 201 (critical 7).
   - **Deferred:** ESLint 10, `@eslint/js` 10 and `@stylistic` 5, until `@teamnovu/eslint-config-vue` ships a
     version for them; TypeScript 7, blocked by typescript-eslint.
   - The held-back zod, vue-query and vanilla-cookieconsent updates landed with fixes; see the
     [migration notes](migration-notes.md).
4. **Consumer-facing runtime deps:**
   - security floors (lodash-es, defu, zod, nanoid)
   - drop unused deps
   - VueUse 15 and Vue ≥ 3.5 peers (breaking)
   - nanoid 6 (breaking)
   - Nuxt 3/4 support
   - See the [migration notes](migration-notes.md).
4b. **Done 2026-11-12:**
   - unused runtime deps dropped
   - security floors: lodash-es 4.18.1, zod 4.6.7, defu 6.1.7
   - zod 4 in shopware-api-client
   - glob 14 and yaml in api-platform-types
   - VueUse 15 with Vue ≥ 3.5 in components, composables, shopware-composables and vue-forms
   - nanoid 6
   - Nuxt 3/4 support, verified by smoke apps on Nuxt 3.21 and 4.6
   - `files` whitelists
   - kit-nuxt developed against Nuxt 4
   - **Audit: 310 → 33** (critical 12 → 3, all dev-only: `@shopware/api-gen`, VitePress 1 tooling).
5. **release-please (done 2026-11-12):** see the [release-please setup](../release/release-please-migration.md).
6. **Final verification (2026-11-12):**
   - lint, typecheck, 587 unit tests, 28 contract tests and 3 notifier tests, docs build
   - 67 conventional commits, no hand-edited versions
   - Vite consumer smoke app built from the tarballs (all entries and subpaths). Its strict type check only
     reported the pre-existing shopware-composables type issues in [known bugs](../quality/known-bugs.md).

# Follow-ups

- **Shared config:** release `@teamnovu/eslint-config-vue` with ESLint 10, `@stylistic` 5 and the Tailwind
  plugins v4. ESLint 9 is end-of-life.
- **After the first release:** remove the `release-as` entries.
- **Vite configs:** rename `vite.config.js` to `.mjs` in packages without `"type": "module"`, and
  `rollupOptions` to `rolldownOptions`.
- **Nuxt flags:** switch kit-nuxt's runtime to `import.meta.client` (`process.client` only keeps working for
  compatibility).
- **shopware-composables types:** fix the published type issues.
- **VitePress 2:** once stable, it drops the remaining vite 5 dev-server advisories.
- **Known bugs:** work through the runtime bugs in [known bugs](../quality/known-bugs.md).

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
