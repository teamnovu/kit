import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cartKeys, contextKeys, paymentKeys, shippingKeys } from '../src/keys'
import { useAddLineItemMutation } from '../src/query/cart/useAddLineItemMutation'
import { clearProvidedArgs, providedArgs } from './helpers/mutationCallbacks'
import {
  createQueryClient,
  jsonResponse,
  mountComposable,
  requestsTo,
  routeFetch,
  stubFetch,
} from './helpers/setup'

vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const { withRecordedMutationCallbacks } = await import('./helpers/mutationCallbacks')
  return withRecordedMutationCallbacks(await importOriginal())
})

const items = [
  {
    id: 'product-1',
    referencedId: 'product-1',
    quantity: 2,
    type: 'product',
  },
]

const cart = {
  apiAlias: 'cart',
  token: 'cart-token',
  lineItems: items,
}

beforeEach(() => {
  clearProvidedArgs()
})

describe('useAddLineItemMutation', () => {
  it('posts the line items and stores the returned cart under the cart key', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'POST /checkout/cart/line-item': () => jsonResponse(cart) })

    const { result, queryClient } = mountComposable(() => useAddLineItemMutation())

    await expect(result.mutateAsync({ items })).resolves.toEqual(cart)
    expect(requestsTo(fetchMock, 'POST', '/checkout/cart/line-item')[0].body).toEqual({ items })
    expect(queryClient.getQueryData(cartKeys.get())).toEqual(cart)
  })

  it('invalidates the payment and shipping method lists only', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'POST /checkout/cart/line-item': () => jsonResponse(cart) })
    const queryClient = createQueryClient()
    queryClient.setQueryData(paymentKeys.list({ onlyAvailable: true }), [])
    queryClient.setQueryData(shippingKeys.list({ onlyAvailable: true }), [])
    queryClient.setQueryData(contextKeys.all(), {})
    queryClient.setQueryData(cartKeys.get(), {})

    const { result } = mountComposable(() => useAddLineItemMutation(), { queryClient })
    await result.mutateAsync({ items })

    expect(queryClient.getQueryState(paymentKeys.list({ onlyAvailable: true }))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(shippingKeys.list({ onlyAvailable: true }))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(contextKeys.all())?.isInvalidated).toBe(false)
    expect(queryClient.getQueryState(cartKeys.get())?.isInvalidated).toBe(false)
  })

  it('forwards every argument vue-query passes to onSuccess, after updating the cart', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'POST /checkout/cart/line-item': () => jsonResponse(cart) })
    const queryClient = createQueryClient()
    let cartSeenByCallback: unknown
    const onSuccess = vi.fn(() => {
      cartSeenByCallback = queryClient.getQueryData(cartKeys.get())
    })

    const { result } = mountComposable(() => useAddLineItemMutation({ onSuccess }), { queryClient })
    await result.mutateAsync({ items })

    expect(providedArgs.onSuccess).toHaveLength(1)
    expect(onSuccess.mock.calls).toEqual(providedArgs.onSuccess)
    expect(cartSeenByCallback).toEqual(cart)
  })

  it('passes the remaining mutation options through to vue-query', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, {
      'POST /checkout/cart/line-item': () => jsonResponse({ errors: [] }, { status: 400 }),
    })
    const onError = vi.fn()

    const { result, queryClient } = mountComposable(() => useAddLineItemMutation({ onError }))

    await expect(result.mutateAsync({ items })).rejects.toBeInstanceOf(ShopwareApiError)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toMatchObject({ status: 400 })
    expect(queryClient.getQueryData(cartKeys.get())).toBeUndefined()
  })
})
