/**
 * The goal of the types defined in this file is the definition of API Platform types for the API.
 *
 * The main types to be used are:
 * - SpecifyApiOutput<T, TGroup>: Use this for specifying the output type of an API endpoint.
 * - SpecifyApiInput<T, TGroup>: Use this for specifying the input type of an API endpoint (Update/Create).
 * - PickApiProps<T, Props>: Use this where no endpoints are involved - eg. in components.
 * - ApiProperty<T, TGroup>: Use this for defining properties of an entity.
 *
 * PickApiProps is used in components and wherever a type is expected but is not directly connected
 * to an endpoint. It takes a union type of dot-connected paths as a second argument and returns
 * an object with all properties (nested) that match the paths.
 *
 * SpecifyApiOutput and SpecifyApiInput are used for specifying the output and input types of an API endpoint.
 * They take a union type of serialization groups as a second argument and return an object with all properties
 * (nested) that match the serialization groups.
 *
 * Ensure that on using SpecifyApiOutput or SpecifyApiInput you are matching the serialization groups of the
 * endpoint you are defining exactly with the serialization groups defined in the endpoint (API Platform).
 *
 * Ensure that on all ApiPropery usages you match the serialization groups of the property with the serialization groups
 * of the entity you are defining.
 *
 * Define api entities like so:
 *
 * export interface ApiJurPerson extends ApiEntity {
 *   id: ApiProperty<number, 'list' | 'jur_person:list' | 'jur_person:read' | 'involved_person_bulk:read'>
 *   shabexId?: ApiProperty<number | null, 'jur_person:read' | 'jur_person:write'>
 *   companyName: ApiProperty<string, 'jur_person:list' | 'jur_person:read' | 'jur_person:write' | 'jur_person_bulk:read' | 'involved_person_bulk:read'>
 *   uid?: ApiProperty<string | null, 'jur_person:list' | 'jur_person:read' | 'jur_person:write' | 'involved_person_bulk:read'>
 *   country: ApiProperty<Alpha2CodeExtended, 'jur_person:read' | 'jur_person:write' | 'involved_person_bulk:read'>
 *   streetAddress?: ApiProperty<string | null, 'jur_person:read' | 'jur_person:write'>
 *   coAddress?: ApiProperty<string | null, 'jur_person:read' | 'jur_person:write'>
 *   seat?: ApiProperty<ApiPlzEntryModel | null, 'jur_person:read' | 'jur_person:write' | 'involved_person_bulk:read'>
 *   token: ApiProperty<string, 'jur_person:read' | 'involved_person_bulk:read'>
 *   initialFileToken?: ApiProperty<string, 'jur_person:create'>
 *   telephoneNumber?: ApiProperty<string | null, 'jur_person:read' | 'jur_person:write'>
 *   signers?: ApiProperty<ApiJurPersonSigner[], 'jur_person:read' | 'jur_person_bulk:read'>
 *   currentlySigningSigners?: ApiProperty<IRI[], 'jur_person:read' | 'jur_person:write' | 'jur_person_bulk:read'>
 *   isNatPerson: ApiProperty<false, 'read' | 'involved_person_bulk:read'>
 * }
 *
 **/

export interface ApiResponseMeta<
  TType extends string = string,
  TID extends string | undefined = string,
> {
  '@type': TType
  '@id': TID extends string ? `/api/${TID}` : undefined
}

export type ApiResponse<
  T,
  TType extends string = string,
  TID extends string = string,
> = T & ApiResponseMeta<TType, TID>

export type LegacyApiCollectionResponse<
  T,
  TType extends string = string,
  TID extends string = string,
> = ApiResponse<
  {
    'hydra:member': T[]
    'hydra:totalItems': number
  },
  TType,
  TID
>

export type ApiCollectionResponse<
  T,
  TType extends string = string,
  TID extends string = string,
> = ApiResponse<
  {
    member: T[]
    totalItems: number
  },
  TType,
  TID
>

type DeepPartial<T> =
  T extends Array<infer U> ? DeepPartial<U>[]
    : T extends object ? {
      [K in keyof T]?: DeepPartial<T[K]>
    } & {}
      : T

