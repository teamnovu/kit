import { queryOptions, useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { addressKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const listAddressOperation = 'listAddress post /account/list-address' satisfies OperationKey

export function useListAddressQueryOptions(
  options?: OperationOptions<typeof listAddressOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = addressKeys.list(computed(() => unrefOptions(options)?.body))

  return queryOptions({
    queryKey,
    queryFn: () => client.query(listAddressOperation, unrefOptions(options)),
  })
}

export function useListAddressQuery(
  options?: OperationOptions<typeof listAddressOperation>,
) {
  return useQuery(useListAddressQueryOptions(options))
}
