import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ShopwareApiError, ShopwareClient } from '../src'
import type { FetchMock, TestOperations } from './helpers'
import { createClient, jsonResponse, requestAt, stubFetch } from './helpers'

let fetchMock: FetchMock

beforeEach(() => {
  fetchMock = stubFetch()
  fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({})))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('request building', () => {
  it('derives the HTTP method from the operation key', async () => {
    const client = createClient()

    await client.query('readContext get /context')
    await client.query('updateContext patch /context', { body: {} })
    await client.query('readNavigation post /navigation/{activeId}/{rootId}', {
      params: {
        activeId: 'a',
        rootId: 'b',
      },
    })
    await client.query('deleteCustomer Delete /account/customer')

    expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual(['GET', 'PATCH', 'POST', 'DELETE'])
  })

  it('always uses the method of the operation key', async () => {
    const client = createClient()

    await client.query('readContext get /context', { method: 'DELETE' } as never)

    expect(requestAt(fetchMock).init.method).toBe('GET')
  })

  it('builds the URL from the current base URL and the store-api prefix', async () => {
    const client = createClient()

    await client.query('readContext get /context')
    client.baseURL = 'https://other.test'
    await client.query('readContext get /context')

    expect(requestAt(fetchMock, 0).url).toBe('https://shop.test/store-api/context')
    expect(requestAt(fetchMock, 1).url).toBe('https://other.test/store-api/context')
  })

  it('interpolates path parameters from params', async () => {
    const client = createClient()

    await client.query('readNavigation post /navigation/{activeId}/{rootId}', {
      params: {
        activeId: 'main-navigation',
        rootId: '0190abc',
      },
    })

    expect(requestAt(fetchMock).url).toBe('https://shop.test/store-api/navigation/main-navigation/0190abc')
  })

  it('serialises query values, expanding arrays to key[] and skipping empty values', async () => {
    const client = createClient()

    await client.query('readContext get /context', {
      query: {
        'term': 'shoe',
        'limit': 10,
        'p': 0,
        'only-available': true,
        'grouped': false,
        'ids': ['a', null, 2, undefined, Number.NaN, 'b'],
        'empty': null,
        'missing': undefined,
        'nan': Number.NaN,
        'fn': () => 'ignored',
      },
    })

    const { url } = requestAt(fetchMock)
    expect(url.startsWith('https://shop.test/store-api/context?')).toBe(true)
    expect([...new URL(url).searchParams]).toEqual([
      ['term', 'shoe'],
      ['limit', '10'],
      ['p', '0'],
      ['only-available', 'true'],
      ['grouped', 'false'],
      ['ids[]', 'a'],
      ['ids[]', '2'],
      ['ids[]', 'b'],
    ])
  })

  it('appends no query string without a query option', async () => {
    const client = createClient()

    await client.query('readContext get /context')

    expect(requestAt(fetchMock).url).toBe('https://shop.test/store-api/context')
  })

  it('sends the body as JSON', async () => {
    const client = createClient()

    await client.query('updateContext patch /context', {
      body: {
        languageId: 'de',
      },
    })
    await client.query('readContext get /context')

    expect(requestAt(fetchMock, 0).init.body).toBe('{"languageId":"de"}')
    expect(requestAt(fetchMock, 1).init.body).toBeUndefined()
  })

  it('passes RequestInit defaults and per-call options to fetch', async () => {
    const client = createClient({
      requestInitDefaults: {
        credentials: 'include',
        cache: 'no-cache',
      },
    })
    const { signal } = new AbortController()

    await client.query('readContext get /context', {
      cache: 'no-store',
      signal,
    })

    const { init } = requestAt(fetchMock)
    expect(init.credentials).toBe('include')
    expect(init.cache).toBe('no-store')
    expect(init.signal).toBe(signal)
  })
})

