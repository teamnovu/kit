import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { seoUrlKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const readSeoUrlOperation = 'readSeoUrl post /seo-url' satisfies OperationKey

export const useReadSeoUrlQueryOptions = function useReadSeoUrlQueryOptions(
  options?: OperationOptions<typeof readSeoUrlOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = seoUrlKeys.list(options)

  return queryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const unrefedOptions = unrefOptions(options)

      return client.query(readSeoUrlOperation, {
        ...unrefedOptions,
        signal,
      })
    },
  })
}

export function useReadSeoUrlQuery(options?: OperationOptions<typeof readSeoUrlOperation>) {
  return useQuery(useReadSeoUrlQueryOptions(options))
}

