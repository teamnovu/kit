import { QueryKey, queryOptions } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../inject'
import { OperationKey, OperationOptions } from '../query/types/query'
import { unrefOptions } from './unrefOptions'

type QueryKeySelector<K extends OperationKey> = (options?: OperationOptions<K>) => QueryKey

export function createQueryOptions<K extends OperationKey>(
  operation: K,
  queryKeySelector: QueryKeySelector<K>,
) {
  return (options?: OperationOptions<K>) => {
    const client = useShopwareQueryClient()
    const queryKey = queryKeySelector(options)

    return queryOptions({
      queryKey,
      queryFn: async () => {
        return client.query(operation, unrefOptions(options))
      },
    })
  }
}
