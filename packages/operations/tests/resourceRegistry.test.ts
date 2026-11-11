import { useQuery, type QueryKey } from '@tanstack/vue-query'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import {
  createTestApp, createTransport, loadOperations, type OperationsModule,
} from './harness'

let ops: OperationsModule
let stub: ReturnType<typeof createTransport>
let testApp: ReturnType<typeof createTestApp>

function project(id: number) {
  return {
    '@id': `/api/projects/${id}`,
    '@type': 'Project',
    'name': `Project ${id}`,
  }
}

function collection(...member: unknown[]) {
  return {
    '@id': '/api/projects',
    '@type': 'hydra:Collection',
    member,
    'totalItems': member.length,
  }
}

const responses: Record<string, unknown> = {
  '/api/projects': collection(project(1), project(2)),
  '/api/projects/1': project(1),
  '/api/projects/2': project(2),
  '/api/employees/5': {
    '@id': '/api/employees/5',
    '@type': 'Employee',
  },
  '/api/archived_projects': collection(),
  '/api/draft_projects': collection(),
}

beforeEach(async () => {
  ops = await loadOperations()
  stub = createTransport(request => responses[request.url])
  ops.setTransport(stub.transport)
  testApp = createTestApp()
})

afterEach(() => {
  testApp.dispose()
})

function sortedTypes(resources: Set<unknown>) {
  return [...resources].map(resource => (resource as [string, string]).join(' ')).sort()
}

describe('extractResourceTypes', () => {
  it('collects the @type of a resource together with the id from its @id', () => {
    expect([...ops.extractResourceTypes(project(12))]).toEqual([['Project', '12']])
  })

  it('walks collections and nested objects, skipping typed objects without an id', () => {
    const data = {
      ...collection(
        {
          ...project(1),
          owner: {
            '@id': '/api/employees/5',
            '@type': 'Employee',
          },
        },
        {
          ...project(2),
          tags: [
            {
              '@id': '/api/tags/7',
              '@type': 'Tag',
            },
          ],
        },
      ),
      view: {
        '@id': '/api/projects?page=1',
        '@type': 'hydra:PartialCollectionView',
      },
    }

    expect(sortedTypes(ops.extractResourceTypes(data))).toEqual(['Employee 5', 'Project 1', 'Project 2', 'Tag 7'])
  })

  it('prefers a string id property over the @id', () => {
    const data = {
      ...project(12),
      id: 'a1b2',
    }

    expect([...ops.extractResourceTypes(data)]).toEqual([['Project', 'a1b2']])
  })

  it('finds nothing in values that carry no resources', () => {
    expect(ops.extractResourceTypes(null).size).toBe(0)
    expect(ops.extractResourceTypes('Project').size).toBe(0)
    expect(ops.extractResourceTypes([]).size).toBe(0)
    expect(ops.extractResourceTypes({ '@type': 'Embedded' }).size).toBe(0)
  })
})

