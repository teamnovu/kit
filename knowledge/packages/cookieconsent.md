---
type: npm Package
title: "@teamnovu/kit-cookieconsent"
description: Vue plugin, composables, CookieGuard component and Nuxt module wrapping vanilla-cookieconsent v3.
resource: https://www.npmjs.com/package/@teamnovu/kit-cookieconsent
tags: [vue, nuxt, cookie-consent, gdpr]
---

# Facts (version 3.0.6)

- **Entries:**
  - `.`: `createCookieConsent`, `useCookieConsent`, `CookieConsentSymbol`, `CookieGuard`, `useCookieGuard`
  - `./style`
  - `./nuxt`: a Nuxt module
- **Runtime deps:**
  - `vanilla-cookieconsent ^3.0.0-rc.15`, imported as an ESM namespace and spread into the provided API
  - `defu ^6.1.3`, for merging the config
  - `@nuxt/kit ^3.8`: a runtime dependency because of the Nuxt entry
  - `@vueuse/core ^10`, unused
- **Peer:** `vue ^3.3.8`. There is no `nuxt` peer, although the Nuxt entry needs one.
- **Config merge** (custom `createDefu`): user values win, `sections` is replaced wholesale, other arrays
  concatenate with user entries first, and the default `de` translations are kept.
- **Prerender:** when `window.prerender` is set, `run` is never called and `undefined` is provided.
- **Nuxt module:** meta `{ name: '@teamnovu/kit-cookieconsent', configKey: 'cookieconsent' }`. It sets
  `runtimeConfig.public.cookieconsent` and registers the composables and `CookieGuard`. It adds no plugin, so
  nothing reads that runtime config.
- **Styles:** `style.scss` imports `vanilla-cookieconsent/dist/cookieconsent.css`.
- **Module resolution:** vanilla-cookieconsent 3.1 has no `exports` map. Bundlers use its ESM `module` build,
  but plain Node loads the UMD `main`, whose namespace has no `run`. This is a risk for SSR externals, and tests
  force `mainFields: ['module']`.

# Update notes

- vanilla-cookieconsent 3.3 adds a `default` export to the namespace and ships an `exports` map that lists
  only `./types/*`. Check the `vanilla-cookieconsent/types` import in `src/types.ts` with typecheck.
- `defu ≤ 6.1.4` has a prototype-pollution advisory; raise the floor to `^6.1.7`.
- Nuxt 3 and 4 support is planned; see the [update plan](../dependencies/update-plan.md).
