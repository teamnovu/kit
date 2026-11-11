import { useQuery } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'
import { contextKeys } from '../src/keys'
import { useReadContextQuery } from '../src/query/context/useReadContextQuery'
import { NonShopwareQueryCache } from '../src/util/nonShopwareQueryCache'
import {
  createQueryClient,
  createShopwareClient,
  jsonResponse,
  mountComposable,
  routeFetch,
  stubFetch,
} from './helpers/setup'

describe('NonShopwareQueryCache with useQuery', () => {
  it('throws when useQuery issues a shopware query on the guarded client', () => {
    const queryClient = createQueryClient({ queryCache: new NonShopwareQueryCache() })
    const queryFn = vi.fn(() => Promise.resolve('data'))

    expect(() => mountComposable(() => useQuery({
      queryKey: ['shopware', 'context'],
      queryFn,
    }), { queryClient })).toThrow(/non-shopware QueryClient/)
    expect(queryFn).not.toHaveBeenCalled()
  })

  it('lets useQuery run non-shopware queries on the guarded client', async () => {
    const queryClient = createQueryClient({ queryCache: new NonShopwareQueryCache() })

    const { result } = mountComposable(() => useQuery({
      queryKey: ['statamic', 'page'],
      queryFn: () => Promise.resolve('page'),
    }), { queryClient })

    await vi.waitFor(() => expect(result.data.value).toBe('page'))
  })

  it('reports shopware keys from useQuery to a custom handler and still runs the query', async () => {
    const onShopwareKey = vi.fn()
    const queryClient = createQueryClient({ queryCache: new NonShopwareQueryCache({ onShopwareKey }) })

    const { result } = mountComposable(() => useQuery({
      queryKey: ['shopware', 'context'],
      queryFn: () => Promise.resolve('data'),
    }), { queryClient })

    await vi.waitFor(() => expect(result.data.value).toBe('data'))
    expect(onShopwareKey).toHaveBeenCalledWith(['shopware', 'context'])
  })

  it('does not interfere with shopware composables bound to a keyed shopware QueryClient', async () => {
    const context = { token: 'context-token' }
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'GET /context': () => jsonResponse(context) })
    const guardedQueryClient = createQueryClient({ queryCache: new NonShopwareQueryCache() })
    const shopwareQueryClient = createQueryClient()

    const { result } = mountComposable(() => useReadContextQuery(), {
      client: createShopwareClient({ queryClientId: 'shopware' }),
      queryClient: guardedQueryClient,
      keyedQueryClients: { shopware: shopwareQueryClient },
    })

    await vi.waitFor(() => expect(result.data.value).toEqual(context))
    expect(shopwareQueryClient.getQueryData(contextKeys.all())).toEqual(context)
    expect(guardedQueryClient.getQueryCache().getAll()).toHaveLength(0)
  })
})
