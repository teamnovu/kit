import type { FormDataDefault } from './form'

/**
 * Takes a dot-connected path and returns a tuple of its parts.
 */
export type SplitPath<TPath extends string> =
  TPath extends `${infer T1}.${infer T2}`
    ? [T1, ...SplitPath<T2>]
    : [TPath]

/**
 * Picks the exact type of the Entity at the nested PropertyKeys path.
 */
export type PickProps<Entity, PropertyKeys extends string> =
  PropertyKeys extends `${infer TRoot}.${infer TRest}`
    ? TRoot extends keyof Entity
      ? TRest extends string
        ? Entity[TRoot] extends object
          ? PickProps<Entity[TRoot], TRest>
          : never
        : never
      // We might have an array at hand but the key is a string with a number in it
      : TRoot extends `${number}`
        ? Entity extends unknown[]
          ? TRest extends string
            ? Entity[number] extends object
              ? PickProps<Entity[number], TRest>
              : never
            : never
          : never
        : never
    // We might have an array at hand but the key is a string with a number in it
    : PropertyKeys extends keyof Entity
      ? Entity[PropertyKeys]
      : PropertyKeys extends `${number}`
        ? Entity extends unknown[]
          ? Entity[number]
          : never
        : never

/**
 * Resolves to a union of dot-connected paths of all nested properties of T.
 */
export type Paths<T, Seen = never> =
  T extends Seen ? never :
    T extends Array<infer ArrayType> ? `${number}` | `${number}.${Paths<ArrayType, Seen | T>}` :
      T extends object
        ? {
            [K in keyof T]-?: `${Exclude<K, symbol>}${'' | `.${Paths<T[K], Seen | T>}`}`
          }[keyof T]
        : never

/**
 * Removes the last part of a dot-connected path.
 */
export type ButLast<T extends string> =
  T extends `${infer Rest}.${infer Last}`
    ? ButLast<Last> extends ''
      ? Rest
      : `${Rest}.${ButLast<Last>}`
    : never

/**
 * Combines Paths<T> with ButLast<Paths<T>> to include all paths except the last part.
 * The & Paths<T> ensures that there are no entity paths that are not also available in Paths<T>.
 */
export type EntityPaths<T> = ButLast<Paths<T>> & Paths<T>

export type PickEntity<Entity, PropertyKeys extends string> =
  PropertyKeys extends unknown ? PickProps<Entity, EntityPaths<Entity> & PropertyKeys> & FormDataDefault : never

export type RestPath<T extends string, P extends string> =
  P extends `${T}.${infer Rest}` ? Rest : never
