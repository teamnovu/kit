import { useMutation, type MutationFunctionContext } from '@tanstack/vue-query'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import { ref } from 'vue'
import {
  createTestApp, createTransport, loadOperations, type OperationsModule,
} from './harness'

interface Project {
  '@id': string
  '@type': string
  'name': string
}

interface ProjectInput {
  name: string
}

let ops: OperationsModule
let stub: ReturnType<typeof createTransport>
let testApp: ReturnType<typeof createTestApp>

const savedProject: Project = {
  '@id': '/api/projects/1',
  '@type': 'Project',
  'name': 'kit',
}

beforeEach(async () => {
  ops = await loadOperations()
  stub = createTransport(request => ({ url: request.url }), () => savedProject)
  ops.setTransport(stub.transport)
  testApp = createTestApp()
})

afterEach(() => {
  testApp.dispose()
})

describe('mutation', () => {
  it('posts the body to the interpolated url by default', async () => {
    const update = ops.mutation<Project, ProjectInput>()
      .url('/api/projects/:id')
      .build()
    const { mutateAsync } = testApp.run(() => useMutation(update()))

    const data = await mutateAsync({
      params: { id: '1' },
      body: { name: 'kit' },
    })

    expect(data).toEqual(savedProject)
    expect(stub.mutation).toHaveBeenCalledOnce()
    expect(stub.mutation).toHaveBeenCalledWith('/api/projects/1', {
      method: 'POST',
      body: { name: 'kit' },
    })
  })

  it('resolves ref path params when the mutation runs', async () => {
    const update = ops.mutation<Project, ProjectInput>()
      .url('/api/projects/:id')
      .build()
    const id = ref('1')
    const { mutateAsync } = testApp.run(() => useMutation(update()))

    id.value = '7'
    await mutateAsync({
      params: { id },
      body: { name: 'kit' },
    })

    expect(stub.mutation).toHaveBeenCalledWith('/api/projects/7', expect.anything())
  })

  it('takes the method and further request options from the builder', async () => {
    const update = ops.mutation<Project, ProjectInput>()
      .url('/api/projects/:id')
      .build(() => ({
        options: {
          method: 'PATCH',
          credentials: 'include',
        },
      }))
    const { mutateAsync } = testApp.run(() => useMutation(update()))

    await mutateAsync({
      params: { id: '1' },
      body: { name: 'kit' },
    })

    expect(stub.mutation).toHaveBeenCalledWith('/api/projects/1', {
      method: 'PATCH',
      credentials: 'include',
      body: { name: 'kit' },
    })
  })

  it('merges per-call request options over the builder options', async () => {
    const update = ops.mutation<Project, ProjectInput>()
      .url('/api/projects/:id')
      .build(() => ({
        options: {
          method: 'PATCH',
          credentials: 'include',
        },
      }))
    const { mutateAsync } = testApp.run(() => useMutation(update({
      credentials: 'omit',
      headers: { 'X-Auth': 'token' },
    })))

    await mutateAsync({
      params: { id: '1' },
      body: { name: 'kit' },
    })

    expect(stub.mutation).toHaveBeenCalledWith('/api/projects/1', {
      method: 'PATCH',
      credentials: 'omit',
      headers: { 'X-Auth': 'token' },
      body: { name: 'kit' },
    })
  })

  it('reads per-call options passed as a ref when the mutation runs', async () => {
    const create = ops.mutation<Project, ProjectInput>()
      .url('/api/projects')
      .build()
    const options = ref<RequestInit>({ headers: { 'X-Auth': 'old' } })
    const { mutateAsync } = testApp.run(() => useMutation(create(options)))

    options.value = { headers: { 'X-Auth': 'new' } }
    await mutateAsync({ body: { name: 'kit' } })

    expect(stub.mutation).toHaveBeenCalledWith('/api/projects', {
      method: 'POST',
      headers: { 'X-Auth': 'new' },
      body: { name: 'kit' },
    })
  })

  it('transforms the unwrapped input with params() before sending', async () => {
    const received: unknown[] = []
    const update = ops.mutation<Project, ProjectInput>()
      .url('/api/projects/:id')
      .params((input) => {
        received.push(input)
        return {
          ...input,
          body: { name: input.body.name.trim() },
        }
      })
      .build()
    const { mutateAsync } = testApp.run(() => useMutation(update()))

    await mutateAsync({
      params: { id: ref('1') },
      body: { name: '  kit  ' },
    })

    expect(received).toHaveLength(1)
    expect(received[0]).toEqual({
      params: { id: '1' },
      body: { name: '  kit  ' },
    })
    expect(stub.mutation).toHaveBeenCalledWith('/api/projects/1', {
      method: 'POST',
      body: { name: 'kit' },
    })
  })

  it('keeps factory callbacks and gets the vue-query mutation context', async () => {
    const onSuccess = vi.fn()
    const update = ops.mutation<Project, ProjectInput>()
      .url('/api/projects/:id')
      .build(() => ({ onSuccess }))
    const { mutateAsync } = testApp.run(() => useMutation(update()))

    await mutateAsync({
      params: { id: '1' },
      body: { name: 'kit' },
    })

    expect(onSuccess).toHaveBeenCalledOnce()
    const [data, variables, , context] = onSuccess.mock.calls[0] as [Project, unknown, unknown, MutationFunctionContext]
    expect(data).toEqual(savedProject)
    expect(variables).toEqual({
      params: { id: '1' },
      body: { name: 'kit' },
    })
    expect(context.client).toBe(testApp.queryClient)
  })

  it('invalidates resources from onSuccess through the mutation context', async () => {
    const endpoints = ops.createEndpoints({
      project: {
        detail: ops.query<unknown>()
          .url('/api/projects/:id')
          .build(),
        update: ops.mutation<Project, ProjectInput>()
          .url('/api/projects/:id')
          .build(() => ({
            options: { method: 'PATCH' },
            onSuccess: (_data, _variables, _onMutateResult, context) => ops.invalidateResources(context.client, 'Project'),
          })),
      },
    })
    stub = createTransport(() => savedProject, () => savedProject)
    ops.setTransport(stub.transport)
    const detail = testApp.run(() => endpoints.project.detail({ params: { id: '1' } }))
    await testApp.queryClient.fetchQuery(detail)
    const { mutateAsync } = testApp.run(() => useMutation(endpoints.project.update()))

    await mutateAsync({
      params: { id: '1' },
      body: { name: 'kit' },
    })

    expect(testApp.queryClient.getQueryState(['project', 'detail', { id: '1' }])?.isInvalidated).toBe(true)
  })
})
