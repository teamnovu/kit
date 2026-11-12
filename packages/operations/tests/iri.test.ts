import { describe, expect, it } from 'vitest'
import { getIdFromIRI, mapArrayOfIdFromIRI, mapIdFromIRIByKey } from '../src/iri'

describe('getIdFromIRI', () => {
  it('returns the id of an item IRI', () => {
    expect(getIdFromIRI('/api/projects/12')).toBe('12')
    expect(getIdFromIRI('/api/projects/0b3c5a8e-7d1f-4c2e-9a6b-1f2e3d4c5b6a')).toBe('0b3c5a8e-7d1f-4c2e-9a6b-1f2e3d4c5b6a')
  })

  it('ignores a query string or fragment', () => {
    expect(getIdFromIRI('/api/projects/12?expand=owner')).toBe('12')
    expect(getIdFromIRI('/api/projects/12#members')).toBe('12')
  })

  it('returns undefined for anything it cannot parse', () => {
    expect(getIdFromIRI('/api/projects')).toBeUndefined()
    expect(getIdFromIRI('/projects/12')).toBeUndefined()
    expect(getIdFromIRI('')).toBeUndefined()
    expect(getIdFromIRI(null)).toBeUndefined()
    expect(getIdFromIRI(undefined)).toBeUndefined()
    expect(getIdFromIRI(12 as unknown as string)).toBeUndefined()
  })
})

describe('mapArrayOfIdFromIRI', () => {
  it('maps IRIs to ids and drops what cannot be parsed', () => {
    expect(mapArrayOfIdFromIRI(['/api/projects/1', null, 'nonsense', '/api/projects/2', undefined])).toEqual(['1', '2'])
  })

  it('returns an empty list for undefined', () => {
    expect(mapArrayOfIdFromIRI(undefined)).toEqual([])
  })
})

describe('mapIdFromIRIByKey', () => {
  it('reads the IRI from @id by default', () => {
    const projects = [{ '@id': '/api/projects/1' }, { '@id': null }, { '@id': '/api/projects/3' }]

    expect(mapIdFromIRIByKey(projects)).toEqual(['1', '3'])
  })

  it('reads the IRI from the given key', () => {
    const tasks = [{ project: '/api/projects/4' }, { project: undefined }]

    expect(mapIdFromIRIByKey(tasks, 'project')).toEqual(['4'])
  })

  it('returns an empty list for undefined', () => {
    expect(mapIdFromIRIByKey(undefined)).toEqual([])
  })
})
