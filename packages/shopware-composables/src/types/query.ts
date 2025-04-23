import { QueryKey, UndefinedInitialQueryOptions } from '@tanstack/vue-query'

/**
 * Creates a type for additional query options passed to composables,
 * by omitting 'queryKey' and 'queryFn' which are defined internally.
 *
 * @template TQueryFnData - The type of the data returned by the query function.
 * @template TError - The type of the error thrown by the query function. Defaults to Error.
 * @template TData - The type of the data returned by the query. Defaults to TQueryFnData.
 * @template TQueryKey - The type of the query key. Must extend QueryKey.
 */
export type CreateQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  UndefinedInitialQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  'queryKey' | 'queryFn'
>

