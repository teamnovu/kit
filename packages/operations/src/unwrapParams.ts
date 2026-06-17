import { mapValues } from 'lodash-es';
import { type MaybeRef, unref } from 'vue';

/**
 * Deeply unwraps an API params bag. Each section (`params`/`queryParams`/`body`) may be a
 * ref/computed, and so may each of a section's properties. This returns plain values so
 * `paramsFn` transforms never have to deal with refs/computed when reading or spreading.
 */
export function deepUnwrapParams<T>(
  bag: MaybeRef<T> | undefined,
): T {
  return mapValues(
    (unref(bag) ?? {}) as Record<string, unknown>,
    (section) => {
      const unrefedSection = unref(section);
      return unrefedSection !== null
        && typeof unrefedSection === 'object'
        && !Array.isArray(unrefedSection)
        ? mapValues(unrefedSection, v => unref(v))
        : unrefedSection;
    },
  ) as T;
}
