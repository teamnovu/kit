import { operations } from '#store-types'
import { useMutation } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../inject'
import { OperationKey } from '../types/query'

const updateContextOperation = 'updateContext patch /context' satisfies OperationKey

export function useContextUpdate<Operations extends operations>() {
  const client = useShopwareQueryClient<Operations>()

  return useMutation({
    mutationFn: async () => {
      return client.query(updateContextOperation)
    },
  })
}
