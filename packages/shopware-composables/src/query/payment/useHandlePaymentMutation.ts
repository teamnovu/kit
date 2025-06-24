import { useMutation, UseMutationOptions } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { unrefOptions } from '../../util/unrefOptions'

const handlePaymentOperation = 'handlePaymentMethod post /handle-payment' satisfies OperationKey

export function useHandlePaymentMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof handlePaymentOperation>,
    unknown,
    OperationOptions<typeof handlePaymentOperation>
  >,
) {
  const client = useShopwareQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof handlePaymentOperation>) => {
      return client.query(handlePaymentOperation, unrefOptions(options))
    },
    onSuccess: (data, variables, context) => {
      unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
