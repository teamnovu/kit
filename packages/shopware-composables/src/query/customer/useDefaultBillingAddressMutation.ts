import type { UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { contextKeys, customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import { useShopwareMutation } from '../../util/useShopwareQuery'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const defaultBillingAddressOperation = 'defaultBillingAddress patch /account/address/default-billing/{addressId}' satisfies OperationKey

export function useDefaultBillingAddressMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof defaultBillingAddressOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof defaultBillingAddressOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof defaultBillingAddressOperation>) => {
      return client.query(defaultBillingAddressOperation, unrefOptions(options))
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
