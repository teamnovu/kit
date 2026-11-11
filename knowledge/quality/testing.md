---
type: Reference
title: Testing
description: Existing test conventions, coverage as of the dependency update, and what test harnesses each package needs.
tags: [vitest, testing, happy-dom, vue-test-utils]
---

# Baseline (2026-11-11)

| Package | Runner | Tests | Notes |
|---|---|---|---|
| vue-forms | vitest 2.1, happy-dom 12 | 10 files / 205 | well covered; `SubmitEvent` needs happy-dom |
| operations | vitest 2.1, node | 1 file / 12 | only `appendQueryParams` |
| shopware-composables | vitest 3.1, node | 1 file / 5 | `nonShopwareQueryCache`; no `test` script |
| animations, components, composables, cookieconsent, nuxt, shopware-api-client, api-platform-types | — | none | |

# Conventions

- **Imports and syntax:** tests import `describe/it/expect/vi` from `vitest` explicitly, even with
  `globals: true`. They use no snapshots, no `.each` and no `expectTypeOf`.
- **Composables:** called directly. `effectScope().run()` is only used to test disposal. Reactivity is awaited
  with `nextTick()`.
- **vue-query:** a bare `new QueryClient({ defaultOptions: { queries: { retry: false } } })`. Composables
  that inject need `createApp` + `VueQueryPlugin` + `provide(...)` + `app.runWithContext(...)`.
- **HTTP:** stub the global `fetch` (`vi.stubGlobal`) and return `new Response(...)`.

# Harness requirements found during the review

- **happy-dom:** has no `IntersectionObserver`, and its `ResizeObserver` never fires. Stub both, and drive
  `requestAnimationFrame` with fake timers.
- **Workspace imports:** alias `@teamnovu/kit-*` to `src` in test configs. Otherwise tests resolve the
  package's possibly stale `dist`.
- **Animations:** needs CSS modules processed (sass) and `process.client = true` for the client path.
- **Nuxt:** mock `@nuxt/kit` and alias `#imports` to a stub.
- **cookieconsent:** `vi.mock('vanilla-cookieconsent')`; the package uses an ESM import, not `window.CookieConsent`.
- **Module state:** operations has module-level state (`resourceIndex`, `moduleTransport`); reset it between tests.

# Planned safety net

See the [update plan](../dependencies/update-plan.md):
- package-contract tests over the clean `dist` (export targets exist, runtime export names, `.d.ts` list)
- behaviour tests per package
- a `vue-tsc` typecheck, because VueUse 15 and vanilla-cookieconsent 3.3 breakages are type-level and dts
  builds don't fail on them
