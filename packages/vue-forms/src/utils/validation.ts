import type { ErrorBag, ValidationErrors } from '../types/validation'

function deduplicate<T extends Array<unknown>>(arr: T): T {
  return arr.filter(
    (value, index, self) => self.indexOf(value) === index,
  ) as T
}

function mergeErrorMessages(...msgs: ValidationErrors[]) {
  return msgs.slice(1).reduce((acc, msg) => {
    if (!acc && !msg) {
      return undefined
    }
    const hasMsgErrors = (msg?.length ?? 0) > 0
    if (!acc && (msg?.length ?? 0) > 0) {
      return msg
    }
    if (!hasMsgErrors) {
      return acc
    }
    const allMessages = (acc ?? []).concat(msg!)
    return deduplicate(allMessages)
  }, msgs[0] as ValidationErrors)
}

function mergePropertyErrors(...propertyErrors: Record<string, ValidationErrors>[]): Record<string, ValidationErrors> {
  const allKeys = propertyErrors.map(errs => Object.keys(errs)).flat()

  return allKeys.reduce((acc, key) => {
    const values = propertyErrors.map(errs => errs[key]).filter(Boolean) as ValidationErrors[]

    return {
      ...acc,
      [key]: mergeErrorMessages(...values),
    }
  }, {} as Record<string, ValidationErrors>)
}

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
      general: mergeErrorMessages(acc.general, current.general),
      propertyErrors: mergePropertyErrors(acc.propertyErrors ?? {}, current.propertyErrors ?? {}),
    }),
    firstBag,
  )
}

export function hasErrors(errorBag: ErrorBag): boolean {
  const hasGeneralErrors = (errorBag.general?.length ?? 0) > 0
  const hasPropertyErrors = Object.entries(errorBag.propertyErrors).filter(([, errors]) => errors?.length).length > 0
  return hasGeneralErrors || hasPropertyErrors
}
