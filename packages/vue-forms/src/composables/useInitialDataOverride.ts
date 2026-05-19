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

export type InitialDataOverrideScope = 'tree' | 'subtree'

export interface InitialDataOverrideSetOptions {
  replace?: boolean
  scope?: InitialDataOverrideScope
}

export interface InitialDataOverride<T extends FormDataDefault> {
  // Full merge of external initialData with all overrides regardless of scope.
  // Used by form.reset() to rebuild the data tree.
  effectiveInitialData: ComputedRef<T>
  // Per-field baseline resolution. Honors scope: subtree-scoped overrides at
  // paths strictly below `path` are invisible to that read, so ancestors keep
  // their external baseline and stay dirty when descendants extend the tree.
  resolveAt: (path: string) => unknown
  set: (
    path: string,
    value: unknown,
    options?: InitialDataOverrideSetOptions,
  ) => void
}

interface OverrideEntry {
  value: unknown
  replace: boolean
  scope: InitialDataOverrideScope
}

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (v === null || typeof v !== 'object') return false
  const proto = Object.getPrototypeOf(v)
  // Only treat literal `{}` / `Object.create(null)` as mergeable. Class
  // instances, Date, Map, Set, RegExp, etc. have no enumerable own props for
  // lodash.merge to copy and would silently collapse to `{}`.
  return proto === Object.prototype || proto === null
}

const isStrictDescendant = (candidate: string, ancestor: string): boolean => {
  if (ancestor === '') return candidate !== ''
  return candidate.startsWith(ancestor + '.')
}

export function useInitialDataOverride<T extends FormDataDefault>(
  initialData: Ref<T> | ComputedRef<T>,
): InitialDataOverride<T> {
  const overrides = shallowReactive(new Map<string, OverrideEntry>())

  const buildTree = (readingPath?: string): T => {
    const result = cloneRefValue(initialData)
    const sortedEntries = [...overrides.entries()].sort(
      ([a], [b]) => a.split('.').length - b.split('.').length,
    )

    for (const [path, entry] of sortedEntries) {
      // For a per-field read, skip subtree-scoped overrides that live strictly
      // below the reading path — those anchors must remain invisible to
      // ancestors of their own subtree.
      if (
        readingPath !== undefined
        && entry.scope === 'subtree'
        && isStrictDescendant(path, readingPath)
      ) {
        continue
      }

      const typedPath = path as Paths<T>
      const existing = getNestedValue<T, Paths<T>>(result, typedPath)

      const nextValue = entry.replace || !isPlainObject(entry.value) || !isPlainObject(existing)
        ? entry.value
        : merge({}, existing, entry.value)

      setNestedValue<T, Paths<T>>(
        result,
        typedPath,
        nextValue as PickProps<T, Paths<T>>,
      )
    }

    return result
  }

  const effectiveInitialData = computed<T>(() => buildTree())

  const resolveAt = (path: string): unknown => {
    const tree = buildTree(path)
    if (path === '') return tree
    return getNestedValue<T, Paths<T>>(tree, path as Paths<T>)
  }

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
    resolveAt,
    set(path, value, options) {
      dropOverridesAtAndBelow(overrides, path)
      overrides.set(path, {
        value,
        replace: options?.replace ?? false,
        scope: options?.scope ?? 'tree',
      })
    },
  }
}
