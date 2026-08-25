import type {
  DefaultError,
  DefinedInitialDataInfiniteOptions,
  DefinedInitialQueryOptions,
  InfiniteData,
  MutationState,
  MutationStateOptions,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  UndefinedInitialQueryOptions,
  UseInfiniteQueryOptions,
  UseInfiniteQueryReturnType,
  UseMutationOptions,
  UseMutationReturnType,
  UseQueriesResults,
  UseQueryDefinedReturnType,
  UseQueryOptions,
  UseQueryReturnType,
} from '@tanstack/vue-query'
import {
  useInfiniteQuery,
  useIsFetching,
  useIsMutating,
  useMutation,
  useMutationState,
  useQueries,
  useQuery,
} from '@tanstack/vue-query'
import { useShopwareVueQueryClient } from '../inject'

/**
 * Shopware-bound versions of the tanstack vue-query composables: identical to
 * the originals, but always attached to the shopware QueryClient so the client
 * argument cannot be forgotten.
 *
 * The imperative QueryClient API (`fetchQuery`, `ensureQueryData`,
 * `invalidateQueries`, `setQueryData`, ...) needs no wrappers — call those
 * methods on `useShopwareVueQueryClient()` directly.
 */

export function useShopwareQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryDefinedReturnType<TData, TError>
export function useShopwareQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryReturnType<TData, TError>
export function useShopwareQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>,
): UseQueryReturnType<TData, TError>
export function useShopwareQuery(
  options: UseQueryOptions,
): UseQueryReturnType<unknown, DefaultError> {
  return useQuery(options, useShopwareVueQueryClient())
}

export function useShopwareInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): UseInfiniteQueryReturnType<TData, TError>
export function useShopwareInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): UseInfiniteQueryReturnType<TData, TError>
export function useShopwareInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): UseInfiniteQueryReturnType<TData, TError>
export function useShopwareInfiniteQuery(
  options: UseInfiniteQueryOptions,
): UseInfiniteQueryReturnType<unknown, DefaultError> {
  return useInfiniteQuery(options, useShopwareVueQueryClient())
}

export function useShopwareQueries<
  T extends Array<any>,
  TCombinedResult = UseQueriesResults<T>,
>(
  options: Parameters<typeof useQueries<T, TCombinedResult>>[0],
): ReturnType<typeof useQueries<T, TCombinedResult>> {
  // TS cannot relate the recursive UseQueriesOptions conditional to itself here
  return useQueries(options as never, useShopwareVueQueryClient()) as ReturnType<typeof useQueries<T, TCombinedResult>>
}

export function useShopwareMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  mutationOptions: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationReturnType<TData, TError, TVariables, TContext> {
  return useMutation(mutationOptions, useShopwareVueQueryClient())
}

export function useShopwareIsFetching(
  fetchingFilters?: Parameters<typeof useIsFetching>[0],
): ReturnType<typeof useIsFetching> {
  return useIsFetching(fetchingFilters, useShopwareVueQueryClient())
}

export function useShopwareIsMutating(
  filters?: Parameters<typeof useIsMutating>[0],
): ReturnType<typeof useIsMutating> {
  return useIsMutating(filters, useShopwareVueQueryClient())
}

export function useShopwareMutationState<TResult = MutationState>(
  options?: MutationStateOptions<TResult>,
): ReturnType<typeof useMutationState<TResult>> {
  return useMutationState(options, useShopwareVueQueryClient())
}
