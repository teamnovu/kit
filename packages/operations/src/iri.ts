type IriInput = string | undefined | null

export function getIdFromIRI(iri: string | undefined | null): string | undefined {
  // Guard against non-string values reaching `.match()` (callers may cast through
  // `IriInput`, e.g. `mapIdFromIRIByKey`), which would throw a runtime TypeError.
  if (typeof iri !== 'string') {
    return undefined
  }
  const match = iri.match(/\/api\/[^/]+\/([^/?#]+)/)
  if (!match) {
    return undefined
  }
  const [_, id] = match
  return id
}

/**
 * Takes a flat array of IRIs and transforms it into an array of numeric IDs.
 *
 * Input,
 * ```
 * ['/api/company_processes/1', '/api/company_processes/2', '/api/company_processes/3']
 * ```
 *
 * Would become:
 * ```
 * [1, 2, 3]
 * ```
 *
 * It additionally guarantees that the returned array doesn't contain undefined values.
 */
export function mapArrayOfIdFromIRI(list: IriInput[] | undefined): string[] {
  return (list ?? [])
    .map(item => getIdFromIRI(item))
    .filter((id: string | undefined): id is string => id !== undefined)
}

/**
 * Takes an array objects and returns an array of numeric IDs. The IRI is read from each objects
 * according to the provided key (defaults to '@id').
 *
 * It additionally guarantees that the returned array doesn't contain undefined values.
 */
export function mapIdFromIRIByKey<T>(
  list: T[] | undefined,
  key: keyof T = '@id' as keyof T,
): string[] {
  return (list ?? [])
    .map(item => getIdFromIRI(item[key] as IriInput))
    .filter((id: string | undefined): id is string => id !== undefined)
}
