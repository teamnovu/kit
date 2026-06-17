import type { MutationFunction, QueryFunction, QueryKey } from '@tanstack/vue-query'
import { type InjectionKey, type MaybeRef, inject } from 'vue'

/**
 * The two transport halves are deliberately *not* the same shape — queries and
 * mutations have genuinely different needs (deferred signal handling vs. method
 * negotiation, body/filter ingestion, custom headers). They share only the
 * injection mechanism: the consumer wires both up in a single `provide`.
 */

type QueryMutationParams = string[][] | Record<string, string> | string | URLSearchParams

export type CustomFetchInit = Omit<NonNullable<RequestInit>, 'body'> & {
  query?: QueryMutationParams
  body?: unknown
} | undefined

export type CustomFetch = <T = unknown>(url: string, init?: CustomFetchInit) => Promise<T>

export type QueryFnParams = [
  url: MaybeRef<string>,
  queryParams?: MaybeRef<Record<string, unknown> | undefined>,
  options?: MaybeRef<Omit<RequestInit, 'signal'>>,
]

/**
 * Query transport. A *factory* that returns a `QueryFunction`, so the actual fetch
 * can read `context.signal` at execution time. Params are known up front.
 */
export type QueryFnFactory = <T = unknown, K extends QueryKey = QueryKey>(
  ...params: QueryFnParams
) => QueryFunction<T, K>

export interface OperationsTransport {
  query: QueryFnFactory
  mutation: CustomFetch
}

export const transportKey: InjectionKey<OperationsTransport> = Symbol('operations:transport')

/**
 * Module-level fallback for the transport. Used when no `inject` context is
 * available — e.g. endpoints invoked imperatively outside `setup()` (router
 * guards, async handlers, bootstrap prefetch). Safe for client-only SPAs; for
 * SSR prefer `app.provide(transportKey, …)` so the transport stays request-scoped.
 */
let moduleTransport: OperationsTransport | null = null

/** Registers the module-level fallback transport. */
export function setTransport(transport: OperationsTransport): void {
  moduleTransport = transport
}

/**
 * Resolves the transport at endpoint-invocation time. Prefers an injected
 * transport (request-scoped), falling back to the module-level one. Throws if neither is set.
 */
export function useTransport(): OperationsTransport {
  const transport = inject(transportKey, null) ?? moduleTransport
  if (!transport) {
    throw new Error(
      '[operations] No transport provided. Call setTransport({ query, mutation }) or '
      + 'app.provide(transportKey, { query, mutation }) before invoking endpoints.',
    )
  }
  return transport
}

export function makeQueryFn<T = unknown, K extends QueryKey = QueryKey>(
  ...params: QueryFnParams
): QueryFunction<T, K> {
  return useTransport().query<T, K>(...params)
}

export function useMutationFn<TResult, TParams>(
  fn: (call: CustomFetch, params: TParams) => Promise<TResult>,
): MutationFunction<TResult, TParams> {
  const { mutation } = useTransport()
  return (params: TParams) => fn(mutation, params)
}
