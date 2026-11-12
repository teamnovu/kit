---
type: Reference
title: Migration notes
description: Breaking API changes in the upgraded dependencies and the exact places in this repo they affect.
tags: [dependencies, migration, vueuse, zod, nanoid]
---

# Done in Phase 3 (2026-11-11/12)

- **TypeScript 5.8 → 6.0:**
  - `rootDir` is no longer inferred, so vite-plugin-dts emitted declarations to `dist/src/`. All package
    tsconfigs now set `"rootDir": "./src"`.
  - `types` defaults to `[]`, which was harmless here because every tsconfig sets `types`.
  - The built output stayed byte-identical.
- **vite 6 → 7:** the default build target is now `baseline-widely-available`. That brings native class fields
  instead of a helper, CSS `inset` shorthands and no `-moz-` prefix. These are consumer-visible syntax changes
  but fine for current browsers.
- **vite 7 → 8 (Rolldown/Oxc):**
  - `esbuild.keepNames` is **not** converted automatically; use `build.rolldownOptions.output.keepNames`
    (shopware-api-client).
  - `build.rollupOptions` still works as a deprecated alias, without a warning.
  - Minified internal function names change, but export keys and types don't.
  - CSS is minified by Lightning CSS (e.g. `translateX` instead of `translate`), with the same CSS-module class
    names.
- **vite-plugin-dts 4 → 5:**
  - It wraps unplugin-dts and needs `@vue/language-core` (declared at the root).
  - Its automatic `.vue` detection misses components that are only imported from `index.ts`, so set
    `processor: 'vue'` (components, cookieconsent, vue-forms).
  - The generated `*.vue.d.ts` changed shape but were verified type-equivalent.
- **vitest 2/3 → 5:**
  - `clearMocks` is on by default.
  - Test options are no longer allowed as the third argument.
  - Nothing in this repo needed changes.
- **@stylistic 4 → 5 (deferred):** v5 applies `indent`/`operator-linebreak` to TypeScript type syntax. Its
  autofix produced worse formatting in places (a stray leading `|`, 180-character lines), so it waits for the
  shared config.
- **ESLint 10 (deferred):** blocked by `@teamnovu/eslint-config-vue@9.0.19`, which pins
  `eslint-plugin-better-tailwindcss@^3` (peers ESLint ≤ 9). ESLint 9 itself is end-of-life, so the shared
  config needs a release with ESLint 10, `@stylistic` 5 and the Tailwind plugins v4.

# Done in the held-back runtime steps

- **zod 4.6 (vue-forms):** fixed with `toRaw` on the schema, plus a floor of `^4.6.7`.
- **vue-query 5.107:**
  - Mutation composables forward all callback arguments and accept options as refs and getters
    (`unref(toValue(…))`).
  - `NonShopwareQueryCache` wraps `build` in the constructor instead of redeclaring it.
  - `useOptimistic` has an explicit `MutationOptions` return type, so its declaration doesn't leak
    `MutationFunctionContext`, which doesn't exist in 5.85.
  - operations uses `toValue` for getter query keys.
- **vanilla-cookieconsent 3.3:** import the types from the package root, and filter the namespace's new
  `default` out of the provided API.

# VueUse 9/10/13 → 15

- **`MaybeRef`:** no longer exported from `@vueuse/core` or `@vueuse/shared`. Use
  `import type { MaybeRef } from 'vue'` in components' `Collapse.vue`, `AccordionItem.vue` and
  `HAccordionItem.vue`. It is also used inside `defineProps` interfaces, so verify the props still accept a
  function and an array.
- **`UseTransitionOptions<T>`:** now generic with no default (composables' `src/collapse.ts`). The `transition`
  option is deprecated in favour of `easing`.
- **Still exported:** `useVModel`, `syncRef`, `toReactive`, `until`, `isClient`, `useWindowScroll`,
  `TransitionPresets`, `CubicBezierPoints`, `EasingFunction`, `Awaitable`.
- **Requirements:** Vue ≥ 3.5 (peer) and Node ≥ 22 (engines).

# nanoid 5 → 6

The `nanoid()` output is unchanged (21 characters, `[A-Za-z0-9_-]`). The `./non-secure` export still exists.
The only change that matters here is the engine: Node `^22 || ^24 || >=26`.

# zod 4.0 → 4.6 (vue-forms)

zod 4.6 defines the internal `_zod` property as read-only and non-configurable. A schema held inside Vue's deep
reactivity (e.g. `ref(schema)`) is wrapped in a reactive proxy. Proxy invariants then make
`schema.safeParseAsync` throw: `'get' on proxy: property '_zod' is a read-only and non-configurable data
property…`. vue-forms' test "should handle reactive schema changes" reproduces it. Schemas must stay raw
(`toRaw`/`markRaw`/`shallowRef`). The `^4` range already lets consumers get 4.6.

# zod 3 → 4 (shopware-api-client)

- **`z.record`:** the single-argument form was removed. Use `z.record(z.string(), z.unknown())`.
- **Inferred type:** the inferred `ShopwareError` shape stays the same.
- **Error messages:** zod 4.x minor releases can change default messages. vue-forms tests assert exact
  strings and catch that.

# vanilla-cookieconsent 3.1 → 3.3

The ESM build adds a `default` export, which then appears in the namespace kit-cookieconsent spreads into its
API. The new package `exports` map lists only `./types/*`, so check the `vanilla-cookieconsent/types` import
with typecheck.

# vite-plugin-dts 4 → 5

v5 is a wrapper around `unplugin-dts`, so its options follow unplugin-dts. Add `@vue/language-core` at the root
for `.vue` declarations.

# @tanstack/vue-query 5.85 → 5.107

- **shopware-composables callbacks:** mutation callbacks receive an extra context argument, which
  shopware-composables drops (5 tests fail, 2 of them forwarding tests).
- **`useOptimistic` timing:** its tests also fail on timing; the cache update lands a tick later relative to the
  cancel/abort.
- **operations types:** `src/createEndpoints.ts:25` fails to typecheck. The query key spread hits
  `Key | (() => Key)` and needs a cast.

# eslint-plugin-tailwindcss 3.18.0 → 3.18.3

This is a transitive dependency of `@teamnovu/eslint-config-vue`. 3.18.3 crashes lint with
"Could not find tailwindcss" when loading its rules. The repo has no Tailwind, so all `tailwindcss/*` rules
are switched off in `eslint.config.js`.