describe('invalidateResources', () => {
  function buildEndpoints() {
    return ops.createEndpoints({
      project: {
        list: ops.query<unknown>()
          .url('/api/projects')
          .build(),
        detail: ops.query<unknown>()
          .url('/api/projects/:id')
          .build(),
        archived: ops.query<unknown>()
          .url('/api/archived_projects')
          .resources('Project')
          .build(),
        drafts: ops.query<unknown>()
          .url('/api/draft_projects')
          .build(),
      },
      employee: {
        detail: ops.query<unknown>()
          .url('/api/employees/:id')
          .build(),
      },
    })
  }

  async function fetchAll() {
    const endpoints = buildEndpoints()
    await Promise.all(testApp.run(() => [
      endpoints.project.list(),
      endpoints.project.detail({ params: { id: '1' } }),
      endpoints.project.detail({ params: { id: '2' } }),
      endpoints.employee.detail({ params: { id: '5' } }),
    ]).map(options => testApp.queryClient.fetchQuery(options)))
  }

  function isInvalidated(queryKey: QueryKey) {
    return testApp.queryClient.getQueryState(queryKey)?.isInvalidated
  }

  it('invalidates every cached query holding a resource of the type', async () => {
    await fetchAll()

    await ops.invalidateResources(testApp.queryClient, 'Project')

    expect(isInvalidated(['project', 'list'])).toBe(true)
    expect(isInvalidated(['project', 'detail', { id: '1' }])).toBe(true)
    expect(isInvalidated(['project', 'detail', { id: '2' }])).toBe(true)
    expect(isInvalidated(['employee', 'detail', { id: '5' }])).toBe(false)
  })

  it('invalidates only the queries holding a specific instance', async () => {
    await fetchAll()

    await ops.invalidateResources(testApp.queryClient, ['Project', '1'])

    expect(isInvalidated(['project', 'list'])).toBe(true)
    expect(isInvalidated(['project', 'detail', { id: '1' }])).toBe(true)
    expect(isInvalidated(['project', 'detail', { id: '2' }])).toBe(false)
    expect(isInvalidated(['employee', 'detail', { id: '5' }])).toBe(false)
  })

  it('invalidates several resources at once', async () => {
    await fetchAll()

    await ops.invalidateResources(testApp.queryClient, 'Employee', ['Project', '2'])

    expect(isInvalidated(['project', 'list'])).toBe(true)
    expect(isInvalidated(['project', 'detail', { id: '1' }])).toBe(false)
    expect(isInvalidated(['project', 'detail', { id: '2' }])).toBe(true)
    expect(isInvalidated(['employee', 'detail', { id: '5' }])).toBe(true)
  })

  it('invalidates a query that holds the resource under query params', async () => {
    const endpoints = buildEndpoints()
    await testApp.queryClient.fetchQuery(testApp.run(() => endpoints.project.list({ queryParams: { page: 1 } })))

    await ops.invalidateResources(testApp.queryClient, ['Project', '1'])

    expect(isInvalidated(['project', 'list', { page: 1 }])).toBe(true)
  })

  it('invalidates a query that declared the resource up front, even when it returned none', async () => {
    const endpoints = buildEndpoints()
    await Promise.all(testApp.run(() => [
      endpoints.project.archived(),
      endpoints.project.drafts(),
    ]).map(options => testApp.queryClient.fetchQuery(options)))

    await ops.invalidateResources(testApp.queryClient, 'Project')

    expect(isInvalidated(['project', 'archived'])).toBe(true)
    expect(isInvalidated(['project', 'drafts'])).toBe(false)
  })

  it('invalidates entries seeded with setQueryDataWithResources, unlike plain setQueryData', async () => {
    const endpoints = buildEndpoints()
    const [seeded, plain] = testApp.run(() => [
      endpoints.project.detail({ params: { id: '8' } }).queryKey,
      endpoints.project.detail({ params: { id: '9' } }).queryKey,
    ])
    ops.setQueryDataWithResources(testApp.queryClient, seeded, project(8))
    testApp.queryClient.setQueryData(plain, project(9))

    await ops.invalidateResources(testApp.queryClient, 'Project')

    expect(testApp.queryClient.getQueryData(seeded)).toEqual(project(8))
    expect(isInvalidated(seeded)).toBe(true)
    expect(isInvalidated(plain)).toBe(false)
  })

  it('refetches active queries holding the resource', async () => {
    const endpoints = buildEndpoints()
    const result = testApp.run(() => useQuery(endpoints.project.detail({ params: { id: '1' } })))
    await vi.waitFor(() => expect(result.data.value).toEqual(project(1)))

    await ops.invalidateResources(testApp.queryClient, ['Project', '1'])

    expect(stub.requests.map(request => request.url)).toEqual(['/api/projects/1', '/api/projects/1'])
  })

  it('prunes index entries of queries that have left the cache', async () => {
    await fetchAll()
    testApp.queryClient.removeQueries({ queryKey: ['project', 'detail', { id: '1' }] })

    await ops.invalidateResources(testApp.queryClient, ['Project', '1'])

    const indexedKeys = [...ops.resourceIndex.get(ops.serializeResource(['Project', '1']))?.values() ?? []]
    expect(indexedKeys).toEqual([['project', 'list']])
  })
})
