import { shallowRef, watch } from 'vue'
import type {
  FieldArray,
  FieldArrayOptions,
  FieldItem,
  Form,
  FormDataDefault,
  FormField,
  HashFn,
} from '../types/form'
import type { Paths, PickProps } from '../types/util'

export class HashStore<T, Item = unknown> {
  private weakMap = new WeakMap<WeakKey, T>()
  private map = new Map<unknown, T>()
  private hashFn: HashFn<unknown, Item>

  constructor(hashFn: HashFn<unknown, Item> = item => item) {
    this.hashFn = hashFn
  }

  private isReferenceType(value: unknown): value is WeakKey {
    return typeof value === 'object' && value !== null
  }

  has(item: Item) {
    const hash = this.hashFn(item)
    if (this.isReferenceType(hash)) {
      return this.weakMap.has(hash)
    } else {
      return this.map.has(hash)
    }
  }

  get(item: Item) {
    const hash = this.hashFn(item)
    if (this.isReferenceType(hash)) {
      return this.weakMap.get(hash)
    } else {
      return this.map.get(hash)
    }
  }

  set(item: Item, value: T) {
    const hash = this.hashFn(item)
    if (this.isReferenceType(hash)) {
      this.weakMap.set(hash, value)
    } else {
      this.map.set(hash, value)
    }
  }
}

function mapIds<Item, Path extends string>(
  hashStore: HashStore<string[],
    Item>,
  items: Item[],
  basePath: Path,
): FieldItem<Item, Path>[] {
  const mappedIds = new Set<string>()

  return items.map((item, i) => {
    const storeIds = [...(hashStore.get(item) ?? [])]

    // Remove all used ids
    const firstNotUsedId = storeIds.findIndex(id => !mappedIds.has(id))
    const ids = firstNotUsedId === -1 ? [] : storeIds.slice(firstNotUsedId)

    const matchingId = ids[0]

    // If we have an id that is not used yet, use it
    if (matchingId) {
      mappedIds.add(matchingId)
      return {
        id: matchingId,
        item,
        path: `${basePath}.${i}`,
      }
    }

    // Otherwise create a new id
    const newId = crypto.randomUUID()
    hashStore.set(item, storeIds.concat([newId]))

    mappedIds.add(newId)

    return {
      id: newId,
      item,
      path: `${basePath}.${i}`,
    }
  })
}

export function useFieldArray<T extends FormDataDefault, K extends Paths<T>, TOut = T>(
  form: Form<T, TOut>,
  path: PickProps<T, K> extends unknown[] ? K : never,
  options?: FieldArrayOptions<PickProps<T, K> extends (infer U)[] ? U : never>,
): FieldArray<PickProps<T, K> extends (infer U)[] ? U : never, typeof path> {
  type Items = PickProps<T, K>
  type Item = Items extends (infer U)[] ? U : never
  type Id = string
  type Path = typeof path
  type Field = {
    id: Id
    item: Item
    path: `${Path}.${number}`
  }

  const hashStore = new HashStore<string[], Item>(options?.hashFn)

  // We only cast to unknown because we know that the constriant holds true
  const arrayField = form.getField(path) as unknown as FormField<Item[], Path>

  const items = shallowRef<Field[]>([])

  watch(
    arrayField.data,
    (newItems) => {
      items.value = mapIds(hashStore, newItems, path) as Field[]
    },
    {
      immediate: true,
      flush: 'sync',
    },
  )

  const push = (item: Item) => {
    const current = (arrayField.data.value ?? []) as Item[]
    arrayField.setData([...current, item] as Items)

    return items.value.at(-1)!
  }

  const remove = (id: Id) => {
    const currentData = (arrayField.data.value ?? []) as Item[]
    const currentItem = items.value.findIndex(
      ({ id: itemId }) => itemId === id,
    )

    if (currentItem === -1) {
      return
    }

    arrayField.setData(
      currentData
        .slice(0, currentItem)
        .concat(currentData.slice(currentItem + 1)) as Items,
    )
  }

  const insert = (item: Item, index: number) => {
    const currentData = (arrayField.data.value ?? []) as Item[]

    arrayField.setData(
      currentData
        .slice(0, index)
        .concat([item])
        .concat(currentData.slice(index)) as Items,
    )

    return items.value[index]!
  }

  return {
    items,
    push,
    remove,
    insert,
    field: arrayField,
  }
}
