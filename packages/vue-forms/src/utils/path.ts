import type { Paths, PickDot } from '../types/util'

export function splitPath(path: string): string[] {
  return path.split(/\.|\[|\]\.?/).filter(Boolean)
}

export function getNestedValue<T, K extends Paths<T>>(obj: T, path: K | string[]) {
  const splittedPath = Array.isArray(path) ? path : splitPath(path)
  return splittedPath.reduce(
    (current, key) => current?.[key],
    obj as Record<string, never>,
  ) as PickDot<T, K> | undefined
}

export function setNestedValue<T, K extends Paths<T>>(obj: T, path: K | string[], value: PickDot<T, K>): void {
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
