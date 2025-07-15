import type { ErrorBag } from '../types/validation'

export function mergeErrors(...errorBags: ErrorBag[]): ErrorBag {
  if (!errorBags.length) {
    return {
      general: [],
      propertyErrors: {},
    }
  }

  const firstBag = errorBags[0]

  if (errorBags.length === 1) {
    return firstBag
  }

  return errorBags.slice(1).reduce(
    (acc, current) => ({
      general: [...acc.general, ...current.general],
      // TODO: Merge property errors by appending and dedupe
      propertyErrors: {
        ...acc.propertyErrors,
        ...current.propertyErrors,
      },
    }),
    firstBag,
  )
}

export function hasErrors(errorBag: ErrorBag): boolean {
  return errorBag.general.length > 0 || Object.keys(errorBag.propertyErrors).length > 0
}
