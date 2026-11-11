---
type: npm Package
title: "@teamnovu/kit-animations"
description: Scroll-triggered CSS animations for Vue via the v-animate directive, with an SSR fallback.
resource: https://www.npmjs.com/package/@teamnovu/kit-animations
tags: [vue, animations, directive, ssr]
---

# Facts (version 1.2.1)

- **Entries:** `dist/index.mjs` and `./style.css`.
- **Exports:** `create(opts)` → `{ instance, vAnimate, start, stop }`, `createTimeline`, and a default plugin
  `{ install }`.
- **Runtime deps:**
  - `nanoid ^5`, for element ids `jk-animate-id-<21 chars>`
  - `@vueuse/core ^10`, declared but never imported
- **Peer:** `vue ^3.0.0`.
- **Styles:** animation classes come from a CSS module (`src/animations/default.module.scss`). Tests need CSS
  modules processed (sass is a root devDep).
- **Client vs SSR:** `install` takes the client branch only when `typeof process === 'undefined' ||
  process.client`. Under vitest `process` exists, so tests must set `process.client = true` to cover the client
  path. Nuxt 4 compatibility of `process.client` is unverified.
- **Runtime APIs:** the client path relies on IntersectionObserver (99 thresholds), `requestAnimationFrame`
  (three nested frames on init) and a 16 ms throttle. Elements must be attached to `document.body`.
- **Defaults** (`createContext`): delay 0, duration 300, easing `ease`, `repeatAnimation` true,
  `cssVars.offset` `50px`, threshold 0. CSS variables are named `--jk-animation-<name>-<prop>`.

# Update notes

- `nanoid` 6 keeps the output format but requires Node ≥ 22. See the [migration notes](../dependencies/migration-notes.md).
- Drop the unused `@vueuse/core` instead of upgrading it.
- Several bugs exist in timeline and duration parsing; see [known bugs](../quality/known-bugs.md).
