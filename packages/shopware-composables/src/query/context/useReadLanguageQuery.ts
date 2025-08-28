import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { languageKey } from '../../keys'
import { unrefOptions } from '../../util'
import type { OperationKey, OperationOptions } from '../types/query'

const readLanguageOperation = 'readLanguages post /language' satisfies OperationKey

export function useReadLanguageQueryOptions(
  options?: OperationOptions<typeof readLanguageOperation>,
) {
  const client = useShopwareQueryClient()

  return queryOptions({
    queryKey: languageKey.all(),
    queryFn: ({ signal }) =>
      client.query(readLanguageOperation, {
        ...unrefOptions(options),
        signal,
      }),
  })
}

export function useReadLanguageQuery(
  options?: OperationOptions<typeof readLanguageOperation>,
) {
  return useQuery(useReadLanguageQueryOptions(options))
}
