import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { addressKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'

const createCustomerAddressOperation = 'createCustomerAddress post /account/address' satisfies OperationKey

export function useCreateCustomerAddressMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof createCustomerAddressOperation>,
    unknown,
    OperationOptions<typeof createCustomerAddressOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof createCustomerAddressOperation>) => {
      return client.query(createCustomerAddressOperation, unrefOptions(options))
    },
    onSuccess: (data, variables, context) => {
      // Invalidate address list queries to refetch data
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() })

      unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
