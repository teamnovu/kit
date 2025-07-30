import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { contextKeys, customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const defaultShippingAddressOperation = 'defaultShippingAddress patch /account/address/default-shipping/{addressId}' satisfies OperationKey

export function useDefaultShippingAddressMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof defaultShippingAddressOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof defaultShippingAddressOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof defaultShippingAddressOperation>) => {
      return client.query(defaultShippingAddressOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerKeys.all() }),
        queryClient.invalidateQueries({ queryKey: contextKeys.all() }),
      ])

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
