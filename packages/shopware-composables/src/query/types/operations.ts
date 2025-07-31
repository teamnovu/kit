/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { operations as OriginalOperations, Schemas as OriginalSchemas } from '#store-types'

export interface Operations extends ShopwareApi.Operations, OriginalOperations {}
export interface Schemas extends ShopwareApi.Schemas, OriginalSchemas {}
