---
type: Reference
title: Known bugs
description: Pre-existing defects found while mapping dependency touchpoints; not pinned by tests and not yet fixed unless noted.
tags: [bugs, follow-up]
---

# Release-relevant

- **components:** `main`, `module` and all subpath exports point at `dist/*.mjs`, but the build emits `.js`,
  so subpath imports fail for consumers. **Planned fix** as `fix(components)` in the
  [update plan](../dependencies/update-plan.md).

# animations

- **`util.ts:50`:** `'300ms'` contains an `s`, so it is treated as seconds and multiplied by 1000.
- **`timeline.ts:26`:** the `-=` branch strips `'+='` instead, which yields NaN.
- **`timeline.ts:61`:** `!index` treats `-1` (not found) as found.
- **Direction classes:** `ctx.scrollDistance` is never updated, so `to-*` direction classes never appear.
- **`index.ts:93`:** `unmounted` ignores `bind.value.instance`.
- **`index.ts:129`:** the SSR stub provides `isStarted: false`, which is not a function.
- **`index.ts:40`:** the missing-name error is thrown inside an async function, so callers see an unhandled
  rejection instead of a synchronous throw.

# components

- **`utils/dialog.ts:61` and `:69`:** the focus listener is added with capture and removed without it, so the
  focus trap is never removed.
- **AccordionItem:** binds `$attrs` explicitly without `inheritAttrs: false`, so attributes are applied twice.

# cookieconsent

- **`CookieGuard.vue:45`:** throws if the category is missing from the config.
- **`vue.ts:56`:** throws if `acceptedServices[cat]` is undefined.
- **Circular imports:** `cookieGuard.ts` and `CookieGuard.vue` import from `../index`.
- **`lib.ts:6`:** `isServer` is evaluated at import time.
- **Nuxt module:** sets `runtimeConfig.public.cookieconsent` but adds no plugin, so nothing reads it.

# shopware-api-client

- **`query.ts:15-19`:** object values append both the JSON string and `"[object Object]"` (missing `return`).
- **`params`/`query`:** both leak into the `RequestInit` passed to `fetch`.

# api-platform-types

- **Empty YAML file:** `yaml.parse` returns `null`, and the plugin then throws.
- **`handleHotUpdate`:** uses a raw `startsWith` path comparison.

# composables

- **`tsconfig.json`:** includes the non-existent `../components/src/injects`.
