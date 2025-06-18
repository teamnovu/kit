const isIgnored = (value: unknown) =>
  value === undefined
  || value === null
  || (typeof value === 'number' && isNaN(value as number))
  || typeof value === 'function'

export function createQueryParams(params: Record<string, unknown>) {
  const queryParams = new URLSearchParams()

  const appendNested = (key: string, value: unknown) => {
    if (isIgnored(value)) {
      return
    }

    if (typeof value === 'object') {
      queryParams.append(key, JSON.stringify(value))
    }

    queryParams.append(key, String(value))
  }

  for (const [key, value] of Object.entries(params)) {
    if (isIgnored(value)) {
      continue
    }

    if (typeof value === 'string') {
      queryParams.append(key, String(value))
    } else if (Array.isArray(value)) {
      for (const item of value) {
        appendNested(`${key}[]`, item)
      }
    } else {
      appendNested(key, value)
    }
  }

  return queryParams
}
