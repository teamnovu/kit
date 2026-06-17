import type { UseMutationOptions } from '@tanstack/vue-query'
import {
  type DefaultError,
  type QueryKey,
  type UndefinedInitialQueryOptions,
} from '@tanstack/vue-query'
import { type MaybeRef } from 'vue'

type ParamsBase = Record<string, unknown>

// For module augmentation. Intentionally empty: consumers *add* the
// `OperationsUnionType` property via `declare module`. Interface merging can only
// add properties, not re-type an existing one, so a pre-declared property here
// would make every override fail with "subsequent property declarations must have
// the same type". `AtType` resolves the augmented type, falling back to `string`.
// oxlint-disable-next-line typescript/no-empty-object-type
export interface OperationsOverrides {}

export type AtType = OperationsOverrides extends { OperationsUnionType: infer U }
  ? U extends { type: string } ? U['type'] : string
  : string
export type Id = string
export type Resource = AtType | readonly [AtType, Id | undefined]

export type MaybeParams<Params extends ApiParams, T> = [Params] extends [never]
  ? []
  : Params extends ApiParams<infer P>
    ? keyof P extends never
      ? Partial<T>
      : T
    : T

export type QueryKeyFromParams<P extends ApiParams> = P extends ApiParams<infer Path, infer Query, infer Body>
  ? [
      ...(keyof Path extends never ? [] : [ShallowMaybeRef<Path>]),
      ...(unknown extends Body ? [] : [MaybeRef<Body>]),
      ...(string extends keyof Query ? [] : [ShallowMaybeRef<Query>]),
    ]
  : QueryKey

type NonLossyKeys = 'queryKey' | 'queryFn'

type LossyBaseQueryOptions<Key extends QueryKey, Error = DefaultError> = Extract<
  // oxlint-disable-next-line typescript/no-explicit-any
  UndefinedInitialQueryOptions<any, Error, any, Key>,
  { queryFn?: unknown }
>

/**
 * Vue Query options compatible with `useQuery`. Extracts the non-Ref variant
 * from `UndefinedInitialQueryOptions` so properties can be individually reactive
 * (via `MaybeRefDeep`) rather than the entire options object being a Ref.
 *
 * @typeParam QueryFnOutput - The raw data type returned by the query function
 (`TQueryFnData`)
 * @typeParam Key - The query key tuple type
 * @typeParam Output - The transformed data type after `select` (`TData`), defaults to
 `QueryFnOutput`
 */
export type QueryOptions<
  QueryFnOutput,
  Error = DefaultError,
  Key extends QueryKey = QueryKey,
  Output = QueryFnOutput,
> = Extract<
  UndefinedInitialQueryOptions<QueryFnOutput, Error, Output, Key>,
  { queryFn?: unknown }
>

type MutationFnExtractor<T, U> = Extract<T, T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? U
    : T>

export type MutationOptions<
  Data = unknown,
  Error = DefaultError,
  Variables = void,
  OnMutateResult = unknown,
> = MutationFnExtractor<
  UseMutationOptions<Data, Error, Variables, OnMutateResult>,
  {
    mutationFn?: unknown
  }
>

/**
 * A covariant-safe subset of `QueryOptions` that preserves type-safety for `queryKey` and `queryFn`
 * while widening all other properties (like `enabled`, `staleTime`) to `any`-based variants.
 * This avoids contravariance issues from callback-typed properties when constraining
 * an endpoint's output type (e.g. in `useCachedBulkOperation`).
 *
 * Use `LossyCovariantEndpoint` (which uses this type) when you need to accept
 * endpoints with a specific output type as function parameters.
 */
export type LossyCovariantQueryOptions<
  QueryFnOutput,
  Error = DefaultError,
  Key extends QueryKey = QueryKey,
  Output = QueryFnOutput,
> = Pick<QueryOptions<QueryFnOutput, Error, Key, Output>, NonLossyKeys>
  & Omit<LossyBaseQueryOptions<Key>, NonLossyKeys>

/**
 * Identity at runtime — retypes strict `QueryOptions` as their lossy variant.
 * Use at call sites where vue-query's invariant generics (e.g. `useQueries`)
 * reject the precise callback types on `enabled` / `refetchInterval`.
 */
export const toLossyQueryOptions = <
  QueryFnOutput,
  Error,
  Key extends QueryKey,
  Output,
