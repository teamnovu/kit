/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { operations as OriginalOperations, Schemas as OriginalSchemas } from '#store-types'

declare module './operations' {
  export interface Operations extends OriginalOperations {}
  export interface Schemas extends OriginalSchemas {}
}
