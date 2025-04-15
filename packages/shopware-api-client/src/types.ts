type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

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
  InferOperationFromUrl<Operations, URL, Method> extends keyof Operations
    ? InferBodyType<Operations[InferOperationFromUrl<Operations, URL, Method>]>
    : Record<string, unknown>,
  Method,
  URL
>;

type InferredResponse<Operations, URL extends string, Method extends HttpMethod> =
  InferOperationFromUrl<Operations, URL, Method> extends keyof Operations
    ? InferResponseType<Operations[InferOperationFromUrl<Operations, URL, Method>]>
    : unknown;

type ShopwareOperationUrls<Operations> = ExtractUrl<keyof Operations & string>;

type ShopwareMethodsForUrl<Operations, URL extends ShopwareOperationUrls<Operations>> =
  Extract<keyof Operations & string, `${string} ${string} ${URL}`> extends infer Operation
    ? Operation extends `${string} ${infer Method} ${URL}`
      ? Method extends Lowercase<HttpMethod>
        ? Method
        : never
      : never
    : never;

export interface ShopwareQueryOptions<
  T = unknown,
  Method extends HttpMethod = HttpMethod,
  URLPattern extends string = string,
> extends Omit<RequestInit, 'body' | 'method'> {
  method?: Method;
  body?: T;
  params: UrlParamsRecord<URLPattern>;
}

export interface ShopwareClientOptions {
  baseURL: string;
  apiKey: string;
  language?: string;
}

export type {
  HttpMethod, InferredOptions,
  InferredResponse, ShopwareMethodsForUrl, ShopwareOperationUrls
};
