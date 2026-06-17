import { type DefaultError, type QueryKey } from '@tanstack/vue-query'
import { mapValues } from 'lodash-es'
import { unref } from 'vue'
import type {
  ApiParams,
  QueryEndpoint,
  EndpointParams,
  Endpoints,
  MappedEndpoints,
} from './types'

function mapKeyFn<
  QueryFnOutput,
  Params extends ApiParams,
  Key extends QueryKey,
  T extends QueryEndpoint<Output, Params, Error, Key>,
  Path extends QueryKey,
  Error = DefaultError,
  Output = QueryFnOutput,
>(path: Path, fn: T): QueryEndpoint<QueryFnOutput, Params, Error, [...Path, ...Key], Output> {
  const endpoint = (...rest: EndpointParams<Params>) => {
    const result = fn(...rest)
    return {
      ...result,
      queryKey: [...path, ...unref(unref(result).queryKey)] as [...Path, ...Key],
      $invalidateKey: [...path, ...unref(unref(result).$invalidateKey)] as [...Path, ...Key],
    } as const
  }

  endpoint.$invalidateKey = path

  return endpoint as unknown as QueryEndpoint<QueryFnOutput, Params, Error, [...Path, ...Key], Output>
}

/**
 * Takes a tree of endpoint definitions and prepends each nesting key to the query keys,
 * enabling hierarchical cache invalidation. Also adds `$invalidateKey` at each level.
 *
 * @example
 * const endpoints = createEndpoints({
 *   company: {
 *     process: query<ProcessOutput>().url('/api/processes/:processId').build(),
 *   },
 * });
 * // endpoints.company.process({ params: { processId } }) → queryKey: ['company', 'process', { processId }]
 * // endpoints.company.$invalidateKey → ['company']
 */
export function createEndpoints<T extends Endpoints>(keys: T): MappedEndpoints<T> {
  const walk = <TInner extends Endpoints, Key extends QueryKey>(obj: TInner, path: Key) => {
    const values = mapValues(obj, (value, key): Endpoints[string] => {
      if (typeof value === 'function') {
        if (value.$brand === 'QueryEndpoint') {
          return mapKeyFn([...path, key], value)
        } else {
          return value
        }
      }

      return walk(value, [...path, key])
    }) as MappedEndpoints<TInner, Key>

    values.$invalidateKey = path

    return values
  }

  return walk(keys, [])
};
