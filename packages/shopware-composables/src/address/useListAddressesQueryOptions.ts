import { queryOptions } from '@tanstack/vue-query'
import { MaybeRef } from 'vue'
import { useShopwareQueryClient } from '../inject'
import { addressKeys } from '../keys'
import type { OperationBody, OperationKey } from '../types/query'
import { operations } from '#store-types'

const listAddressOperation = 'listAddress post /account/list-address' satisfies OperationKey

export function useListAddressesQueryOptions<Operations extends operations>(
  body?: MaybeRef<OperationBody<Operations, typeof listAddressOperation>>,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryKey = addressKeys.list(body)

  return queryOptions({
    queryKey,
    queryFn: () => client.query(listAddressOperation, {
      body,
    }),
  })
}
