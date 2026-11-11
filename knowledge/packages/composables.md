---
type: npm Package
title: "@teamnovu/kit-composables"
description: Vue composables for collapse transitions, accordions, scroll state and promise-based prompts.
resource: https://www.npmjs.com/package/@teamnovu/kit-composables
tags: [vue, composables]
---

# Facts (version 1.3.1)

- **Exports:** `useCollapse`, `useAccordion`, `useScrollState`, `useCollapseContext`,
  `useCollapseController`, `usePromptProvider`, `usePrompt`, plus types. The injection keys (Symbols
  `jk/collapseContext`, `jk/collapseController`, `jk/prompt`) are internal.
- **Runtime deps:**
  - `@vueuse/core ^9`: `useTransition`, `TransitionPresets`, `toReactive`, `useWindowScroll`, `isClient`; type
    `UseTransitionOptions`
  - `lodash-es` (`capitalize`)
  - `nanoid`, for collapse ids
- **Peer:** `vue ^3.0.0`.
- **`useCollapse`:**
  - Animates `height` (or `width`) in px over 300 ms with easeInOutCubic and sets `display: none` when closed.
  - Tests need stubbed `scrollHeight` (happy-dom reports 0) and controllable rAF and timers.
- **Stale tsconfig entry:** `tsconfig.json` includes `../components/src/injects`, which does not exist.

# Update notes

In VueUse 14+, `UseTransitionOptions<T>` requires a type argument and the `transition` option is deprecated in
favour of `easing`. Both hit `src/collapse.ts`. See the [migration notes](../dependencies/migration-notes.md).
