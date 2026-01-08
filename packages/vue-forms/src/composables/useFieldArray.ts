import { shallowRef, unref, watch } from 'vue'
import type {
  FieldArray,
  FieldArrayOptions,
  Form,
  FormDataDefault,
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

function mapIds<Item>(
  hashStore: HashStore<string[], Item>,
  items: Item[],
) {
  const mappedIds = new Set<string>()

  return items.map((item) => {
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
      }
    }

    // Otherwise create a new id
    const newId = crypto.randomUUID()
    hashStore.set(item, storeIds.concat([newId]))

    mappedIds.add(newId)

    return {
      id: newId,
      item,
    }
  })
}

export function useFieldArray<T extends FormDataDefault, K extends Paths<T>>(
  form: Form<T>,
  path: PickProps<T, K> extends unknown[] ? K : never,
  options?: FieldArrayOptions<PickProps<T, K> extends (infer U)[] ? U : never>,
): FieldArray<PickProps<T, K> extends (infer U)[] ? U : never> {
  type Items = PickProps<T, K>
  type Item = Items extends (infer U)[] ? U : never
  type Id = string
  type Field = {
    id: Id
    item: Item
  }

  const hashStore = new HashStore<string[], Item>(options?.hashFn)

  const arrayField = form.getField(path)

  const fields = shallowRef<Field[]>([])

  watch(
    arrayField.data,
    (newItems) => {
      fields.value = mapIds(hashStore, newItems) as Field[]
    },
    {
      immediate: true,
      flush: 'sync',
    },
  )

  const push = (item: Item) => {
    const current = (arrayField.data.value ?? []) as Item[]
    arrayField.setData([...current, item] as Items)
  }

  const remove = (value: Item) => {
    const current = (arrayField.data.value ?? []) as Item[]
    arrayField.setData(
      (current?.filter(item => item !== unref(value)) ?? []) as Items,
    )
  }

  const removeByIndex = (index: number) => {
    const current = (arrayField.data.value ?? []) as Item[]
    arrayField.setData((current?.filter((_, i) => i !== index) ?? []) as Items)
  }

  return {
    fields,
    push,
    remove,
    removeByIndex,
    errors: arrayField.errors,
    dirty: arrayField.dirty,
  }
}
