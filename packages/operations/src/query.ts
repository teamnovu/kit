import {
  type DefaultError,
  hashKey,
  type QueryFunctionContext,
  type QueryKey,
} from '@tanstack/vue-query'
import { mapValues } from 'lodash-es'
import { computed, type MaybeRef, unref, type UnwrapRef } from 'vue'
import type {
  ApiParams,
  EndpointParams,
  MaybeParams,
  QueryEndpoint,
  QueryKeyFromParams,
  QueryOptions,
  QueryParamsFn,
  Resource,
  UrlOptions,
  UrlParams,
} from './types'
import {
  extractResourceTypes,
  registerQueryResources,
  resourceIndex,
  serializeResource,
} from './resourceRegistry'
import { deepUnwrapParams } from './unwrapParams'
import { makeQueryFn } from './fetcher'

type EndpointDefinition<
  QueryFnOutput,
  Error = DefaultError,
  Options extends RequestInit = RequestInit,
  Key extends QueryKey = QueryKey,
  Output = QueryFnOutput,
> = Omit<QueryOptions<QueryFnOutput, Error, Key, Output>, 'queryKey'> & {
  options?: MaybeRef<Options>
}

/**
 * Explicit return type for the `query` builder's `tail`. Named (rather than an
 * inferred anonymous object) so the recursive `resources`/`params` edges have
 * something to reference in the emitted `.d.ts` instead of collapsing to
 * `/*elided*\/ any`.
 */
interface QueryBuilder<Url extends UrlOptions<string, never>, QueryFnOutput, Error = DefaultError> {
  resources: (...tags: Resource[]) => QueryBuilder<Url, QueryFnOutput, Error>
  params: (
    paramsFn?: QueryParamsFn<ApiParams<UrlParams<Url>>>,
  ) => QueryBuilder<Url, QueryFnOutput, Error>
  build: <
    Params extends ApiParams<UrlParams<Url>> = ApiParams<UrlParams<Url>>,
    Key extends QueryKey = QueryKeyFromParams<Params>,
    Options extends RequestInit = RequestInit,
    Output = QueryFnOutput,
  >(
    factory?: (params: Params) => EndpointDefinition<QueryFnOutput, Error, Options, Key, Output>,
  ) => NoInfer<QueryEndpoint<QueryFnOutput, Params, Error, QueryKeyFromParams<Params>, Output>>
}

/**
 * Unwraps all reactive refs in an endpoint's query options, producing plain values
 * suitable for `queryClient.fetchQuery`. Strips `initialData` since it's not applicable
 * to imperative fetches.
 *
 * @example
 * const opts = endpoints.involvedPerson.bulk({ body: computed(() => ({ ids })) });
 * const data = await queryClient.fetchQuery(toFetchOptions(opts));
 */
export function toFetchOptions<T extends Record<string, unknown>>(
  opts: T,
): Omit<{ [K in keyof T]: UnwrapRef<T[K]> }, 'initialData'> {
  return Object.fromEntries(
    Object.entries(opts).map(([k, v]) => [k, unref(v)]),
  ) as { [K in keyof T]: UnwrapRef<T[K]> }
}

function buildEndpoint<
  QueryFnOutput,
  Url extends UrlOptions<string, never>,
  Params extends ApiParams<UrlParams<Url>>,
  Error = DefaultError,
  Options extends RequestInit = RequestInit,
  Key extends QueryKey = QueryKey,
  Output = QueryFnOutput,
