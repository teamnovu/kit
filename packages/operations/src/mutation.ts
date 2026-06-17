import { type DefaultError } from '@tanstack/vue-query'
import { mapValues } from 'lodash-es'
import { computed, type MaybeRef, unref, type UnwrapRef } from 'vue'
import type {
  ApiMutationParams,
  ApiParams,
  MutateInput,
  MutationEndpoint,
  MutationOptions,
  UrlOptions,
  UrlParams,
} from './types'
import { deepUnwrapParams } from './unwrapParams'

type EndpointDefinition<
  Data,
  Variables,
  Error = DefaultError,
  Options extends RequestInit = RequestInit,
> = MutationOptions<Data, Error, Variables> & {
  options?: MaybeRef<Options>
}

/** Transforms the mutation input bag (`{ body } & path/query params`) before it's sent. */
type MutationParamsFn<Variables> = (params: Variables) => Variables

function buildEndpoint<
  Data,
  InputData,
  Url extends UrlOptions<string, never>,
  Params extends ApiMutationParams<UrlParams<Url>>,
  Error = DefaultError,
  Options extends RequestInit = RequestInit,
>(
  url: Url | undefined,
  paramsFn?: MutationParamsFn<MutateInput<InputData, Params>>,
  factory?: () => EndpointDefinition<Data, MutateInput<InputData, Params>, Error, Options>,
): MutationEndpoint<Data, MutateInput<InputData, Params>, Error> {
  const endpoint = (<OverridenData extends Data = Data>(options?: MaybeRef<RequestInit>) => {
    const directFetchOptions = options as Options | undefined
    const definition = factory?.() ?? {} as EndpointDefinition<Data, MutateInput<InputData, Params>>

    type ParamKeys = Exclude<keyof UnwrapRef<ApiParams>, 'body'>

    const unrefParams = <Key extends ParamKeys>(params: Params, key: Key) => {
      if (!params) return params
      const unrefedOnce = unref(params)[key]
      if (!unrefedOnce) return undefined
      const unrefedParams = unref(unrefedOnce)
      return mapValues(
        unrefedParams,
        v => unref(v),
      ) as Record<string, UnwrapRef<Params['params']>> | undefined
    }

    const resolveUrl = (receivedParams: Record<string, unknown> | undefined) => {
      const resolvedUrl = (typeof url === 'function' ? url((receivedParams as never) ?? {}) : url as string | undefined) ?? ''
      return resolvedUrl.replace(/:([a-zA-Z0-9_]+)/g, (_, param: string) => receivedParams?.[param] as string || '')
    }

    const queryFnOptions = computed(() => ({
      ...unref(definition.options),
      ...unref(directFetchOptions),
    }))

    return {
      ...definition,
      mutationFn: useMutationFn<OverridenData, MutateInput<InputData, Params>>(
        (call, data) => {
          // Imperative: params arrive at mutate() time, so transform once here.
          const resolved = paramsFn ? paramsFn(deepUnwrapParams(data)) : data

          return call(resolveUrl(unrefParams(resolved, 'params')), {
            method: 'POST',
            body: resolved.body,
            ...queryFnOptions.value,
          })
        },
      ),
    }
  }) as ((...rest: unknown[]) => unknown) & { $brand?: string }

  endpoint.$brand = 'MutationEndpoint'

  return endpoint as MutationEndpoint<
    Data,
    MutateInput<InputData, Params>,
    Error
  >
}

/**
 * Builder for type-safe endpoint definitions. Chains `mutation<OutputType, InputType>().url('/path/:param').build()`
 * to create an `Endpoint` that auto-generates mutation options and handles URL interpolation.
 *
 * The return type is wrapped in `NoInfer<Endpoint<...>>` to prevent TypeScript from using the
 * return type for generic inference while keeping the `Endpoint`'s internal generic params clean
 * (so that conditional types like `Exclude` can distribute over the output type).
 *
 * @typeParam QueryFnOutput - The raw data type the API returns
 *
 * @example
 * // Simple endpoint
 * const patchProcess = mutation<ProcessOutput, ProcessInput>()
 *   .url('/api/processes/:processId')
 *   .build(() => ({
 *     options: {
 *      method: 'PATCH',
 *     },
 *   }));
 */
export const mutation = <Data = unknown, InputData = unknown, Error = DefaultError>() => {
  const tail = <
    Url extends UrlOptions<string, never>,
  >(
    url?: Url,
    paramsFn?: MutationParamsFn<MutateInput<InputData, ApiParams<UrlParams<Url>>>>,
  ) => ({
    params: (
      paramsFn?: MutationParamsFn<MutateInput<InputData, ApiParams<UrlParams<Url>>>>,
    ) => tail(url, paramsFn),
    build: <
      Params extends ApiParams<UrlParams<Url>> = ApiParams<UrlParams<Url>>,
      Options extends RequestInit = RequestInit,
    >(
      factory?: () => EndpointDefinition<Data, MutateInput<InputData, Params>, Error, Options>,
    ): NoInfer<MutationEndpoint<Data, MutateInput<InputData, Params>, Error>> =>
      buildEndpoint<Data, InputData, Url, Params, Error, Options>(
        url,
        paramsFn as MutationParamsFn<MutateInput<InputData, Params>> | undefined,
        factory,
      ),
  })

  return {
    url: <Url extends UrlOptions<string, never>>(url: Url) => tail(url),
    ...tail(),
  }
}
