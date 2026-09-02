import { shopwareQueryOptions } from '../../util/shopwareQueryOptions'
import { useShopwareQueryClient } from '../../inject'
import { useShopwareQuery } from '../../util/useShopwareQuery'
import { countryKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const readCountryOperation = 'readCountry post /country' satisfies OperationKey

export const useReadCountryQueryOptions = function useReadCountryQueryOptions(
  options?: OperationOptions<typeof readCountryOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = countryKeys.list(options)

  return shopwareQueryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const unrefedOptions = unrefOptions(options)

      return client.query(readCountryOperation, {
        ...unrefedOptions,
        signal,
      })
    },
  })
}

export function useReadCountryQuery(options?: OperationOptions<typeof readCountryOperation>) {
  return useShopwareQuery(useReadCountryQueryOptions(options))
}

