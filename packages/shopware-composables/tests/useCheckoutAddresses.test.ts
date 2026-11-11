import { describe, expect, it, vi } from 'vitest'
import { useCheckoutAddresses } from '../src/helpers/checkout/useCheckoutAddresses'
import type { Schemas } from '../src/query/types/operations'
import type { FetchMock } from './helpers/setup'
import { deferred, jsonResponse, mountComposable, requestsTo, routeFetch, stubFetch } from './helpers/setup'

const addressA = {
  id: 'address-a',
  firstName: 'Ada',
} as Schemas['CustomerAddress']

const addressB = {
  id: 'address-b',
  firstName: 'Bob',
} as Schemas['CustomerAddress']

/**
 * Context requests after the first one wait for the returned deferred.
 */
function stubCheckoutApi(fetchMock: FetchMock) {
  const refetch = deferred<void>()
  const addresses: Record<string, Schemas['CustomerAddress']> = {
    [addressA.id]: addressA,
    [addressB.id]: addressB,
  }
  const customer = {
    activeBillingAddress: addressA,
    activeShippingAddress: addressA,
  }
  let contextRequests = 0

  routeFetch(fetchMock, {
    'GET /context': async () => {
      contextRequests += 1
      if (contextRequests > 1) {
        await refetch.promise
      }
      return jsonResponse({ customer })
    },
    'PATCH /context': (init) => {
      const { billingAddressId, shippingAddressId } = JSON.parse(String(init.body))
      if (billingAddressId) {
        customer.activeBillingAddress = addresses[billingAddressId]
      }
      if (shippingAddressId) {
        customer.activeShippingAddress = addresses[shippingAddressId]
      }
      return jsonResponse({ contextToken: 'context-token' })
    },
    'POST /account/list-address': () => jsonResponse({ elements: [addressA, addressB] }),
  })

  return refetch
}

async function mountCheckoutAddresses() {
  const mounted = mountComposable(() => useCheckoutAddresses())
  await vi.waitFor(() => expect(mounted.result.activeBillingAddress.value).toEqual(addressA))
  return mounted
}

describe('useCheckoutAddresses', () => {
  it('resolves setBillingAddress once the refetched context is loaded and nothing is saving', async () => {
    const fetchMock = stubFetch()
    const refetch = stubCheckoutApi(fetchMock)
    const { result } = await mountCheckoutAddresses()

    let settled = false
    const saving = result.setBillingAddress(addressB).then(() => {
      settled = true
    })

    await vi.waitFor(() => expect(requestsTo(fetchMock, 'GET', '/context')).toHaveLength(2))
    await vi.waitFor(() => expect(result.isSaving.value).toBe(true))
    expect(settled).toBe(false)

    refetch.resolve()
    await saving

    expect(result.isSaving.value).toBe(false)
    expect(result.activeBillingAddress.value).toEqual(addressB)
    expect(result.inactiveBillingAddresses.value).toEqual([addressA])
    expect(requestsTo(fetchMock, 'PATCH', '/context')[0].body).toEqual({ billingAddressId: 'address-b' })
  })

  it('resolves setShippingAddress with the updated context and nothing saving', async () => {
    const fetchMock = stubFetch()
    stubCheckoutApi(fetchMock).resolve()
    const { result } = await mountCheckoutAddresses()

    await result.setShippingAddress(addressB)

    expect(result.isSaving.value).toBe(false)
    expect(result.activeShippingAddress.value).toEqual(addressB)
    expect(result.inactiveShippingAddresses.value).toEqual([addressA])
    expect(requestsTo(fetchMock, 'PATCH', '/context')[0].body).toEqual({ shippingAddressId: 'address-b' })
  })

  it('resolves concurrent updates only once nothing is saving any more', async () => {
    const fetchMock = stubFetch()
    const refetch = stubCheckoutApi(fetchMock)
    const { result } = await mountCheckoutAddresses()

    const billing = result.setBillingAddress(addressB).then(() => result.isSaving.value)
    const shipping = result.setShippingAddress(addressB).then(() => result.isSaving.value)

    await vi.waitFor(() => expect(requestsTo(fetchMock, 'PATCH', '/context')).toHaveLength(2))
    refetch.resolve()

    expect(await billing).toBe(false)
    expect(await shipping).toBe(false)
    expect(result.activeBillingAddress.value).toEqual(addressB)
    expect(result.activeShippingAddress.value).toEqual(addressB)
  })
})
