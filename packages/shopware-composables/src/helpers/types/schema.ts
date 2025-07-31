// This **Must** stay an interface and the response **must** be branded.
// This is to ensure that the response type is not already resolved when the

import type { Schemas } from '../../query/types/operations'

// library is built so we can still use module augmentation to override operations.
export interface SchemaType<TKey> {
  __key?: TKey
}

export type BrandedSchema<SchemaKey extends (keyof Schemas) & string> = Schemas[SchemaKey] & SchemaType<SchemaKey>
