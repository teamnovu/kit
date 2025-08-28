import { ShopwareApiError } from './error'
import { EventEmitter } from './eventEmitter'
import { createQueryParams } from './query'
import type {
  OperationOptions,
  OperationProp,
  ShopwareClientOptions,
} from './types'

const operationRegex = /^(?<name>\w+?)\s(?<method>get|post|put|patch|delete)\s+(?<url>\/.*)/i

// This **Must** stay an interface and the response **must** be branded.
// This is to ensure that the response type is not already resolved when the
// library is built so we can still use module augmentation to override operations.
export interface ResponseType<TKey> {
  __response?: TKey
}

export type BrandedResponse<Operations, OperationKey extends (keyof Operations) & string> =
  ResponseType<OperationKey> & OperationProp<Operations, OperationKey, 'response'> & { __brand: string }

export class ShopwareClient<Operations> extends EventEmitter {
  private options: ShopwareClientOptions = {
    baseURL: '',
    apiKey: '',
    language: '',
    contextToken: '',
    includeSeoUrls: false,
    reflectContextToken: true,
  }

  constructor(options: ShopwareClientOptions) {
    super()

    this.baseURL = options.baseURL ?? this.options.baseURL
    this.apiKey = options.apiKey ?? this.options.apiKey
    this.language = options.language ?? this.options.language
    this.contextToken = options.contextToken ?? this.options.contextToken
    this.includeSeoUrls = options.includeSeoUrls ?? this.options.includeSeoUrls
    this.reflectContextToken = options.reflectContextToken ?? this.options.reflectContextToken
  }

  set baseURL(baseURL: string) {
    if (typeof baseURL !== 'string') {
      throw new Error('Invalid baseURL: It must be a string.')
    }

    this.options.baseURL = baseURL
  }

  get baseURL() {
    return this.options.baseURL
  }

  set apiKey(apiKey: string) {
    if (typeof apiKey !== 'string') {
      throw new Error('Invalid apiKey: It must be a string.')
    }

    this.options.apiKey = apiKey
  }

  get apiKey() {
    return this.options.apiKey
  }

  set language(language: string | undefined) {
    if (language && typeof language !== 'string') {
      throw new Error('Invalid language: If provided, it must be a string.')
    }

    this.options.language = language
  }

  get language() {
    return this.options.language
  }

  set contextToken(contextToken: string | undefined) {
    if (contextToken && typeof contextToken !== 'string') {
      throw new Error('Invalid contextToken: If provided, it must be a string.')
    }

    this.options.contextToken = contextToken
    this.emit('contextToken', contextToken)
  }

  get contextToken() {
    return this.options.contextToken
  }

  set includeSeoUrls(includeSeoUrls: boolean | undefined) {
    this.options.includeSeoUrls = includeSeoUrls
  }

  get includeSeoUrls() {
    return this.options.includeSeoUrls
  }

  set reflectContextToken(reflectContextToken: boolean | undefined) {
    this.options.reflectContextToken = reflectContextToken
  }

  get reflectContextToken() {
    return this.options.reflectContextToken
  }

  private parseOperation(operation: keyof Operations & string): {
    name: string
    method: string
    url: string
  } {
    const match = operationRegex.exec(operation)
    if (!match?.groups) {
      throw new Error('Invalid operation format')
    }
    return {
      name: match.groups.name,
      method: match.groups.method.toUpperCase(),
      url: match.groups.url,
    }
  }

  private interpolateUrl(url: string, params: Record<string, string>): string {
    return url.replace(/{([^}]+?)}/g, (_, param) => {
      if (!(param in params)) {
        throw new Error(`Missing required URL parameter: ${param}`)
      }
      return params[param]
    })
  }

  async queryRaw<OperationKey extends (keyof Operations) & string>(
    operation: OperationKey,
    options?: OperationOptions<Operations, OperationKey>,
  ): Promise<Response> {
    let response: Response

    try {
      const { method, url } = this.parseOperation(operation)

      const interpolatedUrl = this.interpolateUrl(url, options?.params ?? {})

      const query = options?.query ? `?${createQueryParams(options.query)}` : ''

      response = await fetch(`${this.options.baseURL}/store-api${interpolatedUrl}${query}`, {
        ...options,
        method,
        headers: {
          'Content-Type': 'application/json',
          'sw-access-key': this.options.apiKey,
          ...(this.options.contextToken && { 'sw-context-token': this.options.contextToken }),
          ...(this.options.includeSeoUrls && { 'sw-include-seo-urls': 'true' }),
          ...(this.options.language && { 'sw-language-id': this.options.language }),
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      })
    } catch (error) {
      const shopwareError = new ShopwareApiError(
        'Failed to communicate with Shopware API',
        500,
        error instanceof Error ? error.message : undefined,
      )

      this.emit('error', shopwareError)

      throw shopwareError
    }

    if (!response.ok) {
      const error = new ShopwareApiError(
        `Shopware API request failed: ${response.statusText}`,
        response.status,
        await response.json().catch(() => undefined),
      )

      this.emit('error', error)

      throw error
    }

    if (this.options.reflectContextToken) {
      const contextToken = response.headers.get('sw-context-token')
      if (contextToken) {
        this.contextToken = contextToken
      }
    }

    return response
  }

  async query<OperationKey extends (keyof Operations) & string>(
    operation: OperationKey,
    options?: OperationOptions<Operations, OperationKey>,
  ): Promise<BrandedResponse<Operations, OperationKey>> {
    const response = await this.queryRaw(operation, options)

    return response.json().catch(() => undefined)
  }
}
