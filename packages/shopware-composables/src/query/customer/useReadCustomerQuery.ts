import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { customerKeys } from '../../keys'
import { unrefOptions } from '../../util'
import type { OperationKey, OperationOptions } from '../types/query'
import { computed } from 'vue'

const readCustomer = 'readCustomer post /account/customer' satisfies OperationKey

export function useReadCustomerQueryOptions(
  options?: OperationOptions<typeof readCustomer>,
) {
  const client = useShopwareQueryClient()
  const queryKey = customerKeys.detail(computed(() => unrefOptions(options).body ?? {}))

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query(readCustomer, unrefOptions(options))
    },
  })
}

export function useReadCustomerQuery(
  options?: OperationOptions<typeof readCustomer>,
) {
  return useQuery(useReadCustomerQueryOptions(options))
}
