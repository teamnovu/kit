import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { customerKeys } from '../../keys'
import { unrefOptions } from '../../util'
import type { OperationKey, OperationOptions } from '../types/query'
import { computed } from 'vue'

const imitateCustomerLoginKey = 'imitateCustomerLogin post /account/login/imitate-customer' satisfies OperationKey

export function useImitateCustomerLoginQueryOptions(
  options?: OperationOptions<typeof imitateCustomerLoginKey>,
) {
  const client = useShopwareQueryClient()
  const queryKey = customerKeys.imitateLogin(computed(() => unrefOptions(options).body ?? {}))

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query(imitateCustomerLoginKey, unrefOptions(options))
    },
  })
}

export function useImitateCustomerLoginQuery(
  options?: OperationOptions<typeof imitateCustomerLoginKey>,
) {
  return useQuery(useImitateCustomerLoginQueryOptions(options))
}
