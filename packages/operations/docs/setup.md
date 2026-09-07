# Setup

This page wires the package into an existing Vue app, end to end. The package has no configuration
of its own. What it needs is a query client, a transport that knows how to reach your API, and one
module holding your endpoints.

## Install

```bash
pnpm add @teamnovu/kit-operations
```

`vue` (^3.5) and `@tanstack/vue-query` (^5.101) are peer dependencies. Add them as well if the app
does not have them yet:

```bash
pnpm add vue @tanstack/vue-query
```

## The query client

Endpoints are plain TanStack Query options, so the app needs a `QueryClient` and the Vue Query
plugin. Keep the client in its own module, so that imperative callers — a bootstrap prefetch, an
invalidation from a store — reach the same instance the components use:

```ts
// src/queryClient.ts
import { keepPreviousData, QueryClient } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
      retry: 2,
      placeholderData: keepPreviousData,
    },
  },
})
```

`keepPreviousData` earns its place with API Platform collections: it keeps the current page on
screen while a filter or page change is in flight, instead of flashing an empty table.

## The transport

The package builds query and mutation functions but never touches the network. You provide the two
halves. [Transport](./index.md#transport) describes the contract each half has to satisfy; below
are the files themselves.

Start with the error type, since the transport has to decide what a failed response becomes:

```ts
// src/utils/fetch/ApiError.ts
interface Violation {
  propertyPath: string
  message: string
}

export class ApiError extends Error {
  constructor(message: string, readonly response: Response) {
    super(message)
    this.name = 'ApiError'
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    if (response.status !== 422) {
      return new ApiError(response.statusText, response)
    }

    const { violations } = await response.json() as { violations: Violation[] }
    return new UnprocessableEntityError(response, violations)
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(response: Response, readonly violations: Violation[]) {
    super('Unprocessable Entity', response)
    this.name = 'UnprocessableEntityError'
  }
}
```

The 422 branch is what makes the separate class worth it: API Platform answers a rejected write
with a `violations` array, and form code can then narrow with `instanceof` instead of digging
through the raw response.

The query half is a factory. It receives the resolved request parts and returns the function
TanStack calls, so the fetch can read the abort signal at the moment it runs:

```ts
// src/utils/fetch/queryFn.ts
import { appendQueryParams } from '@teamnovu/kit-operations'
import type { QueryFunction } from '@tanstack/vue-query'
import { type MaybeRef, unref } from 'vue'
import { ApiError } from '#/utils/fetch/ApiError'
import { authToken } from '#/composables/useAuth'

export function makeQueryFn<T>(
  url: MaybeRef<string>,
  queryParams?: MaybeRef<Record<string, unknown> | undefined>,
  options?: MaybeRef<Omit<RequestInit, 'signal'>>,
  body?: MaybeRef<unknown>,
): QueryFunction<T> {
  return async (context) => {
    const requestOptions = unref(options)

    const response = await fetch(appendQueryParams(unref(url), unref(queryParams)), {
      ...requestOptions,
      signal: context.signal,
      headers: {
        Accept: 'application/ld+json',
        Authorization: `Bearer ${unref(authToken)}`,
        ...requestOptions?.headers,
      },
      body: JSON.stringify(unref(body)),
    })

    if (!response.ok) {
      throw await ApiError.fromResponse(response)
    }

    return response.json()
  }
}
```

The mutation half is a fetch-like function, called when the mutation runs. Its `body` is the raw,
unserialized body: serialization, method and content type are yours to decide:

```ts
// src/utils/fetch/mutationFunction.ts
import type { CustomFetchInit } from '@teamnovu/kit-operations'
import { unref } from 'vue'
import { ApiError } from '#/utils/fetch/ApiError'
import { authToken } from '#/composables/useAuth'

export const mutationFn = async <T>(url: string, init?: CustomFetchInit): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    ...init,
    headers: {
      'Accept': 'application/ld+json',
      'Content-Type': init?.method === 'PATCH'
        ? 'application/merge-patch+json'
        : 'application/ld+json',
      'Authorization': `Bearer ${unref(authToken)}`,
      ...init?.headers,
    },
    body: JSON.stringify(init?.body),
  })

  if (!response.ok) {
    throw await ApiError.fromResponse(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
```

Note the order in both files: the caller's `headers` are spread last, so a per-endpoint or
per-call header wins over the transport's defaults. Spread them first and every override in the
app silently disappears. The spread also assumes plain-object headers, which is what endpoint
`options` carry. If your app passes `Headers` instances around, compose with `new Headers()`
instead: spreading one of those yields nothing.

## Register the transport

`setTransport` takes both halves and registers them at module level, before the app mounts:

```ts
// src/main.ts
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { setTransport } from '@teamnovu/kit-operations'
import App from '#/App.vue'
import router from '#/router'
import { queryClient } from '#/queryClient'
import { makeQueryFn } from '#/utils/fetch/queryFn'
import { mutationFn } from '#/utils/fetch/mutationFunction'

setTransport({
  query: makeQueryFn,
  mutation: mutationFn,
})

const app = createApp(App)

app.use(router)
app.use(VueQueryPlugin, { queryClient })
app.mount('#app')
```

Module level rather than `app.provide` is the deliberate choice for a client-only SPA: endpoints
called outside `setup()` (router guards, bootstrap prefetching, async handlers) have no injection
context and would otherwise find no transport. Under SSR the tradeoff flips, and the transport has
to stay request scoped; [Transport](./index.md#transport) shows the `app.provide(transportKey, …)`
variant.

The transport is resolved when an endpoint is *called*, not when it is defined, so importing your
endpoints module before `setTransport` runs is fine. Calling an endpoint before it runs is not:
that throws `[operations] No transport provided.`

Anything the app has to fetch before the first paint goes between the plugin and the mount:

```ts
await queryClient.prefetchQuery(endpoints.enums.list())

app.mount('#app')
```

## Define your endpoints

Endpoints live in one module. `createEndpoints` prepends each nesting key to the query keys, so the
shape of that tree is also the namespace of your cache — splitting it across files buys little and
makes collisions easy to miss:

```ts
// src/operations/endpoints.ts
import { createEndpoints, invalidateResources, mutation, query } from '@teamnovu/kit-operations'
import type { Project, ProjectCollection, ProjectInput } from '#/types/api/Project'

export const endpoints = createEndpoints({
  project: {
    list: query<ProjectCollection>()
      .url('/api/projects')
      .resources('Project')
      .build(),
    detail: query<Project>()
      .url('/api/projects/:id')
      .build(),
    update: mutation<Project, ProjectInput>()
      .url('/api/projects/:id')
      .build(() => ({
        options: { method: 'PATCH' },
        onSuccess: (_data, _variables, _onMutateResult, context) => (
          invalidateResources(context.client, 'Project')
        ),
      })),
  },
})
```

Invalidation belongs on the endpoint too, so no call site has to remember it: the `list` query
declares that it holds `Project` resources, and `update` invalidates them once the write succeeds.

That is the whole wiring. From here on, a component only spreads an endpoint into `useQuery` or
`useMutation`:

```vue
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { endpoints } from '#/operations/endpoints'

const { data: projects } = useQuery(endpoints.project.list())
</script>
```

[Defining endpoints](./index.md#defining-endpoints) covers the rest of the builder.

## Cross-cutting request concerns

Headers that every request needs — the bearer token above, a tenant or locale header, `credentials`
for cookie auth — belong in the transport. They are written once there and no endpoint definition
has to know about them.

The exception is an endpoint that must opt *out* of one. Because the transport spreads the caller's
headers last, `options` on a single endpoint is enough to override a global default's value:

```ts
const publicProjects = query<ProjectCollection>()
  .url('/api/projects')
  .build(() => ({
    options: { headers: { 'X-Tenant': 'public' } },
  }))
```

Overriding a value is all a spread can do, though. Leaving the header out of the request entirely
is a transport concern: an object spread only ever sets a key, and a header set to `undefined`
reaches `fetch` as the literal string `undefined`. So pick a sentinel and honour it where the
headers are assembled. An empty value says "do not send this one" clearly enough:

```ts
// src/utils/fetch/queryFn.ts
const withoutOptedOutHeaders = (headers: Record<string, string>) => (
  Object.fromEntries(Object.entries(headers).filter(([, value]) => value !== ''))
)

const response = await fetch(appendQueryParams(unref(url), unref(queryParams)), {
  ...requestOptions,
  signal: context.signal,
  headers: withoutOptedOutHeaders({
    'Accept': 'application/ld+json',
    'Authorization': `Bearer ${unref(authToken)}`,
    'X-Tenant': unref(tenant),
    ...requestOptions?.headers as Record<string, string>,
  }),
  body: JSON.stringify(unref(body)),
})
```

The mutation half needs the same treatment, since the two compose their headers separately. With
the rule in place, an endpoint drops the header by setting it to `''`:

```ts
const anyIri = query()
  .url(':iri')
  .build(() => ({
    options: { headers: { 'X-Tenant': '' } },
  }))
```

## Optional: typed resource names

Resource names are plain strings by default, so a typo in `.resources()` or `invalidateResources`
compiles. To turn them into a checked union, generate the operation types from your backend and
augment the package's `OperationsOverrides` interface. Two extra pieces of setup are needed for
that; [Typing resource names](./index.md#typing-resource-names) explains the augmentation itself.

Install the generator and run it as a vite plugin, pointed at your API Platform config:

```bash
pnpm add -D @teamnovu/kit-api-platform-types
```

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { generateSerializationGroups } from '@teamnovu/kit-api-platform-types'

const resolve = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url))

export default defineConfig(() => ({
  plugins: [
    vue(),
    generateSerializationGroups({
      serializationFileDirectory: resolve('../backend/config/serializer'),
      mappingFileDirectory: resolve('../backend/config/api_platform'),
      outputDirectory: resolve('./src/types/apiPlatformSerializationGroups'),
    }),
  ],
}))
```

The plugin regenerates on dev server start and on every change to those config directories. Its
output is generated code: add the `outputDirectory` to `.gitignore`, and make sure it is covered by
your tsconfig `include`, or the union quietly resolves to `string` again.

## File layout

```
src/
  main.ts                          setTransport + VueQueryPlugin
  queryClient.ts                   the QueryClient and its defaults
  operations/endpoints.ts          every endpoint of the app
  utils/fetch/ApiError.ts          what a failed response becomes
  utils/fetch/queryFn.ts           query half of the transport
  utils/fetch/mutationFunction.ts  mutation half of the transport
global.d.ts                        optional: the resource-name union
```

## When it does not work

**`[operations] No transport provided.`** — an endpoint was called before `setTransport` ran, or,
under SSR, from outside the component tree that received the `provide`; wrap such a call in
`app.runWithContext()`, see [Transport](./index.md#transport).

**A query never requests anything and stays pending** — one of its path params is still
`undefined`. The endpoint keeps itself disabled until every `:placeholder` has a value.

**A per-call header never arrives** — the transport spreads its own `headers` after the caller's
instead of before, so the defaults overwrite every override.

**Nothing invalidates after a mutation** — the response carried no JSON-LD `@type`/`@id` pair to
register. Declare the type up front with `.resources()`.

**`.resources('Prject')` still compiles** — the resource-name union is not wired up, or its members
lack the `type` property the package reads.
