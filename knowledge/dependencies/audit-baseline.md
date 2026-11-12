---
type: Reference
title: Audit baseline
description: pnpm audit findings before the dependency update, by origin, with the advisories that reach consumers.
tags: [security, audit, dependencies]
---

# Totals (2026-11-11, `pnpm audit`)

| Severity | Count |
|---|---|
| critical | 12 |
| high | 140 |
| moderate | 113 |
| low | 45 |

# Where they come from

- **`@vue/cli-service`:** an unused root devDependency, and by far the largest source.
- **`nuxt` via autoInstallPeers:** pulled in by kit-nuxt's peer.
- **Old test tooling:** vitest 2/3 and happy-dom 12. The critical items are happy-dom < 20, vitest < 3.2.6 and
  tinypool.
- **Stale transitive versions** in the lockfile: rollup, postcss, picomatch, minimatch, braces and others.
  These are fixable within the declared ranges.
- **Other unused root devDeps:** `eslint-config-airbnb-base`, `concurrently`, `shelljs`, `rollup-plugin-copy`.

# Advisories in runtime dependencies (reach consumers)

| Package | Vulnerable | Fixed | Issue |
|---|---|---|---|
| lodash-es | ≤ 4.17.23 | ≥ 4.17.24 | `_.template` code injection; prototype pollution in `unset`/`omit` |
| nanoid | ≥ 4 < 5.1.16 | ≥ 5.1.16 | infinite loop with negative size; integer overflow |
| defu | ≤ 6.1.4 | ≥ 6.1.5 | prototype pollution via `__proto__` |
| zod | < 4.6.6 | ≥ 4.6.6 | memory exhaustion on oversized constrained collections (no 3.x fix) |
| @vue/server-renderer | < 3.5.42 | ≥ 3.5.42 | XSS via attribute names |
| glob | ≥ 9 ≤ 14.0.1 | ≥ 14.0.2 | AbortSignal cancellation bypass |
| yaml | ≥ 1 < 1.10.3 | ≥ 1.10.3 | stack overflow (transitive v1 copies) |

Vite ≤ 6.4.3 carries several dev-server advisories (fs.deny bypasses, launch-editor issues). VitePress 1.x
keeps vite 5, so a few of these stay for the docs dev server only.