describe('headers', () => {
  it('sends only the content type and access key by default', async () => {
    const client = createClient()

    await client.query('readContext get /context')

    expect(requestAt(fetchMock).headers).toEqual({
      'content-type': 'application/json',
      'sw-access-key': 'access-key',
    })
  })

  it('adds context token, seo url and language headers when configured', async () => {
    const client = createClient({
      contextToken: 'context-token',
      includeSeoUrls: true,
      language: 'language-id',
    })

    await client.query('readContext get /context')

    expect(requestAt(fetchMock).headers).toEqual({
      'content-type': 'application/json',
      'sw-access-key': 'access-key',
      'sw-context-token': 'context-token',
      'sw-include-seo-urls': 'true',
      'sw-language-id': 'language-id',
    })
  })

  it('layers default, client option, instance and per-call headers in that order', async () => {
    const client = createClient({
      contextToken: 'client-token',
      includeSeoUrls: true,
      language: 'client-language',
      requestInitDefaults: {
        headers: {
          'Content-Type': 'text/plain',
          'sw-access-key': 'defaults-key',
          'sw-context-token': 'defaults-token',
          'x-source': 'defaults',
        },
      },
      headers: {
        'sw-language-id': 'instance-language',
        'x-source': 'instance',
        'x-instance': 'yes',
      },
    })

    await client.query('readContext get /context', {
      headers: {
        'x-source': 'call',
      },
    })

    expect(requestAt(fetchMock).headers).toEqual({
      'content-type': 'text/plain',
      'sw-access-key': 'defaults-key',
      'sw-context-token': 'client-token',
      'sw-include-seo-urls': 'true',
      'sw-language-id': 'instance-language',
      'x-instance': 'yes',
      'x-source': 'call',
    })
  })

  it('lets per-call headers override the built-in ones', async () => {
    const client = createClient({ contextToken: 'client-token' })

    await client.query('readContext get /context', {
      headers: {
        'Content-Type': 'text/plain',
        'sw-access-key': 'call-key',
        'sw-context-token': 'call-token',
      },
    })

    expect(requestAt(fetchMock).headers).toEqual({
      'content-type': 'text/plain',
      'sw-access-key': 'call-key',
      'sw-context-token': 'call-token',
    })
  })
})

describe('responses', () => {
  it('query resolves the parsed JSON body', async () => {
    const client = createClient()
    fetchMock.mockResolvedValueOnce(jsonResponse({ token: 'abc' }))

    await expect(client.query('readContext get /context')).resolves.toEqual({ token: 'abc' })
  })

  it('query resolves undefined when the body is not JSON', async () => {
    const client = createClient()
    fetchMock.mockResolvedValueOnce(new Response('<html></html>', { status: 200 }))
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(client.query('readContext get /context')).resolves.toBeUndefined()
    await expect(client.query('readContext get /context')).resolves.toBeUndefined()
  })

  it('queryRaw resolves the fetch Response', async () => {
    const client = createClient()
    const response = jsonResponse({ token: 'abc' })
    fetchMock.mockResolvedValueOnce(response)

    await expect(client.queryRaw('readContext get /context')).resolves.toBe(response)
  })
})

describe('errors', () => {
  async function captureError(promise: Promise<unknown>) {
    try {
      await promise
    } catch (error) {
      return error
    }
    throw new Error('Expected the promise to reject')
  }

  it('wraps network failures in a 500 ShopwareApiError', async () => {
    const client = createClient()
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'))

    const error = await captureError(client.query('readContext get /context'))

    expect(error).toBeInstanceOf(ShopwareApiError)
    expect(error).toMatchObject({
      status: 500,
      response: 'fetch failed',
      errors: [],
    })
  })

  it('rejects with a 500 ShopwareApiError without calling fetch when a path parameter is missing', async () => {
    const client = createClient()

    const error = await captureError(client.query('readNavigation post /navigation/{activeId}/{rootId}', {
      params: { activeId: 'a' } as never,
    }))

    expect(error).toBeInstanceOf(ShopwareApiError)
    expect(error).toMatchObject({
      status: 500,
      response: 'Missing required URL parameter: rootId',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('turns non-ok responses into a ShopwareApiError with status, body and parsed errors', async () => {
    const client = createClient()
    const body = {
      errors: [
        {
          status: '400',
          code: 'FRAMEWORK__INVALID_CRITERIA_IDS',
          detail: 'Invalid ids',
        },
      ],
    }
    fetchMock.mockResolvedValueOnce(jsonResponse(body, {
      status: 400,
      statusText: 'Bad Request',
    }))

    const error = await captureError(client.query('readContext get /context'))

    expect(error).toBeInstanceOf(ShopwareApiError)
    expect(error).toMatchObject({
      status: 400,
      response: body,
      errors: body.errors,
    })
    expect((error as ShopwareApiError).message).toContain('Bad Request')
  })

  it('leaves response undefined and errors empty when the error body is not JSON', async () => {
    const client = createClient()
    fetchMock.mockResolvedValueOnce(new Response('Bad Gateway', {
      status: 502,
      statusText: 'Bad Gateway',
    }))

    const error = await captureError(client.query('readContext get /context'))

    expect(error).toMatchObject({
      status: 502,
      response: undefined,
      errors: [],
    })
  })

  it('emits the thrown error as an error event', async () => {
    const client = createClient()
    const listener = vi.fn()
    client.on('error', listener)
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'))
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 404 }))

    const networkError = await captureError(client.query('readContext get /context'))
    const httpError = await captureError(client.query('readContext get /context'))

    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener.mock.calls[0][0].detail).toBe(networkError)
    expect(listener.mock.calls[1][0].detail).toBe(httpError)
  })
})

