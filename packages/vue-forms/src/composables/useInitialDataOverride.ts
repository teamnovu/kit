import { merge } from 'lodash-es'
import {
  computed,
  shallowReactive,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue'
import type { FormDataDefault } from '../types/form'
import type { Paths, PickProps } from '../types/util'
import { cloneRefValue } from '../utils/general'
import {
  dropOverridesAtAndBelow,
  getNestedValue,
  setNestedValue,
} from '../utils/path'

export interface InitialDataOverride<T extends FormDataDefault> {
  effectiveInitialData: ComputedRef<T>
  set: (path: string, value: unknown, options?: { replace?: boolean }) => void
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v)

export function useInitialDataOverride<T extends FormDataDefault>(
  initialData: Ref<T> | ComputedRef<T>,
): InitialDataOverride<T> {
  const overrides = shallowReactive(
    new Map<string, { value: unknown; replace: boolean }>(),
  )

  const effectiveInitialData = computed<T>(() => {
    const result = cloneRefValue(initialData)

    const sortedEntries = [...overrides.entries()].sort(
      ([a], [b]) => a.split('.').length - b.split('.').length,
    )

    for (const [path, entry] of sortedEntries) {
      const typedPath = path as Paths<T>
      const existing = getNestedValue<T, Paths<T>>(result, typedPath)

      const nextValue
        = entry.replace || !isPlainObject(entry.value) || !isPlainObject(existing)
          ? entry.value
          : merge({}, existing, entry.value)

      setNestedValue<T, Paths<T>>(
        result,
        typedPath,
        nextValue as PickProps<T, Paths<T>>,
      )
    }

    return result
  })

  // External initialData reassignment wipes all overrides. Programmatic
  // overrides via setInitialData stay scoped to their own subtrees.
  watch(
    initialData,
    () => {
      overrides.clear()
    },
    { flush: 'sync' },
  )

  return {
    effectiveInitialData,
    set(path, value, options) {
      dropOverridesAtAndBelow(overrides, path)
      overrides.set(path, { value, replace: options?.replace ?? false })
    },
  }
}
