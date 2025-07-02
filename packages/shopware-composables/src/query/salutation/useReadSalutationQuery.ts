import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { salutationKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const readSalutationOperation = 'readSalutation post /salutation' satisfies OperationKey

export const useReadSalutationQueryOptions = function useReadSalutationQueryOptions(
  options?: OperationOptions<typeof readSalutationOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = salutationKeys.list(options)

  return queryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const unrefedOptions = unrefOptions(options)

      return client.query(readSalutationOperation, {
        ...unrefedOptions,
        signal,
      })
    },
  })
}

export function useReadSalutationQuery(options?: OperationOptions<typeof readSalutationOperation>) {
  return useQuery(useReadSalutationQueryOptions(options))
}

