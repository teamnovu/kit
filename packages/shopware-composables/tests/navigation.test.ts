import { describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { navigationKeys } from '../src/keys'
import { useReadNavigationQuery, useReadNavigationQueryOptions } from '../src/query/navigation/useReadNavigationQuery'
import type { FetchMock } from './helpers/setup'
import { jsonResponse, mountComposable, neverRespond, requestsTo, stubFetch } from './helpers/setup'

function respondWithPath(fetchMock: FetchMock) {
  fetchMock.mockImplementation(async input => jsonResponse([{ path: new URL(String(input)).pathname }]))
}

describe('useReadNavigationQuery', () => {
  it('posts to /navigation/{activeId}/{rootId} with the given body', async () => {
    const fetchMock = stubFetch()
    respondWithPath(fetchMock)

    const { result } = mountComposable(() => useReadNavigationQuery('main', 'root', { body: { depth: 2 } }))

    await vi.waitFor(() => expect(result.data.value).toEqual([{ path: '/store-api/navigation/main/root' }]))
    const [request] = requestsTo(fetchMock, 'POST', '/navigation/main/root')
    expect(request.body).toEqual({ depth: 2 })
  })

  it('builds query keys rooted at shopware/navigation/detail', () => {
    stubFetch()

    const { result } = mountComposable(() => useReadNavigationQueryOptions('main', 'root'))

    expect(result.queryKey.slice(0, 3)).toEqual(['shopware', 'navigation', 'detail'])
  })

  it('caches the result under navigationKeys.detail of the unwrapped params', async () => {
    const fetchMock = stubFetch()
    respondWithPath(fetchMock)

    const { result, queryClient } = mountComposable(() => useReadNavigationQuery(ref('main'), ref('root')))

    await vi.waitFor(() => expect(result.data.value).toBeDefined())
    expect(queryClient.getQueryData(navigationKeys.detail('main', 'root', undefined))).toEqual(result.data.value)
    expect(queryClient.getQueryCache().findAll({ queryKey: navigationKeys.details() })).toHaveLength(1)
  })

  it('fetches the new URL under a new key when a param ref changes', async () => {
    const fetchMock = stubFetch()
    respondWithPath(fetchMock)
    const activeId = ref('main')

    const { result, queryClient } = mountComposable(() => useReadNavigationQuery(activeId, 'root'))
    await vi.waitFor(() => expect(result.data.value).toEqual([{ path: '/store-api/navigation/main/root' }]))

    activeId.value = 'footer'

    await vi.waitFor(() => expect(result.data.value).toEqual([{ path: '/store-api/navigation/footer/root' }]))
    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
      'https://shop.test/store-api/navigation/main/root',
      'https://shop.test/store-api/navigation/footer/root',
    ])
    expect(queryClient.getQueryData(navigationKeys.detail('main', 'root', undefined)))
      .toEqual([{ path: '/store-api/navigation/main/root' }])
    expect(queryClient.getQueryData(navigationKeys.detail('footer', 'root', undefined)))
      .toEqual([{ path: '/store-api/navigation/footer/root' }])
  })

  it('refetches with the new body when a ref inside the options changes', async () => {
    const fetchMock = stubFetch()
    respondWithPath(fetchMock)
    const depth = ref(1)
    const body = computed(() => ({ depth: depth.value }))

    mountComposable(() => useReadNavigationQuery('main', 'root', { body }))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    depth.value = 2

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(requestsTo(fetchMock, 'POST', '/navigation/main/root').map(request => request.body)).toEqual([
      { depth: 1 },
      { depth: 2 },
    ])
  })

  it('forwards the query abort signal to the request', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockImplementation((_, init = {}) => neverRespond(init))

    const { queryClient } = mountComposable(() => useReadNavigationQuery('main', 'root'))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [{ init }] = requestsTo(fetchMock, 'POST', '/navigation/main/root')

    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(init.signal?.aborted).toBe(false)

    await queryClient.cancelQueries({ queryKey: navigationKeys.all() })

    expect(init.signal?.aborted).toBe(true)
  })
})
