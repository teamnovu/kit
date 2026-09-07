# API Platform Operations

Define each endpoint of your API once, together with its URL, its request and response types, its
query key and its invalidation rules. Then spread the result into TanStack Query's `useQuery` and
`useMutation`.

Install with `pnpm add @teamnovu/kit-operations`. Wiring it into an existing app — query client,
transport, endpoints module — is a walkthrough of its own: [Setup](./setup.md).

`vue` and `@tanstack/vue-query` are peer dependencies. Resource tracking assumes an API Platform
backend (JSON-LD), but the HTTP layer stays yours, see [Transport](#transport).

## Quick start

```ts
// operations/endpoints.ts
import { createEndpoints, invalidateResources, mutation, query } from '@teamnovu/kit-operations'

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

The endpoint carries its own invalidation, so nothing at the call site has to remember it: every
cached query holding a `Project` refetches once the mutation succeeds. See
[Cache invalidation](#cache-invalidation) for narrowing that down to a single instance.

```vue
<script setup lang="ts">
import { useMutation, useQuery } from '@tanstack/vue-query'
import { endpoints } from '#/operations/endpoints'

const route = useRoute()
const projectId = computed(() => route.params.projectId?.toString())

const { data: project, isFetching } = useQuery(endpoints.project.detail({
  params: { id: projectId },
}))

const { mutateAsync: updateProject, isPending } = useMutation(endpoints.project.update())

const rename = async (name: string) => {
  await updateProject({
    params: { id: projectId.value },
    body: { name },
  })
}
</script>
```

## Transport

The package builds query and mutation functions but never touches the network itself. Register your
own fetch layer once at startup:

```ts
// main.ts
import { setTransport } from '@teamnovu/kit-operations'
import { makeQueryFn } from '#/utils/fetch/queryFn'
import { mutationFn } from '#/utils/fetch/mutationFunction'

setTransport({
  query: makeQueryFn,
  mutation: mutationFn,
})
```

This is the only wiring the package needs. Everything after it is endpoint definitions.
[Setup](./setup.md) shows both halves as complete files, next to the error type they throw.

`setTransport` registers the transport at module level, which also covers endpoints called outside
of `setup()`: router guards, bootstrap prefetching, async handlers. Under SSR, provide it per
request instead so it stays request scoped:

```ts
import { transportKey } from '@teamnovu/kit-operations'

app.provide(transportKey, { query: makeQueryFn, mutation: mutationFn })
```

### `query`

The query half is a factory. It receives the resolved request parts and returns a TanStack
`QueryFunction`, so the fetch can read the abort signal when it actually runs:

```ts
import { appendQueryParams } from '@teamnovu/kit-operations'

export function makeQueryFn<T>(
  url: MaybeRef<string>,
  queryParams?: MaybeRef<Record<string, unknown> | undefined>,
  options?: MaybeRef<Omit<RequestInit, 'signal'>>,
  body?: MaybeRef<unknown>,
): QueryFunction<T> {
  return async (context) => {
    const response = await fetch(appendQueryParams(unref(url), unref(queryParams)), {
      ...unref(options),
      signal: context.signal,
      headers: { Accept: 'application/ld+json', ...unref(options)?.headers },
      body: JSON.stringify(unref(body)),
    })

    if (!response.ok) {
      throw await ApiError.fromResponse(response)
    }

    return response.json()
  }
}
```

`appendQueryParams` comes from the package. The package hands the query params to the transport as
a plain object, and the helper turns them into the query string API Platform filters expect:

```ts
appendQueryParams('/api/projects', {
  name: 'kit',
  status: ['open', 'closed'],
  order: { createdAt: 'desc' },
})
// '/api/projects?name=kit&status[]=open&status[]=closed&order[createdAt]=desc'
// (shown decoded, the brackets are percent-encoded in the actual url)
```

Arrays become `key[]`, nested objects become `key[nested]`, and `null` or `undefined` values are
left out entirely. A url that already carries a query string is extended with `&` instead of `?`.
Serializing differently stays possible: the helper is a plain function, so a transport that talks to
another backend can ignore it and build the query string itself.

### `mutation`

The mutation half is a fetch-like function, called when the mutation runs. It receives the
interpolated URL and an init object whose `body` is the raw, unserialized body. Serialization,
headers and content types are yours to decide:

```ts
export const mutationFn = async <T>(url: string, init?: CustomFetchInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': init?.method === 'PATCH'
        ? 'application/merge-patch+json'
        : 'application/ld+json',
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

Both halves spread the caller's `headers` last, so a per-endpoint or per-call header wins over the
transport's defaults. Both also assume those headers are a plain object, which is what endpoint
`options` carry in practice. `RequestInit` allows more than that: a `Headers` instance keeps its
entries internally rather than as own properties, so spreading one contributes nothing and the
defaults are all that is left, and an entry list spreads to numeric keys. Compose with
`new Headers()` in the transport if your app passes either of those around.

An endpoint invoked before a transport is registered throws an error that says exactly that.

## Defining endpoints

### Queries

`query<Output>()` starts the builder, `.url()` takes a path with `:param` placeholders, and
`.build()` returns the finished endpoint:

```ts
const projectDetail = query<Project>()
  .url('/api/projects/:id')
  .build()
```

Pass a factory to `.build()` to add TanStack query options:

```ts
const enums = query<EnumCollection>()
  .url('/api/enums')
  .build(() => ({
    staleTime: Infinity,
  }))
```

Three options are not free for the taking. `queryKey` is owned by the builder, which derives it
from the parameters and the `createEndpoints` nesting, so the factory cannot return one at all. A
`queryFn` is only used by endpoints without a `.url()`, since a URL-bearing endpoint fetches through
the transport. `enabled` is kept, but combined with the builder's own check that every path param is
present, see [Parameters](#parameters).

That factory receives the parameters from the call site, which is what you want for `select` or a
custom `enabled`. A section and its properties can each be a ref, so unwrap twice before reading:

```ts
const postalCode = query<PostalCodeResponse>()
  .url('/api/postal_codes')
  .build(params => ({
    select: data => data.result,
    enabled: computed(() => !!unref(unref(params.queryParams)?.code)),
  }))
```

`.url()` is optional. Without it, the factory's `queryFn` is what runs:

```ts
const localData = query<Settings>()
  .build(() => ({
    queryFn: () => readSettingsFromStorage(),
  }))
```

### Mutations

`mutation<Output, Input>()` works the same way, except that `mutationFn` is always the builder's:
there is no URL-less variant to bring your own. Mutations default to `POST`, so other verbs go into
`options`:

```ts
const deleteProject = mutation<never, undefined>()
  .url('/api/projects/:id')
  .build(() => ({
    options: { method: 'DELETE' },
    onError: () => toast.error(translate('messages', 'toast.delete.error')),
  }))
```

### Grouping with `createEndpoints`

`createEndpoints` takes a tree of endpoints and prepends each nesting key to the query keys, so
`endpoints.project.detail({ params: { id } })` ends up with the query key
`['project', 'detail', { id }]`.

Every query node of the tree also carries an `$invalidateKey`, which is what you invalidate a whole
branch with, see [Cache invalidation](#cache-invalidation). Mutation endpoints do not expose one.

## Parameters

An endpoint takes a single parameter bag with up to three sections:

| Section | Goes into | Reactivity |
| --- | --- | --- |
| `params` | `:placeholders` in the URL | each property may be a ref |
| `queryParams` | the query string | each property may be a ref |
| `body` | the request body | reactive as a whole |

```ts
const { data } = useQuery(endpoints.project.list({
  queryParams: computed(() => ({
    name: searchTerm.value,
    'order[createdAt]': 'desc',
    itemsPerPage: 5,
  })),
}))
```

Refs are unwrapped when the request goes out, and they are part of the query key, so changing a
parameter refetches.

A query stays disabled as long as one of its path params is still `null`, since a missing `:id`
would produce a broken URL. Your own `enabled` is combined with that check, so both have to be
true:

```ts
// Runs only once `selectedId` has a value.
const { data } = useQuery(endpoints.project.detail({
  params: { id: selectedId },
}))
```

Use `.params()` to normalize the bag before it becomes a URL and a query key:

```ts
const projectList = query<ProjectCollection>()
  .url('/api/projects')
  .params(({ queryParams }) => ({
    queryParams: {
      ...queryParams,
      'order[createdAt]': 'desc',
    },
  }))
  .build()
```

### Per-call request options

Both kinds of endpoint accept `RequestInit` overrides, merged over the options from the builder:

```ts
useQuery(endpoints.project.detail(
  { params: { id: projectId } },
  { headers: { 'X-Custom-QR-Auth': authToken } },
))

useMutation(endpoints.project.update({ headers: { 'X-Custom-QR-Auth': authToken } }))
```

## Calling mutations

A mutation only takes `params` and `body`, with `params` resolved into the URL and `{ method, body, ...options }`
passed to the transport. `body` is typed as the endpoint's input type:

```ts
const { mutateAsync: createSubproject } = useMutation(endpoints.subproject.create())

const subproject = await createSubproject({
  params: { subprojectGroupId: groupId.value },
  body: formValues,
})
```

## Cache invalidation

There are two mechanisms, one for each way of asking what has gone stale. Query keys invalidate
structurally, by position in the endpoint tree. Resources invalidate semantically, by what the data
is about, no matter which query is holding it. Every variant of both:

```ts
import { invalidateResources } from '@teamnovu/kit-operations'

// Structural. `$invalidateKey` sits on every level of the tree, and keys match by prefix:
endpoints.$invalidateKey                                    // [] — the whole cache
endpoints.project.$invalidateKey                            // ['project'] — one branch
endpoints.project.detail.$invalidateKey                     // ['project', 'detail'] — one endpoint
endpoints.project.detail({ params: { id } }).$invalidateKey // ['project', 'detail', { id: '12' }]

await queryClient.invalidateQueries({ queryKey: endpoints.project.$invalidateKey })

// Semantic. What the data is about, wherever it happens to be cached:
await invalidateResources(queryClient, 'Project')             // any query holding a Project
await invalidateResources(queryClient, ['Project', '12'])     // only queries holding that one
await invalidateResources(queryClient, 'Project', 'Employee') // several resources at once
```

Because keys match by prefix, a shorter one covers everything below it: the branch key invalidates
every endpoint in `project`, the endpoint key every cached call of `project.detail` whatever its
parameters, and the call key that single entry. The first three are static and need no arguments,
so they work from anywhere. The fourth comes off a call, and is the query key with every ref
already resolved: `queryKey` keeps your refs, because `useQuery` needs it reactive, while
`$invalidateKey` is the plain snapshot taken at call time.

Resources are the other half, and usually the more practical one in `onSuccess`, where you rarely
know which query keys are holding a copy of the project you just changed. Every response is scanned
for JSON-LD `@type` and `@id` pairs, and the query key is registered for each resource it contains.
Do note that URL-less endpoints that supply a custom `queryFn` are not scanned for `@type`/`@id` resources.
`invalidateResources` then invalidates every cached query that has seen that resource:

```ts
import { getIdFromIRI, invalidateResources } from '@teamnovu/kit-operations'

const updateProject = mutation<Project, ProjectInput>()
  .url('/api/projects/:id')
  .build(() => ({
    options: { method: 'PATCH' },
    onSuccess: async (data, _variables, _onMutateResult, context) => {
      // A whole type...
      await invalidateResources(context.client, 'Project')
      // ...or a single instance.
      await invalidateResources(context.client, ['Project', getIdFromIRI(data['@id'])])
    },
  }))
```

Invalidating a plain type also catches every instance-specific entry of that type.

A collection that comes back empty carries no resources to register, so declare the type up front
with `.resources()`. The endpoint is then invalidated even if it has only ever returned an empty
list:

```ts
const projectList = query<ProjectCollection>()
  .url('/api/projects')
  .resources('Project')
  .build()
```

Seeding the cache by hand is the other special case. Use `setQueryDataWithResources` rather than
`queryClient.setQueryData`, or the seeded entry stays invisible to `invalidateResources`:

```ts
import { setQueryDataWithResources } from '@teamnovu/kit-operations'

const { queryKey } = endpoints.project.detail({ params: { id: project.id } })

setQueryDataWithResources(queryClient, queryKey, project)
```

### Typing resource names

Resource names are plain strings by default, so `.resources('Prject')` compiles and the matching
typo in `invalidateResources` compiles too. Two pieces turn them into a checked union. All of this
is optional: skip it and invalidation still works, just with unchecked strings.

The first piece is `OperationsOverrides`, an empty interface the package exports for exactly this
purpose. You merge your own type into it:

```ts
// global.d.ts
import type { OperationsUnionType } from '#/types/apiPlatformSerializationGroups/operations'

declare module '@teamnovu/kit-operations' {
  interface OperationsOverrides {
    OperationsUnionType: OperationsUnionType
  }
}

export {}
```

The second piece, `OperationsUnionType`, is yours rather than the package's. It is a union of
objects that each carry a `type` property naming one resource:

```ts
export interface YearOperations {
  resourceClass: 'App\\Entity\\Year\\Year'
  type: 'Year'
  operations: { /* ... */ }
}

export type OperationsUnionType = YearOperations | EmployeeOperations | ProjectOperations
```

You normally do not write that file. `@teamnovu/kit-api-platform-types` ships a vite plugin that
generates it from your backend's serialization config. The package then collects the `type` of
every member and uses the result, here `'Year' | 'Employee' | 'Project'`, everywhere a resource
name is expected.

That `type` property is what makes the whole thing work. Augment with a union whose members lack
one and everything silently falls back to `string`, with no error and nothing to tell you why.

Two requirements the snippet cannot show: the file has to sit inside your tsconfig `include`, and
it has to be a module rather than an ambient script, which is what the `import` and the trailing
`export {}` are for. Nothing of this exists at runtime, it is types only.

## Outside of components

The same options work with the query client directly:

```ts
await queryClient.prefetchQuery(endpoints.enums.list())

const user = await queryClient.fetchQuery({
  ...endpoints.user.current(),
  retry: false,
})
```

If any parameter is a ref, wrap the options in `toFetchOptions`, which unwraps them into plain
values:

```ts
import { toFetchOptions } from '@teamnovu/kit-operations'

const project = await queryClient.fetchQuery(toFetchOptions(
  endpoints.project.detail({ params: { id: projectId } }),
))
```

## Loosening the option types

Vue Query types several of its options invariantly, because callbacks like `enabled`, `select` and
`refetchInterval` mention the output type in a position that rules covariance out. The effect is a
type error on an options object that is perfectly valid at runtime. `toLossyQueryOptions` is the
escape hatch: it is the identity function at runtime and only widens the options that need
covariance, leaving `queryKey` and `queryFn` precisely typed.

You rarely need it. Reach for it when a call site produces a type error you cannot explain from the
values you passed, most often on an `enabled` callback, and leave it out everywhere else.

`useQueries` is the one place that needs it consistently, since its generics are stricter again:

```ts
import { toLossyQueryOptions } from '@teamnovu/kit-operations'

const results = useQueries({
  queries: computed(() => jobIris.value.map(iri => toLossyQueryOptions({
    ...endpoints.exportJob.detail({ params: { id: getIdFromIRI(iri) } }),
    refetchInterval: query => (query.state.data?.status === 'finished' ? false : 2000),
  }))),
})
```

## IRI helpers

Small helpers for API Platform IRIs like `/api/projects/12`:

```ts
import { getIdFromIRI, mapArrayOfIdFromIRI, mapIdFromIRIByKey } from '@teamnovu/kit-operations'

getIdFromIRI('/api/projects/12') // '12'
mapArrayOfIdFromIRI(['/api/projects/1', '/api/projects/2']) // ['1', '2']
mapIdFromIRIByKey(projects) // ids read from each object's '@id'
```

`getIdFromIRI` returns `undefined` for anything it cannot parse. The two array helpers drop those
values, so their result never contains `undefined`.

## Type helpers

| Helper | Use |
| --- | --- |
| `EndpointOutput<typeof endpoint>` | the response type of an endpoint |
| `EndpointOptions<typeof endpoint>` | the full options object an endpoint call returns |
| `PartialEndpointOptions<typeof endpoint>` | the same, with all properties optional |

```ts
import type { EndpointOutput } from '@teamnovu/kit-operations'

type Project = EndpointOutput<typeof endpoints.project.detail>
```

## Exports

| Export | Description |
| --- | --- |
| `query()` / `mutation()` | builders for endpoint definitions |
| `createEndpoints()` | groups endpoints and namespaces their query keys |
| `setTransport()` / `transportKey` | registers the HTTP layer |
| `invalidateResources()` | invalidates all queries that contain a resource |
| `setQueryDataWithResources()` | seeds the cache and registers its resources |
| `toFetchOptions()` | unwraps refs into the plain options `fetchQuery` expects |
| `toLossyQueryOptions()` | widens option types where Vue Query's invariance rejects a valid call |
| `appendQueryParams()` | serializes a query params bag onto a url |
| `getIdFromIRI()`, `mapArrayOfIdFromIRI()`, `mapIdFromIRIByKey()` | IRI helpers |
