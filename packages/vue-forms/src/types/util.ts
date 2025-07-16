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
      : never
    : PropertyKeys extends keyof Entity
      ? Entity[PropertyKeys]
      : never
/**
 * Resolves to a union of dot-connected paths of all nested properties of T.
 * type Test = Paths<{
 *   foo: { bar: [{ baz: string }] }
 *   qux: number
 * }>
 * must resolve to: 'foo', 'qux', 'foo.bar', 'foo.bar.0', 'foo.bar.0.baz'
 */
export type Paths<T, Seen = never> =
  T extends Seen ? never :
    T extends Array<infer ArrayType> ? `${number}` | `${number}.${Paths<ArrayType, Seen | T>}` :
      T extends object
        ? {
            [K in keyof T]-?: `${Exclude<K, symbol>}${'' | `.${Paths<T[K], Seen | T>}`}`
          }[keyof T]
        : never
