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

# State after Phase 3 (2026-11-12)

- **Versions:**
  - vite 8 (Rolldown/Oxc, Lightning CSS minification) and `@vitejs/plugin-vue` 6 at the root
  - TypeScript 6.0
  - vite-plugin-dts 5 (on unplugin-dts 1.1) with `@vue/language-core` 3.3
- **Package tsconfigs** set `rootDir: ./src`.
- **`.vue` declarations:** components, cookieconsent and vue-forms pass `processor: 'vue'` to the dts plugin.
- **keepNames:** shopware-api-client keeps class names via `build.rolldownOptions.output.keepNames`. The
  contract tests pin `ShopwareApiError`'s name.
- **api-platform-types** now builds with the root vite version (explicit devDependency) instead of an
  auto-installed vite 7 peer.
- **Follow-ups, not urgent:**
  - Rename `build.rollupOptions` to `rolldownOptions` in the other configs (deprecated alias).
  - Rename `vite.config.js` to `.mjs` in packages without `"type": "module"`. vite warns that its future
    native config loader won't accept ESM in CJS-scoped files. Setting `"type": "module"` instead would change
    output extensions and exports.
