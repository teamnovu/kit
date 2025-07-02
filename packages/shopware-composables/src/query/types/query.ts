import type { QueryKey, UseQueryOptions } from '@tanstack/vue-query'
import type {
  OperationProp,
  OperationOptions as RawOperationOptions,
} from '@teamnovu/kit-shopware-api-client'
import { MaybeRef, UnwrapRef } from 'vue'
import { Operations } from './operations'
import { PartialProps } from './util'

export type ShallowMaybeRefs<T> = {
  [K in keyof T]: MaybeRef<T[K]>
}

export type ShallowUnwrapRefs<T> = {
  [K in keyof T]: UnwrapRef<T[K]>
}

export type OperationKey = keyof Operations
export type OperationBody<K extends OperationKey> =
  OperationProp<Operations, K, 'body'>
export type OperationResponse<K extends OperationKey> =
  OperationProp<Operations, K, 'response'>

export type OperationOptions<
  K extends OperationKey,
  OmitKeys extends keyof RawOperationOptions<Operations, K> = never,
> =
  MaybeRef<ShallowMaybeRefs<PartialProps<RawOperationOptions<Operations, K>, OmitKeys>>>

export type Options<K extends OperationKey, QK extends QueryKey = QueryKey> =
  UseQueryOptions<
    OperationResponse<K>,
    Error,
    OperationResponse<K>,
    OperationResponse<K>,
    QK
  >
