import { useQuery } from '@tanstack/vue-query'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import {
  computed, isRef, ref, unref, type Ref,
} from 'vue'
import {
  createTestApp, createTransport, loadOperations, macrotask, type OperationsModule,
} from './harness'

interface Echo {
  url: string
}

let ops: OperationsModule
let stub: ReturnType<typeof createTransport>
let testApp: ReturnType<typeof createTestApp>

beforeEach(async () => {
  ops = await loadOperations()
  stub = createTransport(request => ({ url: request.url }))
  ops.setTransport(stub.transport)
  testApp = createTestApp()
})

afterEach(() => {
  testApp.dispose()
})

describe('query', () => {
  describe('url', () => {
    it('interpolates :params into the url', async () => {
      const task = ops.query<Echo>()
        .url('/api/projects/:projectId/tasks/:taskId')
        .build()

      const data = await testApp.queryClient.fetchQuery(testApp.run(() => task({
        params: {
          projectId: '1',
          taskId: '2',
        },
      })))

      expect(data).toEqual({ url: '/api/projects/1/tasks/2' })
    })

    it('inserts param values verbatim, so a param can carry a whole IRI', async () => {
      const anyIri = ops.query<Echo>()
        .url(':iri')
        .build()

      const data = await testApp.queryClient.fetchQuery(testApp.run(() => anyIri({ params: { iri: '/api/projects/1' } })))

      expect(data).toEqual({ url: '/api/projects/1' })
    })

    it('calls a url function with the resolved params', async () => {
      const exportProject = ops.query<Echo>()
        .url((params: { id: string | undefined }) => `/api/projects/${params.id}/export`)
        .build()

      const data = await testApp.queryClient.fetchQuery(testApp.run(() => exportProject({ params: { id: ref('7') } })))

      expect(data).toEqual({ url: '/api/projects/7/export' })
    })

    it('hands query params, the body and merged request options to the transport', async () => {
      const search = ops.query<Echo>()
        .url('/api/projects/search')
        .build(() => ({
          options: {
            method: 'POST',
            credentials: 'include',
          },
        }))

      await testApp.queryClient.fetchQuery(testApp.run(() => search(
        {
          queryParams: { page: ref(2) },
          body: ref({ name: 'kit' }),
        },
        {
          credentials: 'omit',
          headers: { 'X-Auth': 'token' },
        },
      )))

      expect(stub.requests).toHaveLength(1)
      expect(stub.requests[0]).toMatchObject({
        url: '/api/projects/search',
        queryParams: { page: 2 },
        body: { name: 'kit' },
        options: {
          method: 'POST',
          credentials: 'omit',
          headers: { 'X-Auth': 'token' },
        },
      })
    })
  })

  describe('query key', () => {
    it('is built from params, body and query params, skipping missing sections', () => {
      const detail = ops.query<Echo>()
        .url('/api/projects/:id')
        .build()
      const list = ops.query<Echo>()
        .url('/api/projects')
        .build()

      testApp.run(() => {
        expect(detail({
          params: { id: '1' },
          body: { fields: ['name'] },
          queryParams: { page: 1 },
        }).queryKey).toEqual([{ id: '1' }, { fields: ['name'] }, { page: 1 }])
        expect(detail({
          params: { id: '1' },
          queryParams: { page: 1 },
        }).queryKey).toEqual([{ id: '1' }, { page: 1 }])
        expect(list({ queryParams: { page: 1 } }).queryKey).toEqual([{ page: 1 }])
        expect(list().queryKey).toEqual([])
      })
    })

    it('keeps refs in queryKey and snapshots their values into $invalidateKey', () => {
      const detail = ops.query<Echo>()
        .url('/api/projects/:id')
        .build()
      const id = ref('1')
      const status = ref('open')

      const options = testApp.run(() => detail({
        params: { id },
        queryParams: { status },
      }))
      id.value = '2'
      status.value = 'closed'

      const [params, queryParams] = options.queryKey as [{ id: Ref<string> }, { status: Ref<string> }]
      expect(params.id).toBe(id)
      expect(queryParams.status).toBe(status)
      expect(options.$invalidateKey).toEqual([{ id: '1' }, { status: 'open' }])
    })

    it('refetches under the new key when a param ref changes', async () => {
      const endpoints = ops.createEndpoints({
        project: {
          detail: ops.query<Echo>()
            .url('/api/projects/:id')
            .build(),
        },
      })
      const id = ref('1')

      const result = testApp.run(() => useQuery(endpoints.project.detail({ params: { id } })))
      await vi.waitFor(() => expect(result.data.value).toEqual({ url: '/api/projects/1' }))
      id.value = '2'
      await vi.waitFor(() => expect(result.data.value).toEqual({ url: '/api/projects/2' }))

      expect(stub.requests.map(request => request.queryKey)).toEqual([
        ['project', 'detail', { id: '1' }],
        ['project', 'detail', { id: '2' }],
      ])
      expect(testApp.queryClient.getQueryData(['project', 'detail', { id: '1' }])).toEqual({ url: '/api/projects/1' })
    })
  })

  describe('enabled', () => {
    it('is disabled until every path param has a value', () => {
      const task = ops.query<Echo>()
        .url('/api/projects/:projectId/tasks/:taskId')
        .build()
      const projectId = ref<string | undefined>('1')
      const taskId = ref<string | undefined>()

      const options = testApp.run(() => task({
        params: {
          projectId,
          taskId,
        },
      }))

      expect(unref(options.enabled)).toBe(false)
      taskId.value = '2'
      expect(unref(options.enabled)).toBe(true)
      projectId.value = null as unknown as undefined
      expect(unref(options.enabled)).toBe(false)
    })

    it('is enabled for an endpoint without path params', () => {
      const list = ops.query<Echo>()
        .url('/api/projects')
        .build()

      expect(unref(testApp.run(() => list()).enabled)).toBe(true)
    })

    it('requires both the factory enabled and the path params', () => {
      const allowed = ref(false)
      const detail = ops.query<Echo>()
        .url('/api/projects/:id')
        .build(() => ({ enabled: allowed }))
      const id = ref<string | undefined>()

      const options = testApp.run(() => detail({ params: { id } }))

      expect(unref(options.enabled)).toBe(false)
      id.value = '1'
      expect(unref(options.enabled)).toBe(false)
      allowed.value = true
      expect(unref(options.enabled)).toBe(true)
      id.value = undefined
      expect(unref(options.enabled)).toBe(false)
    })

    it('hands the call-site params to the factory', () => {
      const postalCode = ops.query<Echo>()
        .url('/api/postal_codes')
        .build(params => ({ enabled: computed(() => !!unref(unref(params.queryParams)?.code)) }))
      const code = ref('')

      const options = testApp.run(() => postalCode({ queryParams: { code } }))

      expect(unref(options.enabled)).toBe(false)
      code.value = '8000'
      expect(unref(options.enabled)).toBe(true)
    })

    it('does not fetch while disabled and fetches once the params are present', async () => {
      const detail = ops.query<Echo>()
        .url('/api/projects/:id')
        .build()
      const id = ref<string | undefined>()

      const result = testApp.run(() => useQuery(detail({ params: { id } })))
      await macrotask()

      expect(stub.requests).toEqual([])
      expect(result.fetchStatus.value).toBe('idle')

      id.value = '5'
      await vi.waitFor(() => expect(result.data.value).toEqual({ url: '/api/projects/5' }))
      expect(stub.requests).toHaveLength(1)
    })
  })

  describe('params()', () => {
    it('normalizes the plain bag before it becomes the url and the query key', async () => {
      const received: unknown[] = []
      const list = ops.query<Echo>()
        .url('/api/projects')
        .params((bag) => {
          received.push(bag)
          return {
            queryParams: {
              ...bag.queryParams,
              'order[createdAt]': 'desc',
            },
          }
        })
        .build()
      const name = ref('kit')
      const normalized = {
        'name': 'kit',
        'order[createdAt]': 'desc',
      }

      const options = testApp.run(() => list({ queryParams: { name } }))
      await testApp.queryClient.fetchQuery(options)

      expect(received[0]).toEqual({ queryParams: { name: 'kit' } })
      expect(stub.requests[0].queryParams).toEqual(normalized)
      expect(stub.requests[0].queryKey).toEqual([normalized])

      name.value = 'ops'
      expect(unref((options.queryKey as unknown[])[0])).toEqual({
        ...normalized,
        name: 'ops',
      })
    })
  })

  describe('toFetchOptions', () => {
    it('unwraps top-level refs', () => {
      const detail = ops.query<Echo>()
        .url('/api/projects/:id')
        .build(() => ({ staleTime: ref(1000) }))

      const options = testApp.run(() => detail({ params: { id: ref<string | undefined>() } }))
      const plain = ops.toFetchOptions(options)

      expect(isRef(options.enabled)).toBe(true)
      expect(plain.enabled).toBe(false)
      expect(plain.staleTime).toBe(1000)
      expect(plain.queryFn).toBe(options.queryFn)
    })

    it('produces options fetchQuery accepts', async () => {
      const endpoints = ops.createEndpoints({
        project: {
          detail: ops.query<Echo>()
            .url('/api/projects/:id')
            .build(),
        },
      })

      const options = testApp.run(() => endpoints.project.detail({ params: { id: ref('3') } }))
      const data = await testApp.queryClient.fetchQuery(ops.toFetchOptions(options))

      expect(data).toEqual({ url: '/api/projects/3' })
      expect(testApp.queryClient.getQueryData(['project', 'detail', { id: '3' }])).toEqual(data)
    })
  })

  describe('queryFn', () => {
    it('runs the factory queryFn of an endpoint without url', async () => {
      const settings = ops.query<{ theme: string }>().build(() => ({ queryFn: () => ({ theme: 'dark' }) }))

      const data = await testApp.queryClient.fetchQuery(testApp.run(() => settings()))

      expect(data).toEqual({ theme: 'dark' })
      expect(stub.requests).toEqual([])
    })

    it('fetches through the transport when the endpoint has a url', async () => {
      const list = ops.query<Echo>()
        .url('/api/projects')
        .build(() => ({ queryFn: () => ({ url: 'factory' }) }))

      const data = await testApp.queryClient.fetchQuery(testApp.run(() => list()))

      expect(data).toEqual({ url: '/api/projects' })
    })
  })
})
