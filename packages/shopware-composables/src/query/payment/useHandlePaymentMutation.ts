import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import type { UseMutationOptions } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { unrefOptions } from '../../util/unrefOptions'
import { useShopwareMutation } from '../../util/useShopwareQuery'
import { cartKeys } from '../../keys'

const handlePaymentOperation = 'handlePaymentMethod post /handle-payment' satisfies OperationKey

export function useHandlePaymentMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof handlePaymentOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof handlePaymentOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof handlePaymentOperation>) => {
      return client.query(handlePaymentOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: cartKeys.get() })

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
