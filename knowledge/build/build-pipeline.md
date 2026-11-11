---
type: Reference
title: Build pipeline
description: How the packages are built with Vite library mode and where the build setup hides pitfalls.
tags: [build, vite, typescript, declarations]
---

# How packages are built

- **Command:** each package runs `vite build` from its own `vite.config.js`, using the root `vite`. The root
  `pnpm build` is `pnpm -r build`.
- **Format:** library mode, ESM only (`formats: ['es']`), with one or more named entries.
- **Externals:** `Object.keys(pkg.dependencies)`, plus `peerDependencies` in some packages, plus `vue`.
  Anything only in `devDependencies` gets **bundled**. This bites `@shopware/helpers` in
  [shopware-composables](../packages/shopware-composables.md).
- **Declarations:**
  - `vite-plugin-dts` 4 in most packages; `unplugin-dts` 1.0 beta in shopware-composables
  - options used: `staticImport`, `copyDtsFiles`, `compilerOptions`
  - dts generation does not fail the build on type errors, so a separate typecheck is needed to catch type
    breakage
- **Stale output:** `emptyOutDir: false` is set almost everywhere, so stale hashed chunks accumulate in
  `dist/`. Always build from a clean `dist` (root `pnpm clean`) before judging output or running the contract
  tests.
- **Output extensions:** packages with `"type": "module"` emit `.js`; the others emit `.mjs`. That mismatch is
  the root of the broken [components](../packages/components.md) exports map.
- **Baseline warning:** the build log has only one warning: shopware-composables imports `ShopwareApiError`
  without using it in ~20 mutation files.

# Upgrade notes

- `vite-plugin-dts` 5 is a thin wrapper around `unplugin-dts@1.1.2`, so its options follow unplugin-dts.
  unplugin-dts expects `@vue/language-core` and `@microsoft/api-extractor` as peers; without
  `@vue/language-core` at the root, `.vue` declarations break.
- vite 8 replaces Rollup with Rolldown. Gate it with the package-contract tests and a `dist` diff; see the
  [update plan](../dependencies/update-plan.md).
