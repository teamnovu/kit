import { getIdFromIRI } from './iri'
import { hashKey, type QueryClient, type QueryKey } from '@tanstack/vue-query'
import type { AtType, Id, Resource } from './types'

/** Global registry: serialized resource → (hashed query key → query key). */
export const resourceIndex = new Map<string, Map<string, QueryKey>>()

export function serializeResource(resource: Resource): string {
  return typeof resource === 'string'
    ? resource
    : resource[1]
      ? `${resource[0]}\0${resource[1]}`
      : resource[0]
}

export function registerQueryResources(resources: Set<Resource>, queryKey: QueryKey): void {
  const qKey = hashKey(queryKey)

  const newRKeys = new Set<string>()
  for (const resource of resources) {
    newRKeys.add(serializeResource(resource))
  }

  // Register queryKey under current resources
  for (const rKey of newRKeys) {
    let map = resourceIndex.get(rKey)
    if (!map) {
      map = new Map()
      resourceIndex.set(rKey, map)
    }
    map.set(qKey, queryKey)
  }
}

/**
 * Recursively walks a JSON-LD response and collects all `@type` values.
 * Handles single resources, hydra collections, and nested objects.
 */
export function extractResourceTypes(data: unknown): Set<Resource> {
  const types = new Set<Resource>()

  const getId = (obj: Record<string, unknown>): Id | undefined => {
    return typeof obj.id === 'string'
      ? obj.id
      : getIdFromIRI(obj['@id'] as string | undefined)
  }

  function walk(obj: unknown): void {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        walk(item)
      };

      return
    }

    const record = obj as Record<string, unknown>
    const id = getId(record)

    if (typeof record['@type'] === 'string') {
      if (id) {
        types.add([record['@type'] as AtType, id])
      }
    }

    for (const value of Object.values(record)) {
      if (typeof value === 'object' && value !== null) {
        walk(value)
      }
    }
  }

  walk(data)
  return types
}

/**
 * Invalidates all cached queries that have returned data containing the given resource type(s).
 * Uses the global resource index populated automatically when query functions fetch data.
 * Resources declared via `.resources()` in the endpoint builder are also pre-registered.
 *
 * Stale entries (query keys no longer in the cache) are pruned lazily on each call.
 *
 * @example
 * // In a mutation's onSuccess:
 * await invalidateResources(queryClient, 'User');
 *
 * // Multiple resources at once:
 * await invalidateResources(queryClient, 'NatPerson', 'InvolvedPerson');
 *
 * // Specific resource instance:
 * await invalidateResources(queryClient, ['User', userId]);
 */
export function invalidateResources(
  queryClient: QueryClient,
  ...resources: Resource[]
): Promise<void[]> {
  const cache = queryClient.getQueryCache()

  const uniqueKeys = new Map<string, QueryKey>()

  for (const resource of resources) {
    const rKeys: string[] = [serializeResource(resource)]

    // A plain AtType tag also matches all id-specific tags of that type
    if (typeof resource === 'string' || !resource[1]) {
      const exact = typeof resource === 'string' ? resource : resource[0]
      const prefix = `${exact}\0`
      for (const key of resourceIndex.keys()) {
        if (key.startsWith(prefix) || key === exact) {
          rKeys.push(key)
        }
      }
    }

    for (const rKey of rKeys) {
      const map = resourceIndex.get(rKey)
      if (!map) continue

      for (const [qKey, queryKey] of map) {
        if (cache.find({
          queryKey,
          exact: false,
        })) {
          uniqueKeys.set(qKey, queryKey)
        } else {
          map.delete(qKey)
        }
      }
    }
  }

  return Promise.all(
    [...uniqueKeys.values()].map(queryKey =>
      queryClient.invalidateQueries({
        queryKey,
      })),
  )
}
