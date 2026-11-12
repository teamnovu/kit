import type { QueryClient, UseMutationOptions } from '@tanstack/vue-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useOptimistic } from '../src/util/useOptimistic'
import { useShopwareMutation } from '../src/util/useShopwareQuery'
import { clearProvidedArgs, providedArgs } from './helpers/mutationCallbacks'
import { createQueryClient, deferred, mountComposable } from './helpers/setup'

vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const { withRecordedMutationCallbacks } = await import('./helpers/mutationCallbacks')
  return withRecordedMutationCallbacks(await importOriginal())
})

const listKey = ['shopware', 'wishlist']

function createListQueryClient() {
  const queryClient = createQueryClient()
  queryClient.setQueryData(listKey, ['a'])
  return queryClient
}

function mountOptimisticMutation(
  queryClient: QueryClient,
  mutationFn: (item: string) => Promise<unknown>,
  options?: UseMutationOptions<unknown, unknown, string, unknown>,
) {
  return mountComposable(() => useShopwareMutation({
    mutationFn,
    ...useOptimistic<string[], string>(listKey, (item, list) => [...list, item], options),
  }), { queryClient }).result
}

beforeEach(() => {
  clearProvidedArgs()
})

describe('useOptimistic', () => {
  it('cancels running queries for the key before applying the update', async () => {
    const queryClient = createListQueryClient()
    let refetchSignal: AbortSignal | undefined
    const refetch = queryClient.fetchQuery({
      queryKey: listKey,
      queryFn: ({ signal }) => {
        refetchSignal = signal
        return new Promise<string[]>(() => {})
      },
    }).catch(() => undefined)
    const pending = deferred<unknown>()

    const mutation = mountOptimisticMutation(queryClient, () => pending.promise)
    const done = mutation.mutateAsync('b')

    await vi.waitFor(() => expect(queryClient.getQueryData(listKey)).toEqual(['a', 'b']))
    expect(refetchSignal?.aborted).toBe(true)

    pending.resolve(undefined)
    await Promise.all([done, refetch])
  })

  it('applies the update to the cache while the mutation runs', async () => {
    const queryClient = createListQueryClient()
    const pending = deferred<unknown>()
    const onMutate = vi.fn()

    const mutation = mountOptimisticMutation(queryClient, () => pending.promise, { onMutate })
    const done = mutation.mutateAsync('b')

    await vi.waitFor(() => expect(queryClient.getQueryData(listKey)).toEqual(['a', 'b']))
    expect(onMutate.mock.calls).toEqual(providedArgs.onMutate)

    pending.resolve(undefined)
    await done
  })

  it('rolls back to the snapshot and forwards the error when the mutation fails', async () => {
    const queryClient = createListQueryClient()
    const error = new Error('failed')
    const onError = vi.fn()

    const mutation = mountOptimisticMutation(queryClient, () => Promise.reject(error), { onError })

    await expect(mutation.mutateAsync('b')).rejects.toBe(error)
    expect(queryClient.getQueryData(listKey)).toEqual(['a'])
    expect(onError.mock.calls).toEqual(providedArgs.onError)
    expect(onError.mock.calls[0][0]).toBe(error)
    expect(onError.mock.calls[0][2]).toEqual({ previousValue: ['a'] })
  })

  it('invalidates the key and forwards onSettled after success', async () => {
    const queryClient = createListQueryClient()
    const onSettled = vi.fn()

    const mutation = mountOptimisticMutation(queryClient, () => Promise.resolve('saved'), { onSettled })
    await mutation.mutateAsync('b')

    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryData(listKey)).toEqual(['a', 'b'])
    expect(onSettled.mock.calls).toEqual(providedArgs.onSettled)
  })

  it('invalidates the key after a failure', async () => {
    const queryClient = createListQueryClient()

    const mutation = mountOptimisticMutation(queryClient, () => Promise.reject(new Error('failed')))

    await expect(mutation.mutateAsync('b')).rejects.toThrow('failed')
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true)
  })
})
