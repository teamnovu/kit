import type { DefaultError, QueryClient, QueryKey, QueryOptions, QueryState } from '@tanstack/vue-query'
import { QueryCache } from '@tanstack/vue-query'
import { shopwareKeys } from '../keys'

export function isShopwareQueryKey(queryKey: QueryKey) {
  return queryKey[0] === shopwareKeys.all()[0]
}

type QueryCacheConfig = ConstructorParameters<typeof QueryCache>[0]

export interface NonShopwareQueryCacheConfig {
  /**
   * Called when a shopware query key reaches this cache.
   * Defaults to throwing an error.
   */
  onShopwareKey?: (queryKey: QueryKey) => void
}

function throwOnShopwareKey(queryKey: QueryKey): never {
  throw new Error(
    `Shopware query ${JSON.stringify(queryKey)} was issued on a non-shopware QueryClient. `
    + 'Pass the shopware query client explicitly, e.g. useQuery(options, useShopwareVueQueryClient()).',
  )
}

/**
 * QueryCache for QueryClients that must NOT hold shopware queries.
 *
 * When an app runs the shopware queries on a dedicated QueryClient (via
 * `ShopwareClient`'s `queryClientId`), a plain `useQuery(shopwareOptions)`
 * silently lands on the default client and bypasses the shopware cache,
 * invalidation and context handling. Installing this cache on the default
 * client turns that mistake into an immediate error:
 *
 * ```ts
 * const queryClient = new QueryClient({ queryCache: new NonShopwareQueryCache() })
 * ```
 *
 * Every `useQuery`, `ensureQueryData`, `fetchQuery`, `setQueryData` and
 * hydration passes through `QueryCache.build`, so all entry points are covered.
 */
export class NonShopwareQueryCache extends QueryCache {
  private readonly onShopwareKey: (queryKey: QueryKey) => void

  constructor(config?: QueryCacheConfig & NonShopwareQueryCacheConfig) {
    const { onShopwareKey, ...cacheConfig } = config ?? {}
    super(cacheConfig)
    this.onShopwareKey = onShopwareKey ?? throwOnShopwareKey
  }

  build<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    client: QueryClient,
    options: QueryOptions<TQueryFnData, TError, TData, TQueryKey> & { queryKey: TQueryKey },
    state?: QueryState<TData, TError>,
  ) {
    if (isShopwareQueryKey(options.queryKey)) {
      this.onShopwareKey(options.queryKey)
    }

    return super.build(client, options, state)
  }
}
