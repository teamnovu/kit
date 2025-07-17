import { describe, it, expect } from 'vitest'
import { joinPath, filterErrorsForPath } from '../src/utils/path'
import type { ErrorBag } from '../src/types/validation'

describe('Path Utilities', () => {
  describe('joinPath', () => {
    it('should join simple paths', () => {
      const result = joinPath('user', 'name')
      expect(result).toBe('user.name')
    })

    it('should handle empty base path', () => {
      const result = joinPath('', 'name')
      expect(result).toBe('name')
    })

    it('should handle empty sub path', () => {
      const result = joinPath('user', '')
      expect(result).toBe('user')
    })

    it('should handle both empty paths', () => {
      const result = joinPath('', '')
      expect(result).toBe('')
    })

    it('should join nested paths', () => {
      const result = joinPath('user.profile', 'preferences.theme')
      expect(result).toBe('user.profile.preferences.theme')
    })

    it('should handle paths with array indices', () => {
      const result = joinPath('users.0', 'addresses.1.street')
      expect(result).toBe('users.0.addresses.1.street')
    })

    it('should handle null or undefined paths', () => {
      expect(joinPath(null as any, 'name')).toBe('name')
      expect(joinPath('user', null as any)).toBe('user')
      expect(joinPath(undefined as any, 'name')).toBe('name')
      expect(joinPath('user', undefined as any)).toBe('user')
    })
  })

  describe('filterErrorsForPath', () => {
    it('should filter errors for specific path', () => {
      const errors: ErrorBag = {
        general: ['General error'],
        propertyErrors: {
          'user.name': ['Name required'],
          'user.email': ['Invalid email'],
          'company.name': ['Company name required'],
        },
      }

      const filtered = filterErrorsForPath(errors, 'user')
      expect(filtered.general).toEqual(['General error'])
      expect(filtered.propertyErrors).toEqual({
        name: ['Name required'],
        email: ['Invalid email'],
      })
    })

    it('should handle nested path filtering', () => {
      const errors: ErrorBag = {
        general: [],
        propertyErrors: {
          'user.profile.name': ['Name required'],
          'user.profile.bio': ['Bio too short'],
          'user.settings.theme': ['Invalid theme'],
        },
      }

      const filtered = filterErrorsForPath(errors, 'user.profile')
      expect(filtered.propertyErrors).toEqual({
        name: ['Name required'],
        bio: ['Bio too short'],
      })
    })

    it('should handle paths with no matching errors', () => {
      const errors: ErrorBag = {
        general: ['General error'],
        propertyErrors: {
          'user.name': ['Name required'],
          'company.name': ['Company name required'],
        },
      }

      const filtered = filterErrorsForPath(errors, 'profile')
      expect(filtered.general).toEqual(['General error'])
      expect(filtered.propertyErrors).toEqual({})
    })

    it('should handle empty error object', () => {
      const errors: ErrorBag = {
        general: [],
        propertyErrors: {},
      }

      const filtered = filterErrorsForPath(errors, 'user')
      expect(filtered.general).toEqual([])
      expect(filtered.propertyErrors).toEqual({})
    })

    it('should handle array path filtering', () => {
      const errors: ErrorBag = {
        general: [],
        propertyErrors: {
          'contacts.0.name': ['Name required'],
          'contacts.0.email': ['Invalid email'],
          'contacts.1.name': ['Name required'],
        },
      }

      const filtered = filterErrorsForPath(errors, 'contacts.0')
      expect(filtered.propertyErrors).toEqual({
        name: ['Name required'],
        email: ['Invalid email'],
      })
    })

    it('should handle exact path matches', () => {
      const errors: ErrorBag = {
        general: [],
        propertyErrors: {
          'user': ['User error'],
          'user.name': ['Name required'],
          'username': ['Username taken'],
        },
      }

      const filtered = filterErrorsForPath(errors, 'user')
      expect(filtered.propertyErrors).toEqual({
        name: ['Name required'],
      })
    })

    it('should handle root path filtering', () => {
      const errors: ErrorBag = {
        general: ['General error'],
        propertyErrors: {
          'name': ['Name required'],
          'email': ['Invalid email'],
          'user.name': ['User name required'],
        },
      }

      const filtered = filterErrorsForPath(errors, '')
      expect(filtered.general).toEqual(['General error'])
      expect(filtered.propertyErrors).toEqual({
        'name': ['Name required'],
        'email': ['Invalid email'],
        'user.name': ['User name required'],
      })
    })
  })
})

