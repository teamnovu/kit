---
type: npm Package
title: "@teamnovu/kit-operations"
description: Typed vue-query helpers (queries, mutations, endpoint trees, resource invalidation) for API Platform backends.
resource: https://www.npmjs.com/package/@teamnovu/kit-operations
tags: [vue, vue-query, api-platform]
---

# Facts (version 0.0.6)

- **Peers:** `vue ^3.5.25`, `@tanstack/vue-query ^5.101.0`. **Runtime dep:** `lodash-es`.
- **`query.ts`:** builds keys from `[params, body, queryParams]` with embedded computeds, interpolates `:param`
  placeholders into URLs, gates on `enabled`, and registers resources via `hashKey`.
- **`mutation.ts`:** POST by default, `paramsFn`, options merge.
- **`createEndpoints.ts`:** prefixes keys, adds `$invalidateKey`, walks nested endpoint trees.
- **`resourceRegistry.ts`:** extracts JSON-LD resource types and invalidates via
  `cache.find({ exact: false })` + `invalidateQueries`.
- **Module-level state:** `resourceIndex` (resourceRegistry) and `moduleTransport` (fetcher) persist across
  imports. Tests must reset them.
- **Tests:** only `tests/queryParams.test.ts` (12 tests). Everything else is uncovered as of 2026-11-11.
