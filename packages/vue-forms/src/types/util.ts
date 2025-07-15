/**
 * Resolves to the first part of the dot-connected path of T.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractRootPath<TPath extends string> = TPath extends `${infer T1}.${any}`
  ? T1
  : never

/**
 * Resolves to the rest part of the dot-connected path of T where TRoot is the first part.
 */
type ExtractRestPath<TRoot extends string, TPath extends string> = TPath extends `${TRoot}.${infer T2}`
  ? T2
  : never

/**
 * Picks all properties of Entity with path in PropertyKeys. PropertyKeys can contain dot-paths for nested objects as well.
 */
export type PickDot<Entity, PropertyKeys extends string> =
  Entity extends Array<infer ArrayType>
    ? PickDot<ArrayType, PropertyKeys>[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : Entity extends Record<string, any>
      ? {
          [key in keyof Entity as key extends ExtractRootPath<PropertyKeys> | PropertyKeys ? key : never]-?: key extends ExtractRootPath<PropertyKeys>
            ? PickDot<Entity[key], ExtractRestPath<key, PropertyKeys>>
            : Entity[key]
        }
      : Entity

/**
 * Resolves to a union of dot-connected paths of all nested properties of T.
 */
export type Paths<T, Seen = never> =
  T extends Seen ? never :
    T extends Array<infer ArrayType> ? Paths<ArrayType, Seen> :
      T extends object
        ? {
            [K in keyof T]-?: `${Exclude<K, symbol>}${'' | `.${Paths<T[K], Seen | T>}`}`
          }[keyof T]
        : never
