---
type: Reference
title: Linting
description: ESLint flat-config setup, the undeclared-plugin hoisting pitfall, and the error baseline.
tags: [eslint, lint, quality]
---

# Setup

- **Config:** root `eslint.config.js` combines typescript-eslint `recommended`, `@teamnovu/eslint-config-vue`
  (latest 9.0.19, the team's own shared config), `includeIgnoreFile(.gitignore)`, and overrides
  (`@stylistic/max-len` 180, `no-empty-object-type` off).
- **Script:** `pnpm lint` runs `eslint . --fix`, so it **rewrites files**. For read-only checks use
  `pnpm exec eslint .`; for per-file numbers use `-f json` with `jq`.
- **Package configs:** packages have no own configs. Their `lint` scripts resolve the root config.
- **Hoisting pitfall:** `@teamnovu/eslint-config-vue@9.0.19` imports `@eslint/js`,
  `@stylistic/eslint-plugin` and `eslint-plugin-vue` without declaring them. Its declared deps are
  `globals`, `eslint-plugin-tailwindcss`, `eslint-plugin-better-tailwindcss` and
  `eslint-plugin-vuejs-accessibility`.
  - At the root, `@stylistic/eslint-plugin` resolves only because pnpm hoists it from shopware-composables'
    devDeps (`*eslint*` public-hoist pattern).
  - The root must declare it before that duplicate is removed.
- **ESLint 10:** blocked unless every plugin in that config's chain peers it. `eslint-plugin-import` (used in
  shopware-composables) peers only up to ESLint 9.

# State

- **Baseline (2026-11-11):** 7,905 errors. 7,826 of them were in the generated
  `packages/shopware-composables/api-types/storeApiTypes.d.ts`.
- **Now:** **0 errors** and 61 warnings, enforced by the CI `verify` job via `pnpm exec eslint .`. Warnings
  don't fail it.
- **Config changes** (commit `66bca68`):
  - the generated API types are ignored
  - the core `no-redeclare` is off for `.ts`/`.mts`/`.vue`; it flagged TypeScript overloads, and the shared
    config had re-enabled it after typescript-eslint turned it off
  - `no-console` is allowed in `scripts/`
- **Remaining errors:** fixed in `style: fix pre-existing lint errors` (`fda4089`).
