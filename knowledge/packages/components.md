---
type: npm Package
title: "@teamnovu/kit-components"
description: Accessible Vue 3 components (Collapse, Accordion family, Dialog, Image, PromptProvider, …) built on kit-composables.
resource: https://www.npmjs.com/package/@teamnovu/kit-components
tags: [vue, components, accessibility]
---

# Facts (version 1.2.3)

- **Components (12):**
  - Image, Collapse, Dialog, AccessibleComponent, HScrollState, PromptProvider
  - Accordion, AccordionItem, AccordionHeader, AccordionBody
  - HAccordion, HAccordionItem
- **Build:** one Vite lib entry per component plus `index`. With `"type": "module"`, the build emits **`.js`** files.
- **Broken exports (bug):** `main`, `module` and every subpath export (`./Dialog`, `./Image`, …) point at
  `*.mjs` files that don't exist. Only the `"."` import (`./dist/index.js`) works on npm today. The fix is
  planned as `fix(components)` in the [update plan](../dependencies/update-plan.md).
- **Runtime deps:**
  - `@teamnovu/kit-composables` (`workspace:*`, pinned to an exact version on publish)
  - `@vueuse/core ^9`: `useVModel`, `syncRef`; types `CubicBezierPoints`, `EasingFunction`, `MaybeRef`
  - `lodash-es` (`omit`)
  - `nanoid`, declared but unused
- **DevDep:** `@vueuse/shared ^10`, used only for the `MaybeRef` type. VueUse 14+ no longer exports
  `MaybeRef`; use Vue's own.
- **Peer:** `vue ^3.0.0`. VueUse ≥ 12 requires Vue ≥ 3.5.

# Behaviour worth pinning in tests

- Accordion renders `section` with `role="list"`, and the role is omitted for `ul`/`ol`/`menu`.
- AccordionItem renders `details`. AccordionHeader renders `summary` with `aria-expanded` and `aria-controls`.
- The Dialog uses `showModal()`, `aria-modal`, `inert` when hidden, autofocus handling and a focus trap.
- Image picks small (≤ 600), normal (≤ 1000) or large by `width × devicePixelRatio`. It needs a mocked
  ResizeObserver.

See [known bugs](../quality/known-bugs.md) for the focus-trap leak and the `$attrs` issue.