>(
  url: Url | undefined,
  resources: Resource[] | undefined,
  paramsFn?: QueryParamsFn<Params>,
  factory?: (...rest: MaybeParams<Params, [params: Params]>) => EndpointDefinition<QueryFnOutput, Error, Options, Key, Output>,
): QueryEndpoint<QueryFnOutput, Params, Error, Key, Output> {
  const endpoint = (<OverriddenQueryFnOutput extends QueryFnOutput = QueryFnOutput>(...rest: EndpointParams<Params>) => {
    const transformed = computed(() => paramsFn!(deepUnwrapParams(rest[0]) as Params))
    const section = (key: keyof ApiParams) => {
      const bag = transformed.value
      return bag[key] !== undefined ? computed(() => transformed.value[key]) : undefined
    }
    const params = paramsFn
      ? {
          params: section('params'),
          body: section('body'),
          queryParams: section('queryParams'),
        } as Params
      : (rest[0] as Params | undefined)

    const directFetchOptions = rest[1] as Options | undefined
    const definition = factory?.(...[params] as MaybeParams<Params, [params: Params]>) ?? {} as EndpointDefinition<QueryFnOutput>

    type ParamKeys = Exclude<keyof UnwrapRef<ApiParams>, 'body'>

    const twoStepUnrefParams = <Key extends ParamKeys>(key: Key) => {
      if (!params) return params
      const unrefedOnce = unref(params)[key]
      if (!unrefedOnce) return undefined
      const unrefedParams = unref(unrefedOnce)
      return mapValues(
        unrefedParams,
        v => unref(v),
      ) as Record<string, UnwrapRef<Params['params']>> | undefined
    }

    const queryKey = [params?.params, params?.body, params?.queryParams].filter(Boolean) as QueryKeyFromParams<Params>

    const $invalidateKey = [
      twoStepUnrefParams('params'),
      unref(params?.body),
      twoStepUnrefParams('queryParams'),
    ].filter(Boolean) as unknown as Key

    const concreteUrl = computed(() => {
      const receivedParams = twoStepUnrefParams('params')
      const resolvedUrl = (typeof url === 'function' ? url((receivedParams as never) ?? {}) : url as string | undefined) ?? ''
      return resolvedUrl.replace(/:([a-zA-Z0-9_]+)/g, (_, param: string) => receivedParams?.[param] as string || '')
    })

    const queryFnOptions = computed(() => ({
      ...unref(definition.options),
      ...unref(directFetchOptions),
    }))

    const queryFn = makeQueryFn<OverriddenQueryFnOutput>(
      concreteUrl,
      computed(() => twoStepUnrefParams('queryParams') ?? undefined),
      queryFnOptions,
      // Raw body forwarded to the transport; serialization/method/headers are the
      // transport's concern (format-specific, e.g. API Platform).
      computed(() => unref(params?.body)),
    )

    const concreteQueryFn = async (ctx: QueryFunctionContext) => {
      const data = await queryFn(ctx)

      const resourceKey = !twoStepUnrefParams('queryParams') ? ctx.queryKey : ctx.queryKey.slice(0, -1)

      if (resources?.length) {
        for (const r of resources) {
          const map = resourceIndex.get(serializeResource(r)) ?? new Map()
          map.set(hashKey(resourceKey), resourceKey)
          resourceIndex.set(serializeResource(r), map)
        }
      }

      registerQueryResources(extractResourceTypes(data), resourceKey)

      return data
    }

    // Gate the query on all path params being present (a missing path param
    // would produce a broken URL). ANDed with any user-provided `enabled` so
    // custom logic from the factory is preserved rather than clobbered.
    const paramsPresent = computed(() => {
      const unrefedParams = twoStepUnrefParams('params')
      if (!unrefedParams) return true

      return Object.values(unrefedParams).every(v => v !== undefined && v !== null)
    })

    const userEnabled = definition.enabled

    return {
      ...definition,
      $invalidateKey,
      queryKey,
      queryFn: url ? concreteQueryFn : ('queryFn' in definition ? definition.queryFn : undefined),
      enabled: computed(() => {
        if (!paramsPresent.value) return false
        // `enabled` is documented for this builder as boolean | Ref | computed.
        return userEnabled === undefined ? true : !!unref(userEnabled)
      }),
    }
  }) as ((...rest: unknown[]) => unknown) & { $brand?: string }

  endpoint.$brand = 'QueryEndpoint'

  return endpoint as QueryEndpoint<
    QueryFnOutput,
    Params,
    Error,
    Key,
    Output
  >
}

/**
 * Builder for type-safe endpoint definitions. Chains `query<OutputType>().url('/path/:param').build()`
 * to create an `Endpoint` that auto-generates query keys from parameters and handles URL interpolation.
 *
 * Optionally chain `.resources()` before `.build()` to declare which resource types appear in the
 * endpoint's response, enabling automatic cache invalidation when those resources are mutated.
 *
 * The return type is wrapped in `NoInfer<Endpoint<...>>` to prevent TypeScript from using the
 * return type for generic inference while keeping the `Endpoint`'s internal generic params clean
 * (so that conditional types like `Exclude` can distribute over the output type).
 *
 * @typeParam QueryFnOutput - The raw data type the API returns
 *
 * @example
 * // Simple endpoint
 * const getProcess = query<ProcessOutput>()
 *   .url('/api/processes/:processId')
 *   .build();
 *
 * // Endpoint with resource tags for cache invalidation
 * const getProcess = query<ProcessOutput>()
 *   .url('/api/processes/:processId')
 *   .resources('CompanyProcess', 'User')
 *   .build();
 *
 * // Endpoint with select (Output inferred from select return type)
 * const getPlz = query<PlzResponse>()
 *   .url('/api/plz_request')
 *   .build((params) => ({
 *     select: (data) => data.result,
 *     enabled: computed(() => !!params.queryParams?.plz),
 *   }));
 *
 * // Endpoint without URL (custom queryFn via factory)
 * const custom = query<CustomOutput>()
 *   .build(() => ({
 *     queryFn: () => fetchCustomData(),
 *   }));
 */
export const query = <QueryFnOutput, Error = DefaultError>() => {
  const tail = <
    Url extends UrlOptions<string, never>,
  >(url?: Url, resources?: Resource[], paramsFn?: QueryParamsFn<ApiParams<UrlParams<Url>>>): QueryBuilder<Url, QueryFnOutput, Error> => ({
    resources: (...tags: Resource[]) => tail(url, tags, paramsFn),
    params: (
      paramsFn?: QueryParamsFn<ApiParams<UrlParams<Url>>>,
    ) => tail(url, resources, paramsFn),
    build: <
      Params extends ApiParams<UrlParams<Url>> = ApiParams<UrlParams<Url>>,
      Key extends QueryKey = QueryKeyFromParams<Params>,
      Options extends RequestInit = RequestInit,
      Output = QueryFnOutput,
    >(
      factory?: (params: Params) => EndpointDefinition<QueryFnOutput, Error, Options, Key, Output>,
    ): NoInfer<QueryEndpoint<QueryFnOutput, Params, Error, QueryKeyFromParams<Params>, Output>> =>
      buildEndpoint<QueryFnOutput, Url, Params, Error, Options, QueryKeyFromParams<Params>, Output>(
        url,
        resources,
        paramsFn,
        factory as ((params?: Params) => EndpointDefinition<QueryFnOutput, Error, Options, QueryKeyFromParams<Params>, Output>) | undefined,
      ),
  })

  return {
    url: <Url extends UrlOptions<string, never>>(url: Url) => tail(url),
    ...tail(),
  }
}
