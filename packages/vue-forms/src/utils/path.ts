import { computed, unref, type MaybeRef } from 'vue'
import type { Paths, PickProps, SplitPath } from '../types/util'

export function splitPath(path: string): string[] {
  return path.split(/\.|\[|\]\.?/).filter(Boolean)
}

export function getNestedValue<T, K extends Paths<T>>(obj: T, path: K | SplitPath<K>) {
  const splittedPath = Array.isArray(path) ? path : splitPath(path)
  return splittedPath.reduce(
    (current, key) => current?.[key],
    obj as Record<string, never>,
  ) as PickProps<T, K> | undefined
}

export function setNestedValue<T, K extends Paths<T>>(obj: T, path: K | SplitPath<K>, value: PickProps<T, K>): void {
  const keys = Array.isArray(path) ? path : splitPath(path)
  if (keys.length === 0) {
    throw new Error('Path cannot be empty')
  }

  const lastKey = keys.at(-1)!
  const target = keys
    .slice(0, -1)
    .reduce(
      (current, key) => current[key],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj as Record<string, any>,
    )

  target[lastKey] = value
}

export const getLens = <T, K extends Paths<T>>(formData: MaybeRef<T>, key: MaybeRef<K | SplitPath<K>>) => {
  return computed({
    get() {
      return getNestedValue(unref(formData), unref(key))
    },
    set(value: PickProps<T, K>) {
      setNestedValue(unref(formData), unref(key), value)
    },
  })
}
