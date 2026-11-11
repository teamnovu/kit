import { describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../src/inject'
import { cartKeys, contextKeys } from '../src/keys'
import { useAddLineItemMutation } from '../src/query/cart/useAddLineItemMutation'
import { useReadContextQuery } from '../src/query/context/useReadContextQuery'
import {
  createQueryClient,
  createShopwareClient,
  jsonResponse,
  mountComposable,
  routeFetch,
  stubFetch,
} from './helpers/setup'

describe('useShopwareQueryClient', () => {
  it('returns the provided shopware client', () => {
    const client = createShopwareClient()

    const { result } = mountComposable(() => useShopwareQueryClient(), { client })

    expect(result).toBe(client)
  })

  it('throws when no shopware client is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const app = createApp({ render: () => null })

    expect(() => app.runWithContext(() => useShopwareQueryClient())).toThrow('Shopware client not provided!')
    warn.mockRestore()
  })
})

describe('useShopwareVueQueryClient', () => {
  it('returns the default QueryClient when the client has no queryClientId', () => {
    const queryClient = createQueryClient()

    const { result } = mountComposable(() => useShopwareVueQueryClient(), {
      queryClient,
      keyedQueryClients: { shopware: createQueryClient() },
    })

    expect(result).toBe(queryClient)
  })

  it('returns the QueryClient registered under the client queryClientId', () => {
    const shopwareQueryClient = createQueryClient()

    const { result } = mountComposable(() => useShopwareVueQueryClient(), {
      client: createShopwareClient({ queryClientId: 'shopware' }),
      keyedQueryClients: {
        shopware: shopwareQueryClient,
        other: createQueryClient(),
      },
    })

    expect(result).toBe(shopwareQueryClient)
  })
})

describe('queryClientId routing', () => {
  it('runs shopware queries and mutations on the QueryClient selected by queryClientId', async () => {
    const context = { token: 'context-token' }
    const cart = { token: 'cart-token' }
    const fetchMock = stubFetch()
    routeFetch(fetchMock, {
      'GET /context': () => jsonResponse(context),
      'POST /checkout/cart/line-item': () => jsonResponse(cart),
    })
    const defaultQueryClient = createQueryClient()
    const shopwareQueryClient = createQueryClient()

    const { result } = mountComposable(() => ({
      contextQuery: useReadContextQuery(),
      addLineItem: useAddLineItemMutation(),
    }), {
      client: createShopwareClient({ queryClientId: 'shopware' }),
      queryClient: defaultQueryClient,
      keyedQueryClients: { shopware: shopwareQueryClient },
    })

    await vi.waitFor(() => expect(result.contextQuery.data.value).toEqual(context))
    await result.addLineItem.mutateAsync({ items: [] })

    expect(shopwareQueryClient.getQueryData(contextKeys.all())).toEqual(context)
    expect(shopwareQueryClient.getQueryData(cartKeys.get())).toEqual(cart)
    expect(defaultQueryClient.getQueryCache().getAll()).toHaveLength(0)
    expect(defaultQueryClient.getMutationCache().getAll()).toHaveLength(0)
  })
})
