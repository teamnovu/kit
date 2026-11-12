import type { Mock } from 'vitest'
import { vi } from 'vitest'
import { ShopwareClient } from '../src'
import type { ShopwareClientOptions } from '../src'

export interface TestOperations {
  'readContext get /context': {
    response: {
      token: string
    }
  }
  'updateContext patch /context': {
    body: {
      languageId?: string
    }
    response: {
      contextToken: string
    }
  }
  'readNavigation post /navigation/{activeId}/{rootId}': {
    body?: {
      depth?: number
    }
    response: {
      id: string
    }[]
  }
  'deleteCustomer Delete /account/customer': {
    response: never
  }
}

export type FetchMock = Mock<typeof fetch>

export function createClient(options: Partial<ShopwareClientOptions> = {}) {
  return new ShopwareClient<TestOperations>({
    baseURL: 'https://shop.test',
    apiKey: 'access-key',
    ...options,
  })
}

export function stubFetch(): FetchMock {
  const fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

interface JsonResponseInit {
  status?: number
  statusText?: string
  headers?: Record<string, string>
}

export function jsonResponse(body: unknown, init: JsonResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    statusText: init.statusText,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
}

export function requestAt(fetchMock: FetchMock, index = 0) {
  const [input, init = {}] = fetchMock.mock.calls[index]

  return {
    url: String(input),
    init,
    headers: Object.fromEntries(new Headers(init.headers)),
  }
}
