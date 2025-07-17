import { toRaw, toValue, type MaybeRefOrGetter } from 'vue'

export function cloneRefValue<T>(ref: MaybeRefOrGetter<T> | MaybeRefOrGetter<Readonly<T>>): T {
  const unreffed = toValue(ref)
  const raw = toRaw(unreffed)
  return structuredClone(raw) as T
}
