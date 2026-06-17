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

export function useTransport(): OperationsTransport {
  const transport = inject(transportKey, null)
  if (!transport) {
    throw new Error(
      '[operations] No transport provided. Call app.provide(transportKey, { query, mutation }) '
      + '(or use the Nuxt plugin) before invoking endpoints.',
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
