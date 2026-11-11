---
type: Reference
title: Testing
description: Test layout, coverage, harness conventions and the deliberate tripwires guarding dependency upgrades.
tags: [vitest, testing, happy-dom, vue-test-utils, contract-tests]
---

# Commands

| Command | What it does |
|---|---|
| `pnpm test` | vitest in every package that has a `test` script |
| `pnpm test:contract` | `pnpm clean`, `pnpm build`, then the root `tests/` |
| `pnpm typecheck` | `vue-tsc --noEmit` per package; covers `src/` only, not tests |

CI runs all three, plus lint and the docs build, in the `verify` job (see the
[release process](../release/current-release-process.md)).

# Coverage (2026-11-11, after Phase 1 of the [update plan](../dependencies/update-plan.md))

| Package | Tests | Environment | Focus |
|---|---|---|---|
| vue-forms | 205 | happy-dom | forms, zod validation (exact zod messages = wording tripwire) |
| components | 77 | happy-dom | Collapse transitions and `update:open`, Accordion ARIA, Dialog, Image breakpoints |
| operations | 73 | node | endpoints, query/mutation, JSON-LD resource invalidation |
| shopware-api-client | 48 | node | request building, header precedence, zod error parsing, events |
| shopware-composables | 46 | node | vue-query composables on a real client with stubbed fetch |
| animations | 39 | happy-dom | ids, CSS variables, intersection classes, SSR/client plugin, timeline |
| composables | 38 | happy-dom | useCollapse transition curve and completion, accordion, scroll state, prompt |
| cookieconsent | 24 | happy-dom | defu merge rules, vanilla API keys, CookieGuard, Nuxt module |
| api-platform-types | 19 | node | generated TypeScript pinned as file snapshots |
| nuxt | 18 | node | registered names with and without prefix, runtime plugin, useSeotamic |

**Totals:** 587 unit tests. On top of that, the root `tests/package-contract.test.ts` runs 28 contract tests
over the built packages.

# Package-contract tests

For every package, after a clean build:
- Every `main`, `module`, `types` and `exports` target must exist.
- Every JS entry is imported **by package specifier in a separate plain Node process**, which exercises the real
  `exports` map without vite transforms. Its export names are snapshotted.
- The emitted `.d.ts` files are snapshotted.

This caught the broken [components](../packages/components.md) exports map.

# Conventions

- **Imports:** tests import `describe/it/expect/vi` from `vitest` explicitly. Tests live in `packages/<pkg>/tests/`.
- **Source under test:** workspace packages are aliased to `src` in each `vitest.config`, so tests never run
  against a stale `dist`.
- **What to assert:** intended behaviour only. [Known bugs](known-bugs.md) are neither pinned nor fixed in test
  commits.
- **Fake timers:** list `requestAnimationFrame`, `performance` and `Date` explicitly in `toFake` instead of
  relying on vitest defaults.
- **Injection harness:** `createApp` + `VueQueryPlugin` + `provide(...)` + `app.runWithContext(...)` /
  `effectScope`.
- **HTTP:** stub the global `fetch` with `vi.stubGlobal`.

# Harness quirks

- **cookieconsent:** the vitest config uses `resolve.mainFields: ['module']` and inlines `vanilla-cookieconsent`.
  Plain Node loads the package's UMD `main`, whose namespace has no `run`.
- **nuxt:** aliases `#imports` to `tests/stubs/imports.ts`, and `vue` to the components package's copy, because
  packages/nuxt has no `vue` of its own.
- **animations:** stubs `Window` so that `instanceof Window` holds for the Node global vitest exposes as
  `window`. happy-dom has no IntersectionObserver, and its ResizeObserver never fires; both are faked.
- **operations:** module-level state (`resourceIndex`, `moduleTransport`) is reset between tests.

# Deliberate tripwires for upgrades

- **vue-query callback forwarding:** shopware-composables tests compare the arguments a user's `onSuccess`,
  `onMutate` etc. receive with what vue-query passes. Newer vue-query 5.x passes an extra context argument, and
  the composables forward fixed argument lists, so those tests fail until the composables forward everything.
- **cookieconsent API keys:** the provided API keys are pinned explicitly. vanilla-cookieconsent 3.3 adds
  `default`.
- **zod:** exact zod messages (vue-forms) and zod parsing outcomes (shopware-api-client).
- **TypeScript printer:** generated files from api-platform-types are pinned as snapshots.
- **easeInOutCubic and VueUse `transition`:** composables/components pin the shape of the curve and that the
  `transition` prop still takes effect.
