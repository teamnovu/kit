import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cartKeys, contextKeys, customerKeys, paymentKeys, shippingKeys } from '../src/keys'
import { useReadContextQuery } from '../src/query/context/useReadContextQuery'
import { useUpdateContextMutation } from '../src/query/context/useUpdateContextMutation'
import { clearProvidedArgs, providedArgs } from './helpers/mutationCallbacks'
import {
  createQueryClient,
  jsonResponse,
  mountComposable,
  neverRespond,
  requestsTo,
  routeFetch,
  stubFetch,
} from './helpers/setup'

vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const { withRecordedMutationCallbacks } = await import('./helpers/mutationCallbacks')
  return withRecordedMutationCallbacks(await importOriginal())
})

const updated = { contextToken: 'context-token' }

beforeEach(() => {
  clearProvidedArgs()
})

describe('useUpdateContextMutation', () => {
  it('patches the context with the given body', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'PATCH /context': () => jsonResponse(updated) })

    const { result } = mountComposable(() => useUpdateContextMutation())

    await expect(result.mutateAsync({ languageId: 'language-id' })).resolves.toEqual(updated)
    expect(requestsTo(fetchMock, 'PATCH', '/context')[0].body).toEqual({ languageId: 'language-id' })
  })

  it('cancels a running context fetch before sending the update', async () => {
    const fetchMock = stubFetch()
    let contextRequests = 0
    let firstFetchAbortedBeforePatch: boolean | undefined
    routeFetch(fetchMock, {
      'GET /context': (init) => {
        contextRequests += 1
        return contextRequests === 1 ? neverRespond(init) : jsonResponse({ token: 'fresh' })
      },
      'PATCH /context': () => {
        firstFetchAbortedBeforePatch = requestsTo(fetchMock, 'GET', '/context')[0].init.signal?.aborted
        return jsonResponse(updated)
      },
    })

    const { result } = mountComposable(() => ({
      contextQuery: useReadContextQuery(),
      updateContext: useUpdateContextMutation(),
    }))
    await vi.waitFor(() => expect(contextRequests).toBe(1))

    await result.updateContext.mutateAsync({ languageId: 'language-id' })

    expect(firstFetchAbortedBeforePatch).toBe(true)
    await vi.waitFor(() => expect(result.contextQuery.data.value).toEqual({ token: 'fresh' }))
  })

  it('invalidates context, cart, payment and shipping method queries', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'PATCH /context': () => jsonResponse(updated) })
    const queryClient = createQueryClient()
    queryClient.setQueryData(contextKeys.all(), {})
    queryClient.setQueryData(cartKeys.get(), {})
    queryClient.setQueryData(paymentKeys.list({ onlyAvailable: true }), [])
    queryClient.setQueryData(shippingKeys.list({ onlyAvailable: true }), [])
    queryClient.setQueryData(customerKeys.detail(undefined), {})

    const { result } = mountComposable(() => useUpdateContextMutation(), { queryClient })
    await result.mutateAsync({ languageId: 'language-id' })

    expect(queryClient.getQueryState(contextKeys.all())?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(cartKeys.get())?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(paymentKeys.list({ onlyAvailable: true }))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(shippingKeys.list({ onlyAvailable: true }))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(customerKeys.detail(undefined))?.isInvalidated).toBe(false)
  })

  it('forwards every argument vue-query passes to onSuccess', async () => {
    const fetchMock = stubFetch()
    routeFetch(fetchMock, { 'PATCH /context': () => jsonResponse(updated) })
    const onSuccess = vi.fn()

    const { result } = mountComposable(() => useUpdateContextMutation({ onSuccess }))
    await result.mutateAsync({ languageId: 'language-id' })

    expect(providedArgs.onSuccess).toHaveLength(1)
    expect(onSuccess.mock.calls).toEqual(providedArgs.onSuccess)
  })
})
