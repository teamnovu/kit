import { computed, isRef, unref, type MaybeRef } from 'vue'
import type { Paths, PickProps, SplitPath } from '../types/util'
import type { ErrorBag, ValidationErrors } from '../types/validation'

export function splitPath(path: string): string[] {
  if (path === '') {
    return []
  }
  return path.split(/\s*\.\s*/).filter(Boolean)
}

export function getNestedValue<T, K extends Paths<T>>(obj: T, path: K | SplitPath<K>) {
  const splittedPath = Array.isArray(path) ? path : splitPath(path)
  return splittedPath.reduce(
    (current, key) => current?.[key],
    obj as Record<string, never>,
  ) as PickProps<T, K>
}

export function setNestedValue<T, K extends Paths<T>>(obj: MaybeRef<T>, path: K | SplitPath<K>, value: PickProps<T, K>): void {
  const keys = Array.isArray(path) ? path : splitPath(path)

  const lastKey = keys.at(-1)!

  if (!lastKey) {
    if (!isRef(obj)) {
      // We cannot do anything here as we have nothing we can assign to
      return
    }

    obj.value = value
  } else {
    const target = keys
      .slice(0, -1)
      .reduce(
        (current, key) => {
          if (current?.[key] === undefined) {
            // Create the nested object if it doesn't exist
            current[key] = {}
          }
          return current?.[key]
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unref(obj) as Record<string, any>,
      )

    target[lastKey] = value
  }
}

export const getLens = <T, K extends Paths<T>>(data: MaybeRef<T>, key: MaybeRef<K | SplitPath<K>>) => {
  return computed({
    get() {
      return getNestedValue(unref(data), unref(key))
    },
    set(value: PickProps<T, K>) {
      setNestedValue(data, unref(key), value)
    },
  })
}

type JoinPath<Base extends string, Sub extends string> = `${Base}${Base extends '' ? '' : Sub extends '' ? '' : '.'}${Sub}`
export function joinPath<Base extends string, Sub extends string>(basePath: Base, subPath: Sub): JoinPath<Base, Sub> {
  if (!basePath && !subPath) {
    return '' as JoinPath<Base, Sub>
  }

  if (!basePath && subPath) {
    return subPath as JoinPath<Base, Sub>
  }

  if (!subPath && basePath) {
    return basePath as JoinPath<Base, Sub>
  }

  return `${basePath}.${subPath}` as JoinPath<Base, Sub>
}

export function filterErrorsForPath(errors: ErrorBag, path: string): ErrorBag {
  // Handle empty path - return all errors
  if (!path) {
    return errors
  }

  const pathPrefix = `${path}.`
  const filteredPropertyErrors: Record<string, ValidationErrors> = Object.fromEntries(
    Object.entries(errors.propertyErrors)
      .filter(([errorPath]) => {
        return errorPath.startsWith(pathPrefix)
      })
      .map(
        ([errorPath, errorMessages]) => [errorPath.slice(pathPrefix.length), errorMessages],
      ),
  )

  return {
    general: errors.general, // Keep general errors
    propertyErrors: filteredPropertyErrors,
  }
}
