import { operations } from "../../shopware-composables/api-types/storeApiTypes";

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

// Extract URL parameters from a URL pattern
type ExtractUrlParams<URL extends string> = URL extends `${infer _Start}/{${infer Param}}${infer Rest}`
  ? Param | ExtractUrlParams<Rest>
  : never;

// Create a record type of required URL parameters
type UrlParamsRecord<URL extends string> = {
  [K in ExtractUrlParams<URL>]: string;
};

export type Operation<Operations, OperationKey extends keyof Operations> = Operations[OperationKey];
export type OperationProp<
  Operations,
  OperationKey extends keyof Operations,
  Prop extends string
> = Operation<Operations, OperationKey> extends { [K in Prop]: infer T } ? T : unknown;

export type InferParameters<T extends string> = UrlParamsRecord<ExtractUrlFromOperation<T>>;

type OperationKey<Operations> = keyof Operations & string;
type ExtractUrlFromOperation<K extends string> = K extends `${string} ${string} ${infer U}` ? U : never;

export type OperationOptions<
  Operations,
  K extends OperationKey<Operations>,
> = Omit<RequestInit, 'body' | 'method'> & {
  params: UrlParamsRecord<ExtractUrlFromOperation<K>>;
  body?: OperationProp<Operations, K, 'body'>;
};

export interface ShopwareClientOptions {
  baseURL: string;
  apiKey: string;
  includeSeoUrls?: boolean;
  language?: string;
}

