import type { FormField } from '../composables/useField'
import type { Form, FormDataDefault } from './form'

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


type ExtensiveEntity = {
  person: {
    origin: {
      country: string
      city: string
    }

    address: {
      street: string
      zip: string
    }
    name: string
    age: number
    hobbies: string[]
  }
}

type SubFormPath = 'person'
type SubForm = PickEntity<ExtensiveEntity, SubFormPath>
type SubFormPaths = Paths<SubForm>

type FieldPath = 'origin.country'
type MainFieldPath = `${SubFormPath}.${FieldPath}`

type ScopedMainPaths = Paths<ExtensiveEntity> & `${SubFormPath}.${SubFormPaths}`

type SubEntityPaths = EntityPaths<SubForm>

type field = FormField<PickProps<SubForm, 'country'>, 'country'>
type mainField = FormField<PickProps<SubForm, FieldPath>, FieldPath>

type form = Form<PickEntity<ExtensiveEntity, SubFormPath>>

type Test = FormField<PickProps<SubForm, RestPath<SubFormPath, MainFieldPath>>, RestPath<SubFormPath, MainFieldPath>>

const test: Test = {} as unknown as mainField
test.setValue

