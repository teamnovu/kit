import type { operations } from '#store-types'
import { queryOptions } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../inject'
import { customerKeys } from '../keys'
import type { OperationBody, OperationKey } from '../types/query'

const readCustomer = 'readCustomer post /account/customer' satisfies OperationKey

export function useReadCustomerQueryOptions<Operations extends operations>(
  body?: MaybeRef<OperationBody<Operations, typeof readCustomer>>,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryKey = customerKeys.get()

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query(readCustomer, {
        body: unref(body),
      })
    },
  })
}
