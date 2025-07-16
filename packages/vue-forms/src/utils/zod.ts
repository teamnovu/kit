import z from 'zod'
import type { ErrorBag } from '../types/validation'

export function flattenError(error: z.ZodError): ErrorBag {
  const general = error.issues
    .filter(issue => issue.path.length === 0)
    .map(issue => issue.message)

  const propertyErrors = error.issues
    .filter(issue => issue.path.length > 0)
    .reduce((acc, issue) => {
      const path = issue.path.join('.')

      return {
        ...acc,
        [path]: [...(acc[path] ?? []), issue.message],
      }
    }, {} as ErrorBag['propertyErrors'])

  return {
    general,
    propertyErrors,
  }
}
