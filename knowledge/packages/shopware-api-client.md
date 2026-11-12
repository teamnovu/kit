---
type: npm Package
title: "@teamnovu/kit-shopware-api-client"
description: Fetch-based, operation-key-typed client for the Shopware 6 Store API with zod error parsing and events.
resource: https://www.npmjs.com/package/@teamnovu/kit-shopware-api-client
tags: [shopware, http-client, zod]
---

# Facts (version 0.0.15)

- **Exports:** `ShopwareClient<Operations>` (extends a custom `EventEmitter`), `ShopwareApiError`, the
  `ShopwareError` type, and helper types.
- **Operation keys:** look like `'readNavigation post /navigation/{activeId}/{rootId}'`. The client parses
  them with a case-insensitive regex, upper-cases the method and replaces `{x}` from `params` without encoding.
  The URL becomes `${baseURL}/store-api/...`, plus `?` and the serialized `query`.
- **fetch:** uses the global `fetch` and is not injectable; tests stub it with `vi.stubGlobal`. `params` and
  `query` leak into the `RequestInit`.
- **Header order:**
  1. `Content-Type`
  2. `sw-access-key`
  3. default headers
  4. `sw-context-token`
  5. `sw-include-seo-urls: true`
  6. `sw-language-id`
  7. instance headers
  8. per-call headers
- **Errors:** network or parse failures become `ShopwareApiError(…, 500)`; non-ok responses become
  `ShopwareApiError(statusText, status, json)`.
- **zod:** `error.ts` parses error bodies with `safeParse`. It uses the single-argument
  `z.record(z.unknown())`, which zod 4 removed; it needs `z.record(z.string(), z.unknown())`.
- **Events:** `contextToken` fires on every setter call, including in the constructor and on response
  headers; `error` fires on failures. `EventEmitter` relies on the global `CustomEvent`, so it needs Node ≥ 19.
- **Query serialisation quirk:** for objects, `query.ts` appends both the JSON string and `"[object Object]"`
  (a missing `return`). See [known bugs](../quality/known-bugs.md).
