/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { operations as OriginalOperations, Schemas as OriginalSchemas } from '#api-types'

// declare module '#api-types' {
//   export interface operations extends OriginalOperations {}
//   export interface Schemas extends OriginalSchemas {}
//   export type components = {
//     schemas: Schemas
//   }
// }
//
declare module '../query/types/operations' {
  export interface operations extends OriginalOperations {}
  export interface Schemas extends OriginalSchemas {}
  export type components = {
    schemas: Schemas
  }
}
