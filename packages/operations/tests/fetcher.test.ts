import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import {
  createTestApp, createTransport, loadOperations, type OperationsModule,
} from './harness'

const missingTransport = '[operations] No transport provided.'

let ops: OperationsModule
let testApp: ReturnType<typeof createTestApp>

beforeEach(async () => {
  ops = await loadOperations()
  testApp = createTestApp()
})

afterEach(() => {
  testApp.dispose()
  vi.restoreAllMocks()
})

describe('useTransport', () => {
  it('throws when no transport is registered', () => {
    expect(() => testApp.run(() => ops.useTransport())).toThrow(missingTransport)
  })

  it('falls back to the module transport inside an injection context', () => {
    const { transport } = createTransport()
    ops.setTransport(transport)

    expect(testApp.run(() => ops.useTransport())).toBe(transport)
  })

  it('prefers a provided transport over the module transport', () => {
    const provided = createTransport().transport
    ops.setTransport(createTransport().transport)
    testApp.app.provide(ops.transportKey, provided)

    expect(testApp.run(() => ops.useTransport())).toBe(provided)
  })

  it('uses the module transport outside of any injection context', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { transport } = createTransport()
    ops.setTransport(transport)

    expect(ops.useTransport()).toBe(transport)
  })
})

describe('endpoint transport resolution', () => {
  it('resolves the transport when an endpoint is called, not when it is built', async () => {
    const list = ops.query<unknown>()
      .url('/api/projects')
      .build()
    const create = ops.mutation<unknown, unknown>()
      .url('/api/projects')
      .build()

    expect(() => testApp.run(() => list())).toThrow(missingTransport)
    expect(() => testApp.run(() => create())).toThrow(missingTransport)

    const stub = createTransport()
    ops.setTransport(stub.transport)
    await testApp.queryClient.fetchQuery(testApp.run(() => list()))

    expect(stub.requests).toHaveLength(1)
  })

  it('keeps the transport resolved at call time for the later fetch', async () => {
    const list = ops.query<unknown>()
      .url('/api/projects')
      .build()
    const provided = createTransport()
    const moduleLevel = createTransport()
    ops.setTransport(moduleLevel.transport)
    testApp.app.provide(ops.transportKey, provided.transport)

    const options = testApp.run(() => list())
    await testApp.queryClient.fetchQuery(options)

    expect(provided.requests).toHaveLength(1)
    expect(moduleLevel.requests).toHaveLength(0)
  })
})
