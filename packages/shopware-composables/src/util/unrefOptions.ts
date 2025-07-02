import { unref, UnwrapRef } from 'vue'
import { OperationOptions as RawOperationOptions } from '@teamnovu/kit-shopware-api-client'
import { OperationOptions } from '../query/types/query'
import { Operations, PartialProps } from '../query/types'

export function unrefOptions<
  K extends keyof Operations,
  OmitKeys extends keyof RawOperationOptions<Operations, K> = never,
>(
  options: OperationOptions<K, OmitKeys> | undefined,
) {
  const opts = unref(options)

  return Object.fromEntries(
    Object.entries(opts ?? {}).map(
      ([key, value]) => [key, unref(value) as UnwrapRef<typeof value>],
    ),
  ) as PartialProps<RawOperationOptions<Operations, K>, OmitKeys>
}
