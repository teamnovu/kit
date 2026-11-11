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

# Baseline (2026-11-11, before the dependency update)

- **Total:** 7,905 errors and 116 warnings in 17 files.
- **Generated file:** 7,826 errors are in the generated `packages/shopware-composables/api-types/storeApiTypes.d.ts`.
  It should be lint-ignored.
- **Elsewhere:** ~80 errors across 16 files, mostly autofixable `@stylistic` rules (member-delimiter-style,
  quotes, indent), plus `no-explicit-any`, `no-redeclare` and `no-console` in `scripts/notify-changelog.js`.
- **CI:** for the planned CI lint job, the generated file is ignored and the rest fixed in explicit `style:`
  commits.
