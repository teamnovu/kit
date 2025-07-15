/* eslint-disable @typescript-eslint/no-empty-object-type */

export type GenericRecord =
  | never
  | null
  | string
  | string[]
  | number
  | {
    [key: string]: GenericRecord
  }

export interface Schemas {}
export interface operations {}
