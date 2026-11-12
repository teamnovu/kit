import {
  QueryClient, VueQueryPlugin, type QueryFunctionContext, type QueryKey,
} from '@tanstack/vue-query'
import { vi } from 'vitest'
import { createApp, effectScope, unref } from 'vue'
import type * as Operations from '../src/index'
import type {
  CustomFetch, CustomFetchInit, OperationsTransport, QueryFnFactory, QueryFnParams,
} from '../src/index'

export type OperationsModule = typeof Operations

/**
 * Imports a fresh copy of the package, so `resourceIndex` and the module-level transport start empty.
 */
export async function loadOperations(): Promise<OperationsModule> {
  vi.resetModules()
  return import('../src/index')
}

export interface QueryRequest {
  url: string
  queryParams: Record<string, unknown> | undefined
  options: Omit<RequestInit, 'signal'> | undefined
  body: unknown
  queryKey: QueryKey
}

/**
 * Transport stub that records each request with its parameters resolved at fetch time.
 */
export function createTransport(
  respond: (request: QueryRequest) => unknown = () => ({}),
  respondToMutation: (url: string, init?: CustomFetchInit) => unknown = () => ({}),
) {
  const requests: QueryRequest[] = []

  const query = vi.fn((...[url, queryParams, options, body]: QueryFnParams) => async ({ queryKey }: QueryFunctionContext) => {
    const request: QueryRequest = {
      url: unref(url),
      queryParams: unref(queryParams),
      options: unref(options),
      body: unref(body),
      queryKey,
    }
    requests.push(request)
    return respond(request)
  })
  const mutation = vi.fn(async (url: string, init?: CustomFetchInit) => respondToMutation(url, init))

  const transport: OperationsTransport = {
    query: query as unknown as QueryFnFactory,
    mutation: mutation as unknown as CustomFetch,
  }

  return {
    transport,
    query,
    mutation,
    requests,
  }
}

export function createTestApp() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  const scope = effectScope()

  return {
    app,
    queryClient,
    /** Runs `fn` with the app's injection context inside an effect scope, like a component's `setup()`. */
    run: <T>(fn: () => T): T => app.runWithContext(() => scope.run(fn) as T),
    dispose: () => {
      scope.stop()
      queryClient.clear()
    },
  }
}

export function macrotask() {
  return new Promise(resolve => setTimeout(resolve, 0))
}
