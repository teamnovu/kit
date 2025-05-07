import type { operations } from '#store-types'
import type { QueryKey, UseQueryOptions } from '@tanstack/vue-query'
import type { OperationProp } from '@teamnovu/kit-shopware-api-client'

export type OperationKey = keyof operations
export type OperationBody<Operations extends operations, K extends OperationKey> =
  OperationProp<Operations, K, 'body'>
export type OperationResponse<Operations extends operations, K extends OperationKey> =
  OperationProp<Operations, K, 'response'>

export type Options<Operations extends operations, K extends OperationKey, QK extends QueryKey = QueryKey> =
  UseQueryOptions<
    OperationResponse<Operations, K>,
    Error,
    OperationResponse<Operations, K>,
    OperationResponse<Operations, K>,
    QK
  >
