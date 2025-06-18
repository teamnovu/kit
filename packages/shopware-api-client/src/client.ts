import { EventEmitter } from './eventEmitter'
import { createQueryParams } from './query'
import type {
  OperationOptions,
  OperationProp,
  ShopwareClientOptions,
} from './types'

export class ShopwareApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: unknown,
  ) {
    super(message)
    this.name = 'ShopwareApiError'
  }
}

const operationRegex = /^(?<name>\w+?)\s(?<method>get|post|put|patch|delete)\s+(?<url>\/.*)/i

export class ShopwareClient<Operations extends Record<string, {
  body?: unknown
  response?: unknown
}>> extends EventEmitter {
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

    this.setBaseURL(options.baseURL ?? this.options.baseURL)
    this.setApiKey(options.apiKey ?? this.options.apiKey)
    this.setLanguage(options.language ?? this.options.language)
    this.setContextToken(options.contextToken ?? this.options.contextToken)
    this.setIncludeSeoUrls(options.includeSeoUrls ?? this.options.includeSeoUrls)
    this.setReflectContextToken(options.reflectContextToken ?? this.options.reflectContextToken)
  }

  public setBaseURL(baseURL: string) {
    if (typeof baseURL !== 'string') {
      throw new Error('Invalid baseURL: It must be a string.')
    }

    this.options.baseURL = baseURL
  }

  public setApiKey(apiKey: string) {
    if (typeof apiKey !== 'string') {
      throw new Error('Invalid apiKey: It must be a string.')
    }

    this.options.apiKey = apiKey
  }

  public setLanguage(language: string | undefined) {
    if (language && typeof language !== 'string') {
      throw new Error('Invalid language: If provided, it must be a string.')
    }

    this.options.language = language
  }

  public setContextToken(contextToken: string | undefined) {
    if (contextToken && typeof contextToken !== 'string') {
      throw new Error('Invalid contextToken: If provided, it must be a string.')
    }

    this.options.contextToken = contextToken
    this.emit('contextToken', contextToken)
  }

  public setIncludeSeoUrls(includeSeoUrls: boolean = true) {
    this.options.includeSeoUrls = includeSeoUrls
  }

  public setReflectContextToken(reflectContextToken: boolean = true) {
    this.options.reflectContextToken = reflectContextToken
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
    try {
      const { method, url } = this.parseOperation(operation)

      const interpolatedUrl = this.interpolateUrl(url, options?.params ?? {})

      const query = options?.query ? `?${createQueryParams(options.query)}` : ''

      const response = await fetch(`${this.options.baseURL}/store-api${interpolatedUrl}${query}`, {
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

      if (!response.ok) {
        throw new ShopwareApiError(
          `Shopware API request failed: ${response.statusText}`,
          response.status,
          await response.json().catch(() => undefined),
        )
      }

      if (this.options.reflectContextToken) {
        const contextToken = response.headers.get('sw-context-token')
        if (contextToken) {
          this.setContextToken(contextToken)
        }
      }

      return response
    } catch (error) {
      if (error instanceof ShopwareApiError) {
        throw error
      }

      throw new ShopwareApiError(
        'Failed to communicate with Shopware API',
        500,
        error instanceof Error ? error.message : undefined,
      )
    }
  }

  async query<OperationKey extends (keyof Operations) & string>(
    operation: OperationKey,
    options?: OperationOptions<Operations, OperationKey>,
  ): Promise<OperationProp<Operations, OperationKey, 'response'>> {
    const response = await this.queryRaw(operation, options)

    return response.json()
  }
}
