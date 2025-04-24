import { operations } from '#store-types'
import { QueryKey, UndefinedInitialQueryOptions } from '@tanstack/vue-query'
import { OperationOptions as RawOperationOptions } from '@teamnovu/kit-shopware-api-client'

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

export type OperationKey = keyof operations
export type Options<Operations, Operation extends OperationKey> =
  RawOperationOptions<operations & Operations, Operation>
export type OperationParams<Operations, Operation extends OperationKey> =
  Options<Operations, Operation>['params']
export type OperationBody<Operations, Operation extends OperationKey> =
  Options<Operations, Operation>['body']
export type OperationOptions<Operations, Operation extends OperationKey, QKey extends QueryKey = QueryKey> =
  CreateQueryOptions<OperationBody<Operations, Operation>, Error, never, QKey>
