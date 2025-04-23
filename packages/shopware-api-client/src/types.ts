export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

// Extract URL parameters from a URL pattern
type ExtractUrlParams<URL extends string> = URL extends `${infer _Start}/{${infer Param}}${infer Rest}`
  ? Param | ExtractUrlParams<Rest>
  : never;

// Create a record type of required URL parameters
type UrlParamsRecord<URL extends string> = {
  [K in ExtractUrlParams<URL>]: string;
};

type InferBodyType<T> = T extends { body: infer TBody } ? TBody : never;
type InferResponseType<T> = T extends { response: infer TResponse } ? TResponse : never;

type OperationKey<Operations> = keyof Operations & string;

type ExtractUrlFromOperation<K extends string> = K extends `${string} ${string} ${infer U}` ? U : never;

export type OperationOptions<
  Operations,
  K extends OperationKey<Operations>,
> = Omit<RequestInit, 'body' | 'method'> & {
  params: UrlParamsRecord<ExtractUrlFromOperation<K>>;
  body?: InferBodyType<Operations[K]>;
};

// Type for the response from the query method
export type OperationResponse<
  Operations,
  K extends OperationKey<Operations>,
> = InferResponseType<Operations[K]>;

export interface ShopwareClientOptions {
  baseURL: string;
  apiKey: string;
  includeSeoUrls?: boolean;
  language?: string;
}

