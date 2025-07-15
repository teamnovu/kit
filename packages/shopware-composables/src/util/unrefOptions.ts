import { unref, type UnwrapRef } from 'vue'
import type { OperationOptions as RawOperationOptions } from '@teamnovu/kit-shopware-api-client'
import type { OperationOptions } from '../query/types/query'
import type { PartialProps } from '../query/types'
import type { operations } from '../query/types/operations'

export function unrefOptions<
  K extends keyof operations,
  OmitKeys extends keyof RawOperationOptions<operations, K> = never,
>(
  options: OperationOptions<K, OmitKeys> | undefined,
) {
  const opts = unref(options)

  return Object.fromEntries(
    Object.entries(opts ?? {}).map(
      ([key, value]) => [key, unref(value) as UnwrapRef<typeof value>],
    ),
  ) as PartialProps<RawOperationOptions<operations, K>, OmitKeys>
}
