import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import type { ShopwareClientOptions } from '@teamnovu/kit-shopware-api-client'
import { ShopwareClient } from '@teamnovu/kit-shopware-api-client'
import type { Mock } from 'vitest'
import { onTestFinished, vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { shopwareClientKey } from '../../src/inject'
import type { Operations } from '../../src/query/types/operations'

export type FetchMock = Mock<typeof fetch>

export function createQueryClient(config: ConstructorParameters<typeof QueryClient>[0] = {}) {
  return new QueryClient({
    ...config,
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function createShopwareClient(options: Partial<ShopwareClientOptions> = {}) {
  return new ShopwareClient<Operations>({
    baseURL: 'https://shop.test',
    apiKey: 'access-key',
    ...options,
  })
}

interface MountOptions {
  client?: ShopwareClient<Operations>
  queryClient?: QueryClient
  keyedQueryClients?: Record<string, QueryClient>
}

export function mountComposable<T>(composable: () => T, options: MountOptions = {}) {
  const client = options.client ?? createShopwareClient()
  const queryClient = options.queryClient ?? createQueryClient()
  const app = createApp({ render: () => null })

  app.use(VueQueryPlugin, { queryClient })
  for (const [queryClientKey, keyedClient] of Object.entries(options.keyedQueryClients ?? {})) {
    VueQueryPlugin.install(app, {
      queryClient: keyedClient,
      queryClientKey,
    })
  }
  app.provide(shopwareClientKey, client)

  const scope = effectScope()
  onTestFinished(() => {
    scope.stop()
    queryClient.clear()
  })

  const result = app.runWithContext(() => scope.run(composable)) as T

  return {
    result,
    client,
    queryClient,
  }
}

export function stubFetch(): FetchMock {
  const fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
  onTestFinished(() => {
    vi.unstubAllGlobals()
  })
  return fetchMock
}

interface JsonResponseInit {
  status?: number
  headers?: Record<string, string>
}

export function jsonResponse(body: unknown, init: JsonResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
}

type Route = (init: RequestInit) => Response | Promise<Response>

/**
 * Routes are keyed by method and store-api path, e.g. `'GET /context'`.
 */
export function routeFetch(fetchMock: FetchMock, routes: Record<string, Route>) {
  fetchMock.mockImplementation(async (input, init = {}) => {
    const path = new URL(String(input)).pathname.replace(/^\/store-api/, '')
    const route = routes[`${init.method} ${path}`]

    if (!route) {
      throw new Error(`Unexpected request: ${init.method} ${path}`)
    }

    return route(init)
  })
}

export function requestsTo(fetchMock: FetchMock, method: string, path: string) {
  return fetchMock.mock.calls
    .map(([input, init = {}]) => ({
      url: new URL(String(input)),
      init,
      headers: new Headers(init.headers),
      body: typeof init.body === 'string' ? JSON.parse(init.body) : undefined,
    }))
    .filter(({ url, init }) => init.method === method && url.pathname === `/store-api${path}`)
}

export function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve,
    reject,
  }
}

export function neverRespond(init: RequestInit) {
  return new Promise<Response>((_, reject) => {
    init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
  })
}
