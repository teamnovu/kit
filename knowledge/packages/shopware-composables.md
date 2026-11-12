---
type: npm Package
title: "@teamnovu/kit-shopware-composables"
description: vue-query composables and checkout/product/user helpers for the Shopware Store API.
resource: https://www.npmjs.com/package/@teamnovu/kit-shopware-composables
tags: [shopware, vue-query, composables]
---

# Facts (version 0.1.2)

- **Types:**
  - Generated into `api-types/storeApiTypes.d.ts` by `pnpm gen-types`, using the Docker setup in `docker/`.
    It needs a Shopware instance; the submodule `docker/custom/static-plugins/novu-shopware-headless-plugin`
    tracks branch `shopware-6.7`.
  - Consumers override the types through interface extension in `src/query/types/operations.ts`. Code must
    use the Operations/Schemas types from there, never the generated file directly.
- **Query keys** (`keys.ts`):
  - rooted at `['shopware', …]`
  - embed raw `MaybeRef`s and option objects, relying on vue-query deep-unwrapping refs
- **Query composable pattern:**
  - `queryOptions()` is returned directly, never wrapped in `computed`
  - the key is built outside `queryFn`, and values are unref'd inside it
  - path parameters go in `params`
  - See the root `CLAUDE.md` for the canonical example.
- **Client injection:** `useShopwareQueryClient()` injects `shopwareClientKey` and throws if it's missing.
  `useShopwareVueQueryClient()` selects the QueryClient by `queryClientId`.
- **`nonShopwareQueryCache`:** overrides the internal `QueryCache.build`, which is sensitive to vue-query
  updates. It is covered by the only existing test (5 tests).
- **Dependency problems:**
  - Runtime `dependencies` include `vite ^6.2.5` by mistake; it's only used in configs.
  - `@vueuse/core ^13` (`until`) is a runtime dep.
  - `@shopware/helpers` is a **devDependency but bundled** into `dist` (not externalized), so updating it
    changes shipped code.
- **Peers:** `@tanstack/vue-query ^5.85.3`, `@teamnovu/kit-shopware-api-client` (`workspace:*`), `vue ^3.0.0`.
- **Build:** uses `unplugin-dts` (not vite-plugin-dts).
- **Lint toolchain:** it carries its own copy of the ESLint toolchain, which is redundant. Its `@stylistic`
  plugin is what the root lint config resolves through hoisting; see [linting](../quality/lint.md).
- **Lint errors:** the generated types file accounts for 7,826 of the repo's 7,905 lint errors.
- **Test config:** `vitest.config.js` loads env via `loadEnv(mode, __dirname, '')` and aliases the api client to
  `src`. There are 46 tests.
- **Mutation callbacks:** user callbacks are forwarded with fixed argument lists, so newer vue-query context
  arguments get lost. Tests are a tripwire; see [known bugs](../quality/known-bugs.md).
