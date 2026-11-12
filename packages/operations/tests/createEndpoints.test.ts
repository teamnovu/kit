import type { QueryKey } from '@tanstack/vue-query'
import {
  afterEach, beforeEach, describe, expect, it,
} from 'vitest'
import { isRef, ref, unref } from 'vue'
import {
  createTestApp, createTransport, loadOperations, type OperationsModule,
} from './harness'

let ops: OperationsModule
let testApp: ReturnType<typeof createTestApp>

beforeEach(async () => {
  ops = await loadOperations()
  ops.setTransport(createTransport(request => ({ url: request.url })).transport)
  testApp = createTestApp()
})

afterEach(() => {
  testApp.dispose()
})

function buildTree() {
  const update = ops.mutation<unknown, { name: string }>()
    .url('/api/projects/:id')
    .build(() => ({ options: { method: 'PATCH' } }))
  const endpoints = ops.createEndpoints({
    project: {
      list: ops.query<unknown>()
        .url('/api/projects')
        .build(() => ({ staleTime: 1000 })),
      detail: ops.query<unknown>()
        .url('/api/projects/:id')
        .build(),
      update,
    },
    company: {
      process: {
        detail: ops.query<unknown>()
          .url('/api/processes/:processId')
          .build(),
      },
    },
  })

  return {
    endpoints,
    update,
  }
}

describe('createEndpoints', () => {
  it('exposes the nesting path as $invalidateKey on every level', () => {
    const { endpoints } = buildTree()

    expect(endpoints.$invalidateKey).toEqual([])
    expect(endpoints.project.$invalidateKey).toEqual(['project'])
    expect(endpoints.project.detail.$invalidateKey).toEqual(['project', 'detail'])
    expect(endpoints.company.$invalidateKey).toEqual(['company'])
    expect(endpoints.company.process.$invalidateKey).toEqual(['company', 'process'])
    expect(endpoints.company.process.detail.$invalidateKey).toEqual(['company', 'process', 'detail'])
  })

  it('prefixes every query key with the nesting path', () => {
    const { endpoints } = buildTree()

    testApp.run(() => {
      expect(endpoints.project.list().queryKey).toEqual(['project', 'list'])
      expect(endpoints.project.list({ queryParams: { page: 2 } }).queryKey).toEqual(['project', 'list', { page: 2 }])
      expect(endpoints.project.detail({ params: { id: '12' } }).queryKey).toEqual(['project', 'detail', { id: '12' }])
      expect(endpoints.company.process.detail({ params: { processId: '3' } }).queryKey).toEqual(['company', 'process', 'detail', { processId: '3' }])
    })
  })

  it('prefixes the call-time $invalidateKey, with refs resolved', () => {
    const { endpoints } = buildTree()
    const id = ref('12')

    const options = testApp.run(() => endpoints.project.detail({ params: { id } }))

    expect(options.$invalidateKey).toEqual(['project', 'detail', { id: '12' }])
    expect(isRef((options.queryKey[2] as { id: unknown }).id)).toBe(true)
  })

  it('keeps the remaining query options of each endpoint', () => {
    const { endpoints } = buildTree()

    const options = testApp.run(() => endpoints.project.list())

    expect(options.staleTime).toBe(1000)
    expect(options.queryFn).toBeTypeOf('function')
    expect(unref(options.enabled)).toBe(true)
  })

  it('passes mutation endpoints through unchanged', () => {
    const { endpoints, update } = buildTree()

    expect(endpoints.project.update).toBe(update)
    expect(endpoints.project.update).not.toHaveProperty('$invalidateKey')
  })

  it('invalidates a single call, an endpoint or a whole branch by key prefix', async () => {
    const { endpoints } = buildTree()
    const { queryClient } = testApp
    await Promise.all(testApp.run(() => [
      endpoints.project.list(),
      endpoints.project.detail({ params: { id: '1' } }),
      endpoints.project.detail({ params: { id: '2' } }),
      endpoints.company.process.detail({ params: { processId: '3' } }),
    ]).map(options => queryClient.fetchQuery(options)))
    const invalidated = () => queryClient.getQueryCache()
      .findAll({ predicate: query => query.state.isInvalidated })
      .map(query => query.queryKey)
    const sorted = (keys: QueryKey[]) => keys.map(key => JSON.stringify(key)).sort()

    await queryClient.invalidateQueries({ queryKey: testApp.run(() => endpoints.project.detail({ params: { id: '1' } })).$invalidateKey })
    expect(sorted(invalidated())).toEqual(sorted([['project', 'detail', { id: '1' }]]))

    await queryClient.invalidateQueries({ queryKey: endpoints.project.detail.$invalidateKey })
    expect(sorted(invalidated())).toEqual(sorted([
      ['project', 'detail', { id: '1' }],
      ['project', 'detail', { id: '2' }],
    ]))

    await queryClient.invalidateQueries({ queryKey: endpoints.project.$invalidateKey })
    expect(sorted(invalidated())).toEqual(sorted([
      ['project', 'list'],
      ['project', 'detail', { id: '1' }],
      ['project', 'detail', { id: '2' }],
    ]))
  })
})
