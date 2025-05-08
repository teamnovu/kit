import type { operations } from '#store-types'
import { queryOptions } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../inject'
import { contextKeys } from '../keys'
import type { OperationKey } from '../types/query'

const readContextOperation = 'readContext get /context' satisfies OperationKey

export function useContextOptions<Operations extends operations>() {
  const client = useShopwareQueryClient<Operations>()

  return queryOptions({
    queryKey: contextKeys.all(),
    queryFn: () => client.query(readContextOperation),
  })
}
