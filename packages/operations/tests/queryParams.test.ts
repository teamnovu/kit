import { describe, expect, it } from 'vitest'
import { appendQueryParams } from '../src/queryParams'

describe('appendQueryParams', () => {
  it('returns the url untouched when there are no params', () => {
    const url = appendQueryParams('/api/projects')

    expect(url).toBe('/api/projects')
  })

  it('returns the url untouched when every param is empty', () => {
    const url = appendQueryParams('/api/projects', {
      name: undefined,
      owner: null,
    })

    expect(url).toBe('/api/projects')
  })

  it('appends scalar params', () => {
    const url = appendQueryParams('/api/projects', {
      name: 'kit',
      itemsPerPage: 5,
    })

    expect(url).toBe('/api/projects?name=kit&itemsPerPage=5')
  })

  it('expands arrays into bracket notation', () => {
    const url = appendQueryParams('/api/projects', { status: ['open', 'closed'] })

    expect(decodeURIComponent(url)).toBe('/api/projects?status[]=open&status[]=closed')
  })

  it('expands nested objects into bracket notation', () => {
    const url = appendQueryParams('/api/projects', { order: { createdAt: 'desc' } })

    expect(decodeURIComponent(url)).toBe('/api/projects?order[createdAt]=desc')
  })

  it('expands objects nested in arrays', () => {
    const url = appendQueryParams('/api/projects', { filter: [{ name: 'kit' }] })

    expect(decodeURIComponent(url)).toBe('/api/projects?filter[][name]=kit')
  })

  it('drops empty values from within an array', () => {
    const url = appendQueryParams('/api/projects', { status: ['open', null, 'closed'] })

    expect(decodeURIComponent(url)).toBe('/api/projects?status[]=open&status[]=closed')
  })

  it('joins onto a url that already carries a query string', () => {
    const url = appendQueryParams('/api/projects?page=2', { name: 'kit' })

    expect(url).toBe('/api/projects?page=2&name=kit')
  })

  it('keeps a repeated key name that is not a cycle', () => {
    const url = appendQueryParams('/api/projects', { filter: { user: { user: 5 } } })

    expect(decodeURIComponent(url)).toBe('/api/projects?filter[user][user]=5')
  })

  it('drops a value that refers back to itself', () => {
    const filter = { name: 'test' } as Record<string, unknown>
    filter.self = filter

    const url = appendQueryParams('/api/projects', { filter })

    expect(decodeURIComponent(url)).toBe('/api/projects?filter[name]=test')
  })

  it('drops a cycle that closes through an array', () => {
    const filter = { name: 'test' } as Record<string, unknown>
    filter.group = [filter]

    const url = appendQueryParams('/api/projects', { filter })

    expect(decodeURIComponent(url)).toBe('/api/projects?filter[name]=test')
  })

  it('drops a cycle between two values', () => {
    const owner = { name: 'ada' } as Record<string, unknown>
    const project = {
      name: 'kit',
      owner,
    }
    owner.project = project

    const url = appendQueryParams('/api/projects', { filter: project })

    expect(decodeURIComponent(url)).toBe('/api/projects?filter[name]=kit&filter[owner][name]=ada')
  })
})
