import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'

describe('Subform Validation Integration', () => {
  describe('Schema Merging', () => {
    it('should merge subform schemas into main schema', async () => {
      const form = useForm({
        initialData: {
          user: {
            name: '',
            email: '',
          },
        },
        schema: z.object({
          user: z.object({
            name: z.string().min(1, 'Name required'),
          }),
        }),
      })

      form.getSubForm('user', {
        schema: z.object({
          email: z.string().email('Invalid email'),
        }),
      })

      // Set invalid data
      form.formData.value.user.name = ''
      form.formData.value.user.email = 'invalid'

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.name']).toContain('Name required')
      expect(result.errors.propertyErrors['user.email']).toContain('Invalid email')
    })

    it('should handle nested schema merging', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              name: '',
              bio: '',
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      userForm.getSubForm('profile', {
        schema: z.object({
          name: z.string().min(1, 'Name required'),
          bio: z.string().min(10, 'Bio too short'),
        }),
      })

      // Set invalid data
      form.formData.value.user.profile.name = ''
      form.formData.value.user.profile.bio = 'short'

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.profile.name']).toContain('Name required')
      expect(result.errors.propertyErrors['user.profile.bio']).toContain('Bio too short')
    })

    it('should handle multiple subform schemas at same level', async () => {
      const form = useForm({
        initialData: {
          user: {
            name: '',
            email: '',
          },
          company: {
            name: '',
            website: '',
          },
        },
      })

      form.getSubForm('user', {
        schema: z.object({
          name: z.string().min(1, 'User name required'),
          email: z.string().email('Invalid user email'),
        }),
      })

      form.getSubForm('company', {
        schema: z.object({
          name: z.string().min(1, 'Company name required'),
          website: z.string().url('Invalid website'),
        }),
      })

      // Set invalid data
      form.formData.value.user.name = ''
      form.formData.value.user.email = 'invalid'
      form.formData.value.company.name = ''
      form.formData.value.company.website = 'invalid'

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.name']).toContain('User name required')
      expect(result.errors.propertyErrors['user.email']).toContain('Invalid user email')
      expect(result.errors.propertyErrors['company.name']).toContain('Company name required')
      expect(result.errors.propertyErrors['company.website']).toContain('Invalid website')
    })

    it('should handle schema override scenarios', async () => {
      const form = useForm({
        initialData: { user: { name: '' } },
        schema: z.object({
          user: z.object({
            name: z.string().min(1, 'Name required'),
          }),
        }),
      })

      // First subform with different validation
      form.getSubForm('user', {
        schema: z.object({
          name: z.string().min(5, 'Name must be at least 5 characters'),
        }),
      })

      // Second subform with different validation for same path
      form.getSubForm('user', {
        schema: z.object({
          name: z.string().min(10, 'Name must be at least 10 characters'),
        }),
      })

      form.formData.value.user.name = 'short'

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      // Last registered schema should take precedence
      expect(result.errors.propertyErrors['user.name']).toContain('Name must be at least 10 characters')
    })
  })

  describe('Validation Function Merging', () => {
    it('should merge validation functions with path transformation', async () => {
      const form = useForm({
        initialData: { user: { name: 'admin' } },
      })

      form.getSubForm('user', {
        validateFn: async data => ({
          isValid: data.name !== 'admin',
          errors: {
            general: [],
            propertyErrors: {
              name: data.name === 'admin' ? ['Admin name not allowed'] : [],
            },
          },
        }),
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.name']).toContain('Admin name not allowed')
    })

    it('should handle multiple validation functions', async () => {
      const form = useForm({
        initialData: {
          user: {
            name: 'admin',
            email: 'admin@test.com',
          },
        },
      })

      form.getSubForm('user', {
        validateFn: async data => ({
          isValid: data.name !== 'admin' && data.email !== 'admin@test.com',
          errors: {
            general: [],
            propertyErrors: {
              name: data.name === 'admin' ? ['Admin name not allowed'] : [],
              email: data.email === 'admin@test.com' ? ['Admin email not allowed'] : [],
            },
          },
        }),
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.name']).toContain('Admin name not allowed')
      expect(result.errors.propertyErrors['user.email']).toContain('Admin email not allowed')
    })

    it('should handle nested validation functions', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              name: 'admin',
              bio: 'admin bio',
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      userForm.getSubForm('profile', {
        validateFn: async data => ({
          isValid: data.name !== 'admin' && data.bio !== 'admin bio',
          errors: {
            general: [],
            propertyErrors: {
              name: data.name === 'admin' ? ['Admin name not allowed'] : [],
              bio: data.bio === 'admin bio' ? ['Admin bio not allowed'] : [],
            },
          },
        }),
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.profile.name']).toContain('Admin name not allowed')
      expect(result.errors.propertyErrors['user.profile.bio']).toContain('Admin bio not allowed')
    })
  })

  describe('Mixed Validation (Schema + Function)', () => {
    it('should handle both schema and validation function on same subform', async () => {
      const form = useForm({
        initialData: {
          user: {
            name: 'admin',
            email: 'invalid',
          },
        },
      })

      form.getSubForm('user', {
        schema: z.object({
          email: z.string().email('Invalid email format'),
        }),
        validateFn: async data => ({
          isValid: data.name !== 'admin',
          errors: {
            general: [],
            propertyErrors: {
              name: data.name === 'admin' ? ['Admin name not allowed'] : [],
            },
          },
        }),
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.name']).toContain('Admin name not allowed')
      expect(result.errors.propertyErrors['user.email']).toContain('Invalid email format')
    })

    it('should handle main form validation with subform validation', async () => {
      const form = useForm({
        initialData: {
          globalSetting: 'invalid',
          user: { name: 'admin' },
        },
        schema: z.object({
          globalSetting: z.string().min(5, 'Global setting too short'),
        }),
      })

      form.getSubForm('user', {
        validateFn: async data => ({
          isValid: data.name !== 'admin',
          errors: {
            general: [],
            propertyErrors: {
              name: data.name === 'admin' ? ['Admin name not allowed'] : [],
            },
          },
        }),
      })

      // Set invalid data to trigger both validations
      form.formData.value.globalSetting = 'abc' // Too short (< 5 chars)

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['globalSetting']).toContain('Global setting too short')
      expect(result.errors.propertyErrors['user.name']).toContain('Admin name not allowed')
    })
  })

  describe('Error Filtering for Subforms', () => {
    it('should filter validation errors to subform scope', async () => {
      const form = useForm({
        initialData: {
          user: {
            name: '',
            email: '',
          },
          company: { name: '' },
        },
        schema: z.object({
          user: z.object({
            name: z.string().min(1, 'User name required'),
            email: z.string().email('Invalid user email'),
          }),
          company: z.object({
            name: z.string().min(1, 'Company name required'),
          }),
        }),
      })

      const userForm = form.getSubForm('user')

      await form.validateForm()

      // User form should only see its own errors
      expect(userForm.errors.value.propertyErrors['name']).toContain('User name required')
      expect(userForm.errors.value.propertyErrors['email']).toContain('Invalid user email')
      expect(userForm.errors.value.propertyErrors['company.name']).toBeUndefined()
    })

    it('should handle nested error filtering', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              name: '',
              bio: '',
            },
            settings: { theme: '' },
          },
        },
        schema: z.object({
          user: z.object({
            profile: z.object({
              name: z.string().min(1, 'Name required'),
              bio: z.string().min(10, 'Bio too short'),
            }),
            settings: z.object({
              theme: z.string().min(1, 'Theme required'),
            }),
          }),
        }),
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')

      await form.validateForm()

      // Profile form should only see profile errors
      expect(profileForm.errors.value.propertyErrors['name']).toContain('Name required')
      expect(profileForm.errors.value.propertyErrors['bio']).toContain('Bio too short')
      expect(profileForm.errors.value.propertyErrors['settings.theme']).toBeUndefined()
    })
  })

  describe('Validation State Management', () => {
    it('should reflect validation state in subforms', async () => {
      const form = useForm({
        initialData: { user: { name: '' } },
        schema: z.object({
          user: z.object({
            name: z.string().min(1, 'Name required'),
          }),
        }),
      })

      const userForm = form.getSubForm('user')

      // Initially valid (not validated)
      expect(userForm.isValid.value).toBe(true)
      expect(userForm.isValidated.value).toBe(false)

      // After validation
      await form.validateForm()

      expect(userForm.isValid.value).toBe(false)
      expect(userForm.isValidated.value).toBe(true)

      // After fixing data
      form.formData.value.user.name = 'John'
      await form.validateForm()

      expect(userForm.isValid.value).toBe(true)
      expect(userForm.isValidated.value).toBe(true)
    })

    it('should handle validation delegation', async () => {
      const form = useForm({
        initialData: { user: { name: '' } },
        schema: z.object({
          user: z.object({
            name: z.string().min(1, 'Name required'),
          }),
        }),
      })

      const userForm = form.getSubForm('user')

      // Validating through subform should validate entire form
      const result = await userForm.validateForm()

      expect(result.isValid).toBe(false)
      expect(form.isValidated.value).toBe(true)
      expect(userForm.isValidated.value).toBe(true)
    })
  })

  describe('Array Validation', () => {
    it('should handle array item validation', async () => {
      const form = useForm({
        initialData: {
          users: [
            {
              name: '',
              email: '',
            },
            {
              name: 'Jane',
              email: 'jane@example.com',
            },
          ],
        },
      })

      form.getSubForm('users.0', {
        schema: z.object({
          name: z.string().min(1, 'Name required'),
          email: z.string().email('Invalid email'),
        }),
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['users.0.name']).toContain('Name required')
      expect(result.errors.propertyErrors['users.0.email']).toContain('Invalid email')
    })

    it('should handle multiple array item validations', async () => {
      const form = useForm({
        initialData: {
          users: [
            {
              name: '',
              email: '',
            },
            {
              name: '',
              email: 'invalid',
            },
          ],
        },
      })

      form.getSubForm('users.0', {
        schema: z.object({
          name: z.string().min(1, 'Name required'),
          email: z.string().email('Invalid email'),
        }),
      })

      form.getSubForm('users.1', {
        schema: z.object({
          name: z.string().min(1, 'Name required'),
          email: z.string().email('Invalid email'),
        }),
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['users.0.name']).toContain('Name required')
      expect(result.errors.propertyErrors['users.0.email']).toContain('Invalid email')
      expect(result.errors.propertyErrors['users.1.name']).toContain('Name required')
      expect(result.errors.propertyErrors['users.1.email']).toContain('Invalid email')
    })
  })
})

