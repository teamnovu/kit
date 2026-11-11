import { describe, expect, it, vi } from 'vitest'
import { cartKeys, contextKeys, customerKeys } from '../src/keys'
import { useReadContextQuery } from '../src/query/context/useReadContextQuery'
import { useLoginCustomerMutation } from '../src/query/customer/useLoginCustomerMutation'
import {
  createQueryClient,
  createShopwareClient,
  jsonResponse,
  mountComposable,
  requestsTo,
  routeFetch,
  stubFetch,
} from './helpers/setup'

const credentials = {
  username: 'customer@example.com',
  password: 'secret',
}

function loginResponse(headers: Record<string, string> = { 'sw-context-token': 'customer-token' }) {
  return jsonResponse({ contextToken: 'customer-token' }, { headers })
}

describe('useLoginCustomerMutation', () => {
  it('posts the credentials and resolves the response body', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'POST /account/login': () => loginResponse() })

    const { result } = mountComposable(() => useLoginCustomerMutation())

    await expect(result.mutateAsync(credentials)).resolves.toEqual({ contextToken: 'customer-token' })
    expect(requestsTo(fetchMock, 'POST', '/account/login')[0].body).toEqual(credentials)
  })

  it('adopts the sw-context-token response header even when the client does not reflect tokens', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'POST /account/login': () => loginResponse() })
    const client = createShopwareClient({
      contextToken: 'guest-token',
      reflectContextToken: false,
    })
    const onContextToken = vi.fn()
    client.on('contextToken', onContextToken)

    const { result } = mountComposable(() => useLoginCustomerMutation(), { client })
    await result.mutateAsync(credentials)

    expect(client.contextToken).toBe('customer-token')
    expect(onContextToken.mock.calls.map(([event]) => event.detail)).toEqual(['customer-token'])
  })

  it('keeps the current token when the response carries none', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'POST /account/login': () => loginResponse({}) })
    const client = createShopwareClient({ contextToken: 'guest-token' })

    const { result } = mountComposable(() => useLoginCustomerMutation(), { client })
    await result.mutateAsync(credentials)

    expect(client.contextToken).toBe('guest-token')
  })

  it('resets context queries and invalidates cart and customer queries', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'POST /account/login': () => loginResponse() })
    const queryClient = createQueryClient()
    queryClient.setQueryData(contextKeys.all(), { token: 'guest-token' })
    queryClient.setQueryData(cartKeys.get(), {})
    queryClient.setQueryData(customerKeys.detail(undefined), {})

    const { result } = mountComposable(() => useLoginCustomerMutation(), { queryClient })
    await result.mutateAsync(credentials)

    expect(queryClient.getQueryData(contextKeys.all())).toBeUndefined()
    expect(queryClient.getQueryState(cartKeys.get())?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(customerKeys.detail(undefined))?.isInvalidated).toBe(true)
  })

  it('refetches an active context query with the new token', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, {
      'GET /context': init => jsonResponse({ token: new Headers(init.headers).get('sw-context-token') }),
      'POST /account/login': () => loginResponse(),
    })
    const client = createShopwareClient({
      contextToken: 'guest-token',
      reflectContextToken: false,
    })

    const { result } = mountComposable(() => ({
      contextQuery: useReadContextQuery(),
      login: useLoginCustomerMutation(),
    }), { client })
    await vi.waitFor(() => expect(result.contextQuery.data.value).toEqual({ token: 'guest-token' }))

    await result.login.mutateAsync(credentials)

    await vi.waitFor(() => expect(result.contextQuery.data.value).toEqual({ token: 'customer-token' }))
    expect(requestsTo(fetchMock, 'GET', '/context').map(({ headers }) => headers.get('sw-context-token')))
      .toEqual(['guest-token', 'customer-token'])
  })
})
