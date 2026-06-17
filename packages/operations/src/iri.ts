type IriInput = string | undefined | null;

export function getIdFromIRI(iri: string | undefined | null): string | undefined {
  const match = iri?.match(/\/api\/[^/]+\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (!match) {
    return undefined;
  }
  const [_, id] = match;
  return id;
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
    .filter((id: string | undefined): id is string => id !== undefined);
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
    .filter((id: string | undefined): id is string => id !== undefined);
}
