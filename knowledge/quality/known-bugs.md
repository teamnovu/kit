---
type: Reference
title: Known bugs
description: Pre-existing defects found while mapping dependency touchpoints; not pinned by tests and not yet fixed unless noted.
tags: [bugs, follow-up]
---

# Release-relevant

- **components (fixed in `cd0d859`):** `main`, `module` and all subpath exports pointed at `dist/*.mjs`, but the
  build emits `.js`, so subpath imports failed for consumers.
- **shopware-composables:** mutation composables forward user callbacks with fixed argument lists, e.g.
  `useAddLineItemMutation`, `useUpdateContextMutation`, `useOptimistic.ts:23-26` and `:35-37`, login, logout,
  and remove/update line item. Consumers on a newer vue-query 5.x lose the extra context argument. Tests act as
  a tripwire; see [testing](testing.md).
- **cookieconsent:** in plain Node (e.g. Nuxt SSR externals), `vanilla-cookieconsent` 3.1 resolves to its UMD
  `main`, whose namespace lacks `run`. Recheck with 3.3's new `exports` map.

# animations

- **`util.ts:50`:** `'300ms'` contains an `s`, so it is treated as seconds and multiplied by 1000.
- **`timeline.ts:26`:** the `-=` branch strips `'+='` instead, which yields NaN.
- **`timeline.ts:61`:** `!index` treats `-1` (not found) as found.
- **Direction classes:** `ctx.scrollDistance` is never updated, so `to-*` direction classes never appear.
- **`index.ts:93`:** `unmounted` ignores `bind.value.instance`.
- **`index.ts:129`:** the SSR stub provides `isStarted: false`, which is not a function.
- **`index.ts:40`:** the missing-name error is thrown inside an async function, so callers see an unhandled
  rejection instead of a synchronous throw.
- **`timeline.ts:97`:** percentage offsets multiply by the raw number, so `'+=50%'` after a 1000 ms animation
  gives 51000 instead of 1500.
- **`timeline.ts:11` and `:18`:** a bare `'<'` or `'>'` yields a NaN delay (`parseFloat('')`).
- **`timeline.ts:64-74`:** the `delay` of the directly preceding animation is ignored, unlike earlier ones.
- **`impl.ts:300-321`:** `out-*` classes are only added with the base classes on the first application. An
  element that later passes the threshold at the top never gets `<name>-out-top`.
- **`index.ts:121`:** SSR only reads `bind.arg`, while the client also accepts `bind.value.name`. So
  `v-animate="{ name }"` renders no SSR class.
- **`util.ts:16-21`:** `throttleFn` forwards the first call's arguments in each 16 ms window, which can drop a
  later IntersectionObserver entry. Found by reading the code.

# components

- **`utils/dialog.ts:61` and `:69`:** the focus listener is added with capture and removed without it, so the
  focus trap is never removed.
- **AccordionItem:** binds `$attrs` explicitly without `inheritAttrs: false`, so attributes are applied twice.
- **`Accordion.vue:13-15`:** the `is` prop has a default but no `?`, so the documented `<Accordion>` usage warns
  `Missing required prop: "is"`.
- **`Dialog.vue:102-103`:** `close(event)` reads `event.type` unguarded, so the slot's `close()` without an
  argument throws a TypeError.
- **`utils/dialog.ts:68-69`:** `restoreFocus` runs before the focus-trap listener is removed.

# composables (runtime)

- **`accordion.ts:27-53`:** a ref opened in the same tick as the refs are registered stays open together with
  the others, because the watcher compares against a pre-registration snapshot.

# cookieconsent

- **`CookieGuard.vue:45`:** throws if the category is missing from the config.
- **`vue.ts:56`:** throws if `acceptedServices[cat]` is undefined.
- **Circular imports:** `cookieGuard.ts` and `CookieGuard.vue` import from `../index`.
- **`lib.ts:6`:** `isServer` is evaluated at import time.
- **Nuxt module:** sets `runtimeConfig.public.cookieconsent` but adds no plugin, so nothing reads it.

# shopware-api-client

- **`query.ts:15-19`:** object values append both the JSON string and `"[object Object]"` (missing `return`).
- **`params`/`query`:** both leak into the `RequestInit` passed to `fetch`.
- **`client.ts:185`, `:189` and `:190`:** headers are typed `HeadersInit` but merged with object spread. A
  `Headers` instance is silently dropped, and a `[name, value][]` array produces a `"0"` header key.
- **Context token:** a non-ok response doesn't pick up a `sw-context-token` header.
- **Invalid operation key:** reported as "Failed to communicate with Shopware API" (500).

# shopware-composables (published types)

These issues already exist in the published 0.1.2. They were found by a consumer type check with
`skipLibCheck: false`, which most setups don't use:

- **`query/types/operations.d.ts` and the helpers:** they import `../../../api-types/storeApiTypes.d.ts` with a
  value `import` (TS2846, "use import type").
- **`helpers/product/useProductPrice.d.ts`:** imports `TierPrice` from `@shopware/helpers`, which is only a
  devDependency (bundled in the JS), so the type is unresolvable for consumers.
- **`operations.d.ts`:** references the global `ShopwareApi` namespace from `dist/global.d.ts`, which isn't in
  scope unless the consumer includes that file.

# Publishing (fixed in `2441823`)

- Packages without a `files` whitelist published everything not gitignored. That likely included
  `packages/shopware-composables/.env` and `.env.test`, plus the API schema and `.http` files. **Check the
  published tarballs and rotate any secrets.**

# shopware-composables

- **`useOptimistic.ts:30-32`:** when nothing was cached, the rollback is a no-op, because vue-query ignores
  `setQueryData(key, undefined)`. `updateFn` also receives `undefined`, despite the `CacheValue` type.
- **`useOptimistic.ts:23-26`:** the user's `onMutate` is neither awaited nor is its return value used.
- **`#store-types` imports:** `useCheckoutAddresses`, `useIsLoggedIn`, `usePagination` and `useSeoUrl` import
  `Schemas` from `#store-types` directly instead of `src/query/types/operations.ts`, so consumer type overrides
  don't reach them.

# api-platform-types

- **Empty YAML file:** `yaml.parse` returns `null`, and the plugin then throws.
- **`handleHotUpdate`:** uses a raw `startsWith` path comparison.

# composables

- **`tsconfig.json`:** includes the non-existent `../components/src/injects`.
