import type { QueryKey, UseQueryOptions } from '@tanstack/vue-query'
import type {
  OperationProp,
  OperationOptions as RawOperationOptions,
} from '@teamnovu/kit-shopware-api-client'
import type { MaybeRef, UnwrapRef } from 'vue'
import type { operations } from './operations'
import type { PartialProps } from './util'

export type ShallowMaybeRefs<T> = {
  [K in keyof T]: MaybeRef<T[K]>
}

export type ShallowUnwrapRefs<T> = {
  [K in keyof T]: UnwrapRef<T[K]>
}

export type OperationKey = keyof operations
export type OperationBody<K extends OperationKey> =
  OperationProp<operations, K, 'body'>
export type OperationResponse<K extends OperationKey, Operations extends operations = operations> =
  OperationProp<Operations, K, 'response'>

export type OperationOptions<
  K extends OperationKey,
  OmitKeys extends keyof RawOperationOptions<operations, K> = never,
> =
  MaybeRef<ShallowMaybeRefs<PartialProps<RawOperationOptions<operations, K>, OmitKeys>>>

export type Options<K extends OperationKey, QK extends QueryKey = QueryKey> =
  UseQueryOptions<
    OperationResponse<K>,
    Error,
    OperationResponse<K>,
    OperationResponse<K>,
    QK
  >
