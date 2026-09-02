import { shopwareQueryOptions } from '../../util/shopwareQueryOptions'
import { useShopwareQueryClient } from '../../inject'
import { useShopwareQuery } from '../../util/useShopwareQuery'
import { contextKeys } from '../../keys'
import type { OperationKey, OperationOptions } from '../types/query'
import { unrefOptions } from '../../util'

const readContextOperation = 'readContext get /context' satisfies OperationKey

export function useReadContextQueryOptions(
  options?: OperationOptions<typeof readContextOperation>,
) {
  const client = useShopwareQueryClient()

  return shopwareQueryOptions({
    queryKey: contextKeys.all(),
    queryFn: ({ signal }) =>
      client.query(readContextOperation, {
        ...unrefOptions(options),
        signal,
      }),
  })
}

export function useReadContextQuery(
  options?: OperationOptions<typeof readContextOperation>,
) {
  return useShopwareQuery(useReadContextQueryOptions(options))
}
