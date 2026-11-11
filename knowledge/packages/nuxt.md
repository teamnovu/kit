---
type: npm Package
title: "@teamnovu/kit-nuxt"
description: Nuxt module that registers the kit components, composables and animations plugin with an optional prefix.
resource: https://www.npmjs.com/package/@teamnovu/kit-nuxt
tags: [nuxt, module]
---

# Facts (version 1.1.8)

- **No build step:** `exports["."]` points directly at `src/module.ts`. Consumers' Nuxt compiles it, and the
  package has no `tsconfig.json`.
- **Module meta:** `{ name: 'kit', configKey: 'kit' }`, defaults `{ prefix: '' }`, no `compatibility`.
- **Registers:**
  - 7 composables, as `use${prefix}${name.slice(3)}`
  - 12 components, as `prefix + name`
  - `addImportsDir('./runtime/composables')`, which provides `useSeotamic`
  - `addPlugin('./runtime/animations.ts')`
- **Runtime deps:** `@nuxt/kit ^3.8`, plus kit-animations, kit-components and kit-composables via
  `workspace:*`. Those are imported as namespaces and evaluated in Node.
- **Peer:** `nuxt ^3.0.0`.
- **Runtime plugin:** `runtime/animations.ts` installs kit-animations from `public.kit.animations` and re-applies
  nodes on `page:transition:finish`. It throws if `public.kit` is missing.
- **`useSeotamic`:** builds head input from Statamic SEO data via `useHeadSafe`. It uses `hid` keys (unverified
  under unhead v2) and isn't reactive.
- **Tests:** they need `#imports` aliased to a stub and `@nuxt/kit` mocked.

# Update notes

The decision is to support Nuxt 3 and Nuxt 4 (peer `^3.x || ^4.0.0`). The Nuxt 3 floor is the first release
that ships Vue 3.5, because the kit packages will require it. See the
[update plan](../dependencies/update-plan.md).
