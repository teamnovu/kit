type QueryParamEntry = [key: string, value: string]

/**
 * Expands a single query parameter into the bracket notation API Platform filters expect:
 * arrays become `key[]`, nested objects become `key[nested]`, and `null`/`undefined` drop out.
 */
function toQueryParamEntries(key: string, value: unknown): QueryParamEntry[] {
  if (value === undefined || value === null) {
    return []
  }

  if (Array.isArray(value)) {
    return value.flatMap(item => toQueryParamEntries(`${key}[]`, item))
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .flatMap(([nestedKey, nestedValue]) => toQueryParamEntries(`${key}[${nestedKey}]`, nestedValue))
  }

  return [[key, String(value)]]
}

/**
 * Serializes a query params bag onto a URL. Meant for transports: the package hands the params to
 * the transport as a plain object, and this turns them into the query string API Platform expects.
 */
export function appendQueryParams(url: string, queryParams?: Record<string, unknown>): string {
  const entries = Object.entries(queryParams ?? {})
    .flatMap(([key, value]) => toQueryParamEntries(key, value))

  const search = new URLSearchParams(entries).toString()
  if (!search) {
    return url
  }

  const fragmentIndex = url.indexOf('#')
  const baseUrl = fragmentIndex === -1 ? url : url.slice(0, fragmentIndex)
  const fragment = fragmentIndex === -1 ? '' : url.slice(fragmentIndex)
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${search}${fragment}`
}