type DeepRequired<T> =
  T extends Array<infer U> ? DeepRequired<U>[]
    : T extends object ? {
      [K in keyof T]-?: DeepRequired<T[K]>
    } & {}
      : T

/**
 * The main api property used for entity properties. Define the same serialization groups as the backend!
 */
export type ApiProperty<TType, TGroups extends string> = {
  readonly __type__: TType
  readonly __groups__: TGroups
}

export interface ApiEntity {
  readonly __type__: '__entity__'
}

/**
 * An IRI type - an alias to string for better readability and specification of intent.
 */
export type IRI = string

/**
 * Resolves to F if T is not an array, otherwise to F[]
 */
type MapArray<T, F> = T extends Array<unknown> ? F[] : F

/**
 * Resolves to the generic type of the array if T is an array, otherwise to T.
 */
type UnpackArray<T> = T extends Array<infer U> ? U : T

/**
 * Takes an ApiProperty and if it holds a reference resolves to the type of the reference. Preserves
 * arrays.
 * Resolves to never in all other cases.
 */
type UnpackReference<T> = T extends ApiProperty<infer R, string>
  ? (R extends IsEntityReference ? R : never)
  : never

/**
 * Takes an Api object resolves to an object with all ApiProperties removed.
 */
type EntityWithoutApiProperties<T> = {
  [K in Exclude<keyof T, keyof ApiEntity> as NonNullable<T[K]> extends ApiProperty<unknown, string> ? never : K]-?: T[K]
}

/**
 * Takes an object and resolves to the union of all value types that are not ApiProperties.
 */
type NonApiProperties<T> = EntityWithoutApiProperties<T> extends infer R ? R[keyof R] : never

/**
 * Takes an Api object and a union of serialization groups and resolves to T (The Api object) if the
 * type holds any property (shallow) that is accessible through the specified groups.
 * Resolves to an IRI otherwise.
 *
 * This mirrors the behavior of API Platform.
 */
type NormalizeReferenceForGroup<T, Group extends string> =
  NonApiProperties<T> extends never
    ? (Group & ApiPropertyGroups<ApiProperties<T>> extends never
        ? IRI
        : T)
    : T

/**
 * Resolves to the wrapped type of the ApiProperty
 */
type ApiPropertyType<TEntity> = TEntity extends ApiProperty<infer T, string>
  ? T : TEntity

/**
 * Resolves to the serialization groups attached to the ApiProperty
 */
type ApiPropertyGroups<TEntity> = TEntity extends ApiProperty<unknown, infer T>
  ? T : never

/**
 * Resolves to a union type of all ApiProperties of T (shallow)
 */
type ApiProperties<R> = R extends ApiEntity ? {
  [K in keyof R]-?: R[K] extends infer V ? (V extends ApiProperty<unknown, string> ? V : never) : never
}[keyof R] : never

/**
 * Resolves to a union type of all ApiProperties of T (recursively)
 */
type ApiPropertiesRecursive<T, Seen = never> =
 T extends Seen
   ? never
   : ApiProperties<T> extends infer ApiProps
     ? ApiProps | ApiPropertiesRecursive<UnpackArray<UnpackReference<ApiProps>>, Seen | T>
     : never

/**
 * Tests if property K of type R is accessible by group TGroup.
 * Resolves to K if the property is accessible, otherwise to never.
 */
type IsKeyAccessible<R, K extends keyof R, TGroup extends string> =
  K extends keyof ApiEntity ? never : (
    ApiPropertyGroups<R[K]> extends never ? K :
        (TGroup extends ApiPropertyGroups<R[K]> ? K : never))

/**
 * Takes an Api object and resolves to an object with only properties that match the specified
 * serialization groups. ApiProperty types are unwrapped (ApiRefs are preserved).
 */
type FilterForGroups<T, TGroup extends string> = {
  [K in keyof T as IsKeyAccessible<T, K, TGroup>]: ApiPropertyType<T[K]>
}

