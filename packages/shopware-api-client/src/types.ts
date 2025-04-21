type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type LowercaseHttpMethod = Lowercase<HttpMethod>;

type ExtractUrl<T extends string> = T extends `${string} ${string} ${infer U}` ? U : never;

// Extract URL parameters from a URL pattern
type ExtractUrlParams<URL extends string> = URL extends `${infer _Start}/{${infer Param}}${infer Rest}`
  ? Param | ExtractUrlParams<Rest>
  : never;

// Create a record type of required URL parameters
type UrlParamsRecord<URL extends string> = {
  [K in ExtractUrlParams<URL>]: string;
};

type OperationFromUrl<Operations, URL extends string, Method extends HttpMethod> = {
  [K in keyof Operations]: K extends `${string} ${Lowercase<Method>} ${URL}` ? K : never;
}[keyof Operations];

type InferOperationFromUrl<Operations, URL extends string, Method extends HttpMethod> =
  OperationFromUrl<Operations, URL, Method> extends never
  ? unknown
  : OperationFromUrl<Operations, URL, Method>;

type InferBodyType<T> = T extends { body: infer TBody } ? TBody : never;
type InferResponseType<T> = T extends { response: infer TResponse } ? TResponse : never;

type InferredOptions<Operations, URL extends string, Method extends HttpMethod> = ShopwareQueryOptions<
  Operations,
  URL,
  InferOperationFromUrl<Operations, URL, Method> extends keyof Operations
  ? InferBodyType<Operations[InferOperationFromUrl<Operations, URL, Method>]>
  : Record<string, unknown>
>;

type InferredResponse<Operations, URL extends string, Method extends HttpMethod> =
  InferOperationFromUrl<Operations, URL, Method> extends keyof Operations
  ? InferResponseType<Operations[InferOperationFromUrl<Operations, URL, Method>]>
  : unknown;

type ShopwareOperationUrls<Operations extends Record<string, unknown>> = ExtractUrl<keyof Operations & string>;

type ExtractMethods<Ops, Url extends string> = {
 [K in keyof Ops]: K extends `${string} ${infer Method} ${Url}`
   ? Method
   : never
}[keyof Ops];

type ShopwareMethodsForUrl<Ops extends Record<string, unknown>, Url extends ShopwareOperationUrls<Ops>> =
  ExtractMethods<Ops, Url> & LowercaseHttpMethod; // Intersect extracted methods with valid lowercase ones

export interface ShopwareQueryOptions<
  Ops extends Record<string, unknown>,
  URLPattern extends ShopwareOperationUrls<Ops>,
  T = unknown,
> extends Omit<RequestInit, 'body' | 'method'> {
  method?: ShopwareMethodsForUrl<Ops, URLPattern>;
  body?: T;
  params: UrlParamsRecord<URLPattern>;
}

export interface ShopwareClientOptions {
  baseURL: string;
  apiKey: string;
  includeSeoUrls?: boolean;
  language?: string;
}

export type {
  HttpMethod, InferredOptions,
  InferredResponse, ShopwareMethodsForUrl, ShopwareOperationUrls
};
