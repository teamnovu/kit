import { type MaybeRefOrGetter, toRaw, toValue } from 'vue'
import { cloneDeep } from 'lodash-es'

export function cloneRefValue<T>(ref: MaybeRefOrGetter<T> | MaybeRefOrGetter<Readonly<T>>): T {
  const unreffed = toValue(ref)
  const raw = toRaw(unreffed)
  return cloneDeep(raw) as T
}