/**
 * Takes an object, presumably with some ApiRefs as values and resolves to an object with IRI
 * references added to all ApiRefs.
 *
 * This is used to allow IRIs to be used for references e.g. in Update types.
 *
 * This type is made for the usage of FilterForGroups before.
 */
type AllowIRIReferences<T> = {
  [K in keyof T]: T[K] extends infer V
    ? (V extends IsEntityReference
        ? (MapArray<V, IRI> | V)
        : V)
    : T[K]
}

/**
 * Resolves to the serialization groups of all ApiProperties of T (recursively)
 */
type AllGroups<T> = ApiPropertyGroups<ApiPropertiesRecursive<T>>

type IsEntityReference = ApiEntity | ApiEntity[]

/**
 * Filters an Api object for properties that are accessible through the specified serialization
 * groups. ApiProperty types are unwrapped (ApiRefs are preserved).
 * IRIs are allowed in the result type for all ApiRefs if AllowIRIs is true.
 */
type FilterEntity<T extends object, TGroup extends string, AllowIRIs = false> = AllowIRIs extends true
  ? AllowIRIReferences<FilterForGroups<T, TGroup>>
  : FilterForGroups<T, TGroup>

/**
 * The main unwrapper function. It takes an Api object and a union of serialization groups and
 * resolves to an object with all ApiProperty types unwrapped and ApiRefs resolve to
 * IRIs if no nested ApiProperty is accessible through the specified groups, otherwise
 * the ApiRefs are unwrapped.
 */
type UnwrapEntity<T extends ApiEntity, TGroup extends AllGroups<T> = AllGroups<T>, AllowIRIs = false> =
  T extends ApiEntity
    ? FilterEntity<T, TGroup, AllowIRIs> extends infer R ? {
      [K in keyof R]: R[K] extends infer V
        ? (V extends IsEntityReference
            ? (NormalizeReferenceForGroup<UnpackArray<V>, TGroup> extends infer Refs
                ? (Refs extends ApiEntity
                    ? MapArray<V, UnwrapEntity<Refs, TGroup & AllGroups<Refs>>>
                    : MapArray<V, IRI>)
                : V)
            : V)
        : R[K]
    } & ApiResponseMeta
      : never
    : never

/**
 * This is only a helper type for Paths. It creates a simple - possibly non-accurate type
 * from which keys can be extracted easily. Value types do not matter.
 */
type SimplifyStructure<T extends ApiEntity> = {
  [K in Exclude<keyof T, keyof ApiEntity>]: T[K] extends infer V
    ? V extends ApiProperty<infer U, string>
      ? U extends IsEntityReference
        ? MapArray<U, SimplifyStructure<UnpackArray<U>>>
        : U
      : V
    : never
} & ApiResponseMeta

/**
 * Resolves to a union of dot-connected paths of all nested properties of T.
 */
type Paths<T, Seen = never> =
  T extends Seen ? never :
    T extends Array<infer ArrayType> ? Paths<ArrayType, Seen> :
      T extends object
        ? {
            [K in keyof T]-?: `${Exclude<K, symbol>}${'' | `.${Paths<T[K], Seen | T>}`}`
          }[keyof T]
        : never

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
type PickDot<Entity, PropertyKeys extends string> =
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
 * The main specification function used for API outputs (types we get back the API).
 */
export type SpecifyApiOutput<T extends ApiEntity, TGroup extends AllGroups<T>> = DeepRequired<UnwrapEntity<T, TGroup>>

/**
 * The main specification function used for API inputs (types we get send to the API).
 */
export type SpecifyApiInput<T extends ApiEntity, TGroup extends AllGroups<T>> = DeepPartial<UnwrapEntity<T, TGroup, true>>

/**
 * Picks all ApiProperty properties of TEntity with path in TPropertyKeys. TPropertyKeys can contain dot-paths for nested objects as well.
 */
export type PickApiProps<Entity extends ApiEntity, PropertyKeys extends Paths<SimplifyStructure<ApiResponse<Entity>>>> =
  PickDot<UnwrapEntity<ApiResponse<Entity>>, PropertyKeys>