describe('context token', () => {
  it('emits contextToken with the token when it is set', () => {
    const client = createClient()
    const listener = vi.fn()
    client.on('contextToken', listener)

    client.contextToken = 'new-token'

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0]).toMatchObject({
      type: 'contextToken',
      detail: 'new-token',
    })
  })

  it('emits contextToken for the token passed to the constructor', () => {
    const emitted: [string, unknown][] = []

    class RecordingClient extends ShopwareClient<TestOperations> {
      emit(type: string, detail?: unknown) {
        emitted.push([type, detail])
        return super.emit(type, detail)
      }
    }

    const client = new RecordingClient({
      baseURL: 'https://shop.test',
      apiKey: 'access-key',
      contextToken: 'initial-token',
    })

    expect(client.contextToken).toBe('initial-token')
    expect(emitted).toContainEqual(['contextToken', 'initial-token'])
  })

  it('adopts the sw-context-token response header, emits it and sends it on later requests', async () => {
    const client = createClient({ contextToken: 'old-token' })
    const listener = vi.fn()
    client.on('contextToken', listener)
    fetchMock.mockResolvedValueOnce(jsonResponse({}, {
      headers: {
        'sw-context-token': 'server-token',
      },
    }))

    await client.query('readContext get /context')
    await client.query('readContext get /context')

    expect(client.contextToken).toBe('server-token')
    expect(listener.mock.calls.map(([event]) => event.detail)).toEqual(['server-token'])
    expect(requestAt(fetchMock, 1).headers['sw-context-token']).toBe('server-token')
  })

  it('keeps the token and emits nothing without a response header', async () => {
    const client = createClient({ contextToken: 'old-token' })
    const listener = vi.fn()
    client.on('contextToken', listener)

    await client.query('readContext get /context')

    expect(client.contextToken).toBe('old-token')
    expect(listener).not.toHaveBeenCalled()
  })

  it('ignores the response header when reflectContextToken is false', async () => {
    const client = createClient({
      contextToken: 'old-token',
      reflectContextToken: false,
    })
    fetchMock.mockResolvedValueOnce(jsonResponse({}, {
      headers: {
        'sw-context-token': 'server-token',
      },
    }))

    await client.query('readContext get /context')

    expect(client.contextToken).toBe('old-token')
  })
})

describe('option setters', () => {
  it('reject non-string values', () => {
    const client = createClient()

    expect(() => {
      client.baseURL = 42 as never
    }).toThrow(/baseURL/)
    expect(() => {
      client.apiKey = 42 as never
    }).toThrow(/apiKey/)
    expect(() => {
      client.language = 42 as never
    }).toThrow(/language/)
    expect(() => {
      client.contextToken = 42 as never
    }).toThrow(/contextToken/)
    expect(() => {
      client.queryClientId = 42 as never
    }).toThrow(/queryClientId/)
  })

  it('reject non-string values passed to the constructor', () => {
    expect(() => createClient({ baseURL: 42 as never })).toThrow(/baseURL/)
    expect(() => createClient({ apiKey: {} as never })).toThrow(/apiKey/)
  })

  it('accept undefined for optional values', () => {
    const client = createClient({
      language: 'de',
      contextToken: 'token',
      queryClientId: 'shopware',
    })

    client.language = undefined
    client.contextToken = undefined
    client.queryClientId = undefined

    expect(client.language).toBeUndefined()
    expect(client.contextToken).toBeUndefined()
    expect(client.queryClientId).toBeUndefined()
  })
})
