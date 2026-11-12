---
type: npm Package
title: "@teamnovu/kit-vue-forms"
description: Form state, field registry, validation (zod 4) and form components for Vue.
resource: https://www.npmjs.com/package/@teamnovu/kit-vue-forms
tags: [vue, forms, validation, zod]
---

# Facts (version 0.4.1)

- **Runtime deps:**
  - `zod ^4`
  - `@vueuse/core ^13`, used only for the `Awaitable` type
  - `lodash-es`
  - `vue-component-type-helpers ^3.0.5`
- **Peer:** `vue ^3.0.0`. It is effectively ≥ 3.5 already, because VueUse 13 requires it.
- **Tests:** 10 files, 205 tests, happy-dom (needed for `SubmitEvent`). Several tests assert exact zod error
  messages (`'Too small: expected string to have >=2 characters'`) and so detect wording changes on zod updates.
  `z.string().email()` in tests is deprecated in zod 4.
- **Changelog:** a hand-written `CHANGELOG.md` in Keep-a-Changelog style, history 0.1.27 – 0.4.1. It is being
  handed over to release-please, which inserts new entries above the existing ones. See the
  [release-please migration](../release/release-please-migration.md).
