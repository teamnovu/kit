---
type: Reference
title: Compatibility constraints
description: Engine and peer-dependency limits, collected from the npm registry, that cap how far dependencies can be upgraded.
tags: [dependencies, compatibility, node, peers]
---

# Ceilings (registry data, 2026-11-11)

- **TypeScript ≤ 6.0.x:** `typescript-eslint@8.72.2` peers `typescript >=4.8.4 <6.1.0`, so TypeScript 7.0.2
  (latest, the native port) is out. 6.0.3 is the highest usable version.
- **VitePress:** 1.6.4 is the latest stable and depends on `vite ^5.4.14`. 2.0.0-alpha.21 moves to vite ^8.3.4.
  `vitepress-plugin-search` peers `vitepress ^1.0.0-rc.35`.
- **ESLint 10:** eslint-plugin-vue 10.12, typescript-eslint 8.72, `@stylistic` 5.10 and `@eslint/compat` 2.1
  accept ESLint 10. `eslint-plugin-import` 2.32 does not (up to ^9). The tailwind and a11y plugins used by
  `@teamnovu/eslint-config-vue` are unverified.

# Node floors

| Package | Engine |
|---|---|
| vite 7 and 8, @vitejs/plugin-vue 6, @nuxt/kit 4 | `^20.19.0 \|\| >=22.12.0` |
| eslint 10 | `^20.19.0 \|\| ^22.13.0 \|\| >=24` |
| vitest 5 | `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0` (vitest 4: Node 20+) |
| nanoid 6 | `^22 \|\| ^24 \|\| >=26` |
| @vueuse/core 15 | `>=22` |
| happy-dom 21 | `>=20` |
| @nuxt/kit 3.21 | `>=18.12` |

The repo therefore targets **Node 24**. `.nvmrc` was 18 and CI ran 22.

# Peer facts

- **@vueuse/core:** ≥ 12 (12.0.0 released 2024-11-27) peers `vue ^3.5.0`. 15.0.0 was released 2026-09-16.
- **@vitejs/plugin-vue 6.0.10:** peers `vite ^5 || ^6 || ^7 || ^8`.
- **vitest 5.1:** peers `vite ^6.4 || ^7 || ^8`. `@vitest/ui` must match vitest exactly.
- **vite-plugin-dts 5.1.2:** depends on `unplugin-dts 1.1.2`, which peers `@vue/language-core ^3.1.5` and
  `@microsoft/api-extractor >=7`.
- **vue-tsc 3.3.14:** peers `typescript >=5.0.0` and uses `@vue/language-core 3.3.14`.
