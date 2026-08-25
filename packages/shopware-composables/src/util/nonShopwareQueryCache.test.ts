import { QueryClient } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'
import { NonShopwareQueryCache, isShopwareQueryKey } from './nonShopwareQueryCache'

function createClient(cache: NonShopwareQueryCache) {
  return new QueryClient({
    queryCache: cache,
    defaultOptions: { queries: { retry: false } },
  })
}

describe('isShopwareQueryKey', () => {
  it('detects keys rooted in the shopware namespace', () => {
    expect(isShopwareQueryKey(['shopware', 'context'])).toBe(true)
    expect(isShopwareQueryKey(['statamic', 'page'])).toBe(false)
    expect(isShopwareQueryKey([])).toBe(false)
  })
})

describe('NonShopwareQueryCache', () => {
  it('throws when a shopware query is built on the guarded client', () => {
    const client = createClient(new NonShopwareQueryCache())

    expect(() => client.fetchQuery({
      queryKey: ['shopware', 'context'],
      queryFn: () => Promise.resolve('data'),
    })).toThrow(/non-shopware QueryClient/)
  })

  it('rejects shopware keys on setQueryData as well', () => {
    const client = createClient(new NonShopwareQueryCache())

    expect(() => client.setQueryData(['shopware', 'cart'], {})).toThrow(/non-shopware QueryClient/)
  })

  it('lets non-shopware queries through', async () => {
    const client = createClient(new NonShopwareQueryCache())

    await expect(
      client.fetchQuery({
        queryKey: ['statamic', 'page'],
        queryFn: () => Promise.resolve('data'),
      }),
    ).resolves.toBe('data')
  })

  it('supports a custom violation handler instead of throwing', async () => {
    const onShopwareKey = vi.fn()
    const client = createClient(new NonShopwareQueryCache({ onShopwareKey }))

    await expect(
      client.fetchQuery({
        queryKey: ['shopware', 'context'],
        queryFn: () => Promise.resolve('data'),
      }),
    ).resolves.toBe('data')

    expect(onShopwareKey).toHaveBeenCalledWith(['shopware', 'context'])
  })
})