>(
  options: QueryOptions<QueryFnOutput, Error, Key, Output> & { $invalidateKey: Key },
): LossyCovariantQueryOptions<QueryFnOutput, Error, Key, Output> & { $invalidateKey: Key } =>
  options as unknown as LossyCovariantQueryOptions<QueryFnOutput, Error, Key, Output> & { $invalidateKey: Key }

type ShallowMaybeRef<T> = MaybeRef<{
  [K in keyof T]: MaybeRef<T[K]>
}>

/** URL query string parameters (e.g. `?ids=1,2`), each individually reactive. */
export interface ApiQueryParams<Params extends ParamsBase = ParamsBase> {
  queryParams?: ShallowMaybeRef<Params>
};
/** URL path parameters (e.g. `:processId`), each individually reactive. */
export interface ApiPathParams<Params extends ParamsBase = ParamsBase> {
  params?: ShallowMaybeRef<Params>
};
/** Request body, reactive as a whole. */
export interface ApiBodyParams<Params = unknown> {
  body?: MaybeRef<Params>
};
/**
 * Combined parameter bag for an endpoint call. Merges path params, query params, and body.
 * Path and query params are `ShallowMaybeRef` (each property individually reactive),
 * while body is `MaybeRef` (reactive as a whole).
 */
export interface ApiParams<
  Params extends ParamsBase = ParamsBase,
  QueryParams extends ParamsBase = ParamsBase,
  BodyParams = unknown,
> extends
  ApiPathParams<Params>,
  ApiQueryParams<QueryParams>,
  ApiBodyParams<BodyParams> {};

export interface ApiMutationParams<
  Params extends ParamsBase = ParamsBase,
  QueryParams extends ParamsBase = ParamsBase,
> extends
  ApiPathParams<Params>,
  ApiQueryParams<QueryParams> {};

type UrlParamNames<Url extends string> = Url extends `${string}:${infer Param}/${infer Rest}`
  ? Param | UrlParamNames<`/${Rest}`>
  : Url extends `${string}:${infer Param}`
    ? Param
    : never

export type UrlParams<Url extends UrlOptions<string, never>> = Url extends (params: infer P) => string
  ? P
  : Url extends string
    ? Record<UrlParamNames<Url>, string | undefined>
    : never

/** Recursive tree structure of endpoint definitions, used as input to `createEndpoints`. */
export type Endpoints = {
  // oxlint-disable-next-line typescript/no-explicit-any
  [entity: string]: Endpoints | QueryEndpoint<any, any, any, any, any> | MutationEndpoint<any, any, any>
}

/**
 * The output of `createEndpoints`. Recursively prepends each nesting key to every endpoint's
 * query key, so that `endpoints.company.process(...)` produces a query key like
 * `['company', 'process', ...params]`. Each node also carries an `$invalidateKey` for
 * partial cache invalidation (e.g. invalidate all `['company']` queries).
 */
export type MappedEndpoints<T extends Endpoints, Path extends QueryKey = []> = { $invalidateKey: Path } & {
  [K in keyof T]: T[K] extends Endpoints
    ? MappedEndpoints<T[K], [...Path, K]>
    : T[K] extends QueryEndpoint<infer QueryFnOutput, infer Params, infer Error, infer FnKey, infer Output>
      ? FnKey extends QueryKey
        ? QueryEndpoint<QueryFnOutput, Params, Error, [...Path, K, ...FnKey], Output> & { $invalidateKey: [...Path, K] }
        : never
      : T[K] extends MutationEndpoint
        ? T[K]
        : never;
}

export type EndpointParams<Params extends ApiParams> = MaybeParams<
  Params,
  [ params: Params, options?: MaybeRef<RequestInit> ]
>

/** Partial query options for an endpoint, useful for overriding specific options at the call site. */
// oxlint-disable-next-line typescript/no-explicit-any
export type PartialEndpointOptions<T extends (...args: never[]) => any> = Partial<ReturnType<T>>
/** Full query options returned by calling an endpoint. */
// oxlint-disable-next-line typescript/no-explicit-any
export type EndpointOptions<T extends (...args: never[]) => any> = ReturnType<T>

