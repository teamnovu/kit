import type {
  DataTag,
  QueryFunction,
  QueryKey,
  UndefinedInitialQueryOptions,
} from '@tanstack/vue-query'
import { queryOptions } from '@tanstack/vue-query'

/**
 * Query options for a shopware operation: standard vue-query options whose
 * queryKey carries the response type as a DataTag.
 *
 * The alias gives the declaration emitter a name to print. With an inferred
 * `queryOptions(...)` return type, the emitter expands tanstack's DataTag into
 * `[dataTagSymbol]` computed properties WITHOUT importing the symbols — a
 * broken declaration that skipLibCheck hides. Consumers then fail to match
 * the DataTag overload of useShopwareQuery and fall into deep generic
 * inference, which hits TS2589 on large generated Operations types.
 */
export type ShopwareQueryOptions<TQueryKey extends QueryKey, TResponse> =
  UndefinedInitialQueryOptions<TResponse, Error, TResponse, TQueryKey> & {
    queryKey: DataTag<TQueryKey, TResponse, Error>
  }

/**
 * Drop-in replacement for vue-query's `queryOptions` used by the
 * use*QueryOptions helpers, with an annotated return type (see
 * ShopwareQueryOptions).
 */
export function shopwareQueryOptions<TQueryKey extends QueryKey, TResponse>(options: {
  queryKey: TQueryKey
  queryFn: QueryFunction<TResponse, TQueryKey>
}): ShopwareQueryOptions<TQueryKey, TResponse> {
  // queryOptions cannot relate DeepUnwrapRef<TQueryKey> to the unresolved
  // TQueryKey; it is an identity function at runtime, so the casts are safe.
  return queryOptions(options as never) as ShopwareQueryOptions<TQueryKey, TResponse>
}
