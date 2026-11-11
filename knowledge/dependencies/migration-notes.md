---
type: Reference
title: Migration notes
description: Breaking API changes in the upgraded dependencies and the exact places in this repo they affect.
tags: [dependencies, migration, vueuse, zod, nanoid]
---

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