/**
 * A callable endpoint definition. Call it with reactive params to get `QueryOptions`
 * that can be spread into `useQuery`.
 *
 * @typeParam QueryFnOutput - Raw data type returned by the fetch (`TQueryFnData`)
 * @typeParam Params - The path/query/body parameter bag
 * @typeParam Key - The query key tuple (auto-generated from params and nesting path)
 * @typeParam Output - Transformed data type after `select` (`TData`), defaults to `QueryFnOutput`
 *
 * @example
 * // Spread into useQuery
 * useQuery({ ...endpoints.company.process({ params: { processId } }) })
 *
 * // Imperative fetch via toFetchOptions
 * queryClient.fetchQuery(toFetchOptions(endpoints.company.process({ params: { processId: 1 } })))
 */
export interface QueryEndpoint<
  QueryFnOutput,
  Params extends ApiParams,
  Error = DefaultError,
  Key extends QueryKey = QueryKey,
  Output = QueryFnOutput,
> {
  <OverriddenQueryFnOutput extends QueryFnOutput = QueryFnOutput,
    OverriddenError extends Error = Error,
  >(
    ...rest: EndpointParams<Params>
  ): QueryOptions<
    OverriddenQueryFnOutput,
    OverriddenError, Key,
    [Output] extends [QueryFnOutput] ? OverriddenQueryFnOutput : Output
  > & {
    $invalidateKey: Key
  }
  /** @internal phantom type for output type extraction via `EndpointOutput` - not set at runtime */
  $output?: QueryFnOutput
  $brand: 'QueryEndpoint'
};

/**
 * A callable endpoint definition. Call it with reactive params to get `QueryOptions`
 * that can be spread into `useQuery`.
 *
 * @typeParam QueryFnOutput - Raw data type returned by the fetch (`TQueryFnData`)
 * @typeParam Params - The path/query/body parameter bag
 * @typeParam Key - The query key tuple (auto-generated from params and nesting path)
 * @typeParam Output - Transformed data type after `select` (`TData`), defaults to `QueryFnOutput`
 *
 * @example
 * // Spread into useQuery
 * useQuery({ ...endpoints.company.process({ params: { processId } }) })
 *
 * // Imperative fetch via toFetchOptions
 * queryClient.fetchQuery(toFetchOptions(endpoints.company.process({ params: { processId: 1 } })))
 */
export interface MutationEndpoint<
  Data = unknown,
  Variables = unknown,
  Error = DefaultError,
> {
  <OverriddenData extends Data = Data,
    OverriddenError extends Error = Error,
    OverriddenVariables extends Variables = Variables,
  >(options?: MaybeRef<RequestInit>): MutationOptions<
    OverriddenData,
    OverriddenError,
    OverriddenVariables
  >
  /** @internal phantom type for output type extraction via `EndpointOutput` - not set at runtime */
  $output?: Data
  $brand: 'MutationEndpoint'
};

export type MutateInput<
  Variables,
  Params extends ApiMutationParams,
> = {
  body: Variables
} & Params

/**
 * A covariant-safe version of `Endpoint` for use in function parameter positions where
 * the output type needs to be constrained (e.g. `useCachedBulkOperation`).
 * Uses `out` variance annotation and widens callback-typed properties (`enabled`, `staleTime`)
 * to avoid contravariance issues.
 */
export interface LossyCovariantEndpoint<
  out QueryFnOutput,
  Params extends ApiParams,
  Error = DefaultError,
  Key extends QueryKey = QueryKey,
  Output = QueryFnOutput,
> {
  <OverriddenQueryFnOutput extends QueryFnOutput = QueryFnOutput,
    OverriddenError extends Error = Error>(
    ...rest: EndpointParams<Params>
  ): LossyCovariantQueryOptions<
    OverriddenQueryFnOutput,
    OverriddenError, Key,
    [Output] extends [QueryFnOutput] ? OverriddenQueryFnOutput : Output
  > & {
    $invalidateKey: Key
  }
  /** @internal phantom type for output type extraction via `EndpointOutput` - not set at runtime */
  $output?: QueryFnOutput
}

/** Extracts the raw output type (`QueryFnOutput`) from an endpoint via its phantom `$output` field. */

export type EndpointOutput<
  // oxlint-disable-next-line typescript/no-explicit-any
  T extends QueryEndpoint<any, any, any, any, any> | LossyCovariantEndpoint<any, any, any, any, any>,
> = NonNullable<T['$output']>

export type UrlOptions<T extends string, Params extends ParamsBase> = T | ((params: Params) => T)

export type QueryParamsFn<Params extends ApiParams<ParamsBase, ParamsBase, unknown>> = (
  params: Params,
) => ApiParams<ParamsBase, ParamsBase, unknown>
