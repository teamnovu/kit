import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { contextKeys } from '../../keys'
import type { OperationKey } from '../types/query'

const readContextOperation = 'readContext get /context' satisfies OperationKey

export function useReadContext() {
  const client = useShopwareQueryClient()

  return queryOptions({
    queryKey: contextKeys.all(),
    queryFn: ({ signal }) => client.query(readContextOperation, { signal }),
  })
}

export function useReadContextQuery() {
  return useQuery(useReadContext())
}
