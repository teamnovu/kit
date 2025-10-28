export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

// Extract URL parameters from a URL pattern
type ExtractUrlParams<URL extends string> = URL extends `${infer _Start}/{${infer Param}}${infer Rest}`
  ? Param | ExtractUrlParams<Rest>
  : never

// Create a record type of required URL parameters
type UrlParamsRecord<URL extends string> = {
  [K in ExtractUrlParams<URL>]: string;
}

export type Operation<Operations, OperationKey extends keyof Operations> = Operations[OperationKey]
export type OperationProp<
  Operations,
  OperationKey extends keyof Operations,
  Prop extends string,
> = Operation<Operations, OperationKey> extends { [K in Prop]?: unknown }
  ? Operation<Operations, OperationKey>[Prop]
  : never

export type InferParameters<T extends string> = UrlParamsRecord<ExtractUrlFromOperation<T>>

type OperationKey<Operations> = keyof Operations & string
type ExtractUrlFromOperation<K extends string> = K extends `${string} ${string} ${infer U}` ? U : never

export type OperationOptions<
  Operations,
  K extends OperationKey<Operations>,
> = Omit<RequestInit, 'body' | 'method'> & {
  body?: OperationProp<Operations, K, 'body'>
} &
(UrlParamsRecord<ExtractUrlFromOperation<K>> extends infer T
  ? (keyof T extends never ? { params?: void } : { params: T })
  : never)
& {
  query?: Record<string, unknown>
}

export interface ShopwareClientOptions {
  baseURL: string
  apiKey: string
  includeSeoUrls?: boolean
  language?: string
  headers: HeadersInit

  /**
   * If true, the context token will be reflected in the response headers.
   * @default true
   */
  reflectContextToken?: boolean

  /**
   * If provided, it will be used as the context token.
   * If reflectContextToken is true, this token will be used only until the first response
   * sends a new context token.
   * @default undefined
   */
  contextToken?: string

}
