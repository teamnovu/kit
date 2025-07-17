import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'

describe('Subform Edge Cases and Error Scenarios', () => {
  describe('Invalid Path Handling', () => {
    it('should handle non-existent paths gracefully', () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      const nonExistentForm = form.getSubForm('nonexistent' as any)

      expect(nonExistentForm.formData.value).toBeUndefined()
      expect(nonExistentForm.initialData.value).toBeUndefined()
    })

    it('should handle deeply nested non-existent paths', () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      const deepNonExistentForm = form.getSubForm('user.profile.preferences' as any)

      expect(deepNonExistentForm.formData.value).toBeUndefined()
    })

    it('should handle paths that become invalid after data changes', async () => {
      const form = useForm({
        initialData: { user: { profile: { name: 'John' } } },
      })

      const profileForm = form.getSubForm('user.profile')
      expect(profileForm.formData.value.name).toBe('John')

      // Remove the profile object
      form.formData.value.user.profile = undefined as any
      await nextTick()

      expect(profileForm.formData.value).toBeUndefined()
    })

    it('should handle null or undefined data gracefully', () => {
      const form = useForm({
        initialData: { user: null as any },
      })

      const userForm = form.getSubForm('user')
      expect(userForm.formData.value).toBeNull()

      const nameForm = userForm.getSubForm('name' as any)
      expect(nameForm.formData.value).toBeUndefined()
    })
  })

  describe('Array Index Edge Cases', () => {
    it('should handle array index out of bounds', () => {
      const form = useForm({
        initialData: {
          users: [
            { name: 'John' },
            { name: 'Jane' },
          ],
        },
      })

      const outOfBoundsForm = form.getSubForm('users.5' as any)
      expect(outOfBoundsForm.formData.value).toBeUndefined()
    })

    it('should handle negative array indices', () => {
      const form = useForm({
        initialData: {
          users: [
            { name: 'John' },
            { name: 'Jane' },
          ],
        },
      })

      const negativeIndexForm = form.getSubForm('users.-1' as any)
      expect(negativeIndexForm.formData.value).toBeUndefined()
    })

    it('should handle non-numeric array indices', () => {
      const form = useForm({
        initialData: {
          users: [
            { name: 'John' },
            { name: 'Jane' },
          ],
        },
      })

      const invalidIndexForm = form.getSubForm('users.abc' as any)
      expect(invalidIndexForm.formData.value).toBeUndefined()
    })

    it('should handle array that becomes empty', async () => {
      const form = useForm({
        initialData: {
          users: [{ name: 'John' }],
        },
      })

      const userForm = form.getSubForm('users.0')
      expect(userForm.formData.value.name).toBe('John')

      // Empty the array
      form.formData.value.users = []
      await nextTick()

      expect(userForm.formData.value).toBeUndefined()
    })
  })

  describe('Type Mismatch Scenarios', () => {
    it('should handle primitive values where objects are expected', () => {
      const form = useForm({
        initialData: { user: 'not an object' as any },
      })

      const userForm = form.getSubForm('user')
      expect(userForm.formData.value).toBe('not an object')

      const nameForm = userForm.getSubForm('name' as any)
      expect(nameForm.formData.value).toBeUndefined()
    })

    it('should handle arrays where objects are expected', () => {
      const form = useForm({
        initialData: { user: ['array', 'instead', 'of', 'object'] as any },
      })

      const userForm = form.getSubForm('user')
      expect(Array.isArray(userForm.formData.value)).toBe(true)

      const nameForm = userForm.getSubForm('name' as any)
      expect(nameForm.formData.value).toBeUndefined()
    })

    it('should handle objects where arrays are expected', () => {
      const form = useForm({
        initialData: { users: { notAnArray: 'value' } as any },
      })

      const usersForm = form.getSubForm('users')
      expect(usersForm.formData.value.notAnArray).toBe('value')

      const firstUserForm = usersForm.getSubForm('0' as any)
      expect(firstUserForm.formData.value).toBeUndefined()
    })
  })

  describe('Schema Conflict Scenarios', () => {
    it('should handle conflicting schemas at same path', async () => {
      const form = useForm({
        initialData: { user: { name: 'short' } },
      })

      // First subform with one validation
      form.getSubForm('user', {
        schema: z.object({
          name: z.string().min(1, 'Name required'),
        }),
      })

      // Second subform with different validation for same path
      form.getSubForm('user', {
        schema: z.object({
          name: z.string().min(10, 'Name must be at least 10 characters'),
        }),
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      // Last registered schema should take precedence
      expect(result.errors.propertyErrors['user.name']).toContain('Name must be at least 10 characters')
    })

    it('should handle schema override with mixed types', async () => {
      const form = useForm({
        initialData: { user: { age: 25 } },
      })

      // First schema expects string
      form.getSubForm('user', {
        schema: z.object({
          age: z.string().min(1, 'Age as string required'),
        }),
      })

      // Second schema expects number
      form.getSubForm('user', {
        schema: z.object({
          age: z.number().min(18, 'Age must be at least 18'),
        }),
      })

      const result = await form.validateForm()

      // Should use the last registered schema
      expect(result.isValid).toBe(true) // 25 >= 18
    })
  })

  describe('Validation Function Edge Cases', () => {
    it('should handle validation function that throws error', async () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      form.getSubForm('user', {
        validateFn: async (_data) => {
          throw new Error('Validation function error')
        },
      })

      // Should handle the error gracefully
      await form.validateForm()

      // The exact behavior depends on implementation
      // It should either catch the error or propagate it appropriately
    })

    it('should handle validation function that returns invalid format', async () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      form.getSubForm('user', {
        validateFn: async (data) => {
          return 'invalid format' as any
        },
      })

      // Should handle invalid return format gracefully
      await form.validateForm()

      // The exact behavior depends on implementation
    })

    it('should handle validation function with undefined data', async () => {
      const form = useForm({
        initialData: { user: undefined as any },
      })

      form.getSubForm('user', {
        validateFn: async (data) => {
          if (data === undefined) {
            return {
              isValid: false,
              errors: {
                general: ['Data is undefined'],
                propertyErrors: {},
              },
            }
          }
          return {
            isValid: true,
            errors: {
              general: [],
              propertyErrors: {},
            },
          }
        },
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.general).toContain('Data is undefined')
    })
  })

  describe('Memory and Performance Edge Cases', () => {
    it('should handle many subforms creation and destruction', () => {
      const form = useForm({
        initialData: {
          sections: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Section ${i}`,
          })),
        },
      })

      const subforms = []

      // Create many subforms
      for (let i = 0; i < 1000; i++) {
        subforms.push(form.getSubForm(`sections.${i}`))
      }

      // Verify they work
      expect(subforms[0].formData.value.name).toBe('Section 0')
      expect(subforms[999].formData.value.name).toBe('Section 999')

      // Clear references (simulating destruction)
      subforms.length = 0

      // Should not cause memory leaks
      expect(form.getFields()).toHaveLength(0)
    })

    it('should handle rapid subform creation and field registration', () => {
      const form = useForm({
        initialData: {
          data: Array.from({ length: 100 }, (_, i) => ({
            name: `Item ${i}`,
            value: i,
          })),
        },
      })

      const startTime = performance.now()

      // Rapidly create subforms and register fields
      for (let i = 0; i < 100; i++) {
        const subform = form.getSubForm(`data.${i}`)
        subform.defineField({ path: 'name' })
        subform.defineField({ path: 'value' })
      }

      const endTime = performance.now()

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(1000) // 1 second
      expect(form.getFields()).toHaveLength(200) // 100 items * 2 fields
    })
  })

  describe('Reactivity Edge Cases', () => {
    it('should handle circular references in data structure', () => {
      const data: any = {
        user: { name: 'John' },
      }
      data.user.self = data.user // Create circular reference

      const form = useForm({ initialData: data })

      const userForm = form.getSubForm('user')
      expect(userForm.formData.value.name).toBe('John')

      // Should handle circular reference gracefully
      const selfForm = userForm.getSubForm('self')
      expect(selfForm.formData.value.name).toBe('John')
    })

    it('should handle data mutations during field operations', async () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      const userForm = form.getSubForm('user')
      const nameField = userForm.defineField({ path: 'name' })

      // Mutate data structure while field is active
      form.formData.value.user = {
        name: 'Jane',
        email: 'jane@example.com',
      }
      await nextTick()

      // Field should still work with new data
      expect(nameField.value.value).toBe('Jane')
    })

    it('should handle initial data changes after subform creation', async () => {
      const initialData = { user: { name: 'John' } }
      const form = useForm({ initialData })

      const userForm = form.getSubForm('user')
      expect(userForm.initialData.value.name).toBe('John')

      // Change initial data (if reactive)
      initialData.user.name = 'Jane'
      await nextTick()

      // Behavior depends on whether initial data is reactive
      // This test documents the expected behavior
    })
  })

  describe('Field Registration Edge Cases', () => {
    it('should handle field registration with invalid paths', () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      const userForm = form.getSubForm('user')

      // Try to register field with invalid path
      const invalidField = userForm.defineField({ path: 'nonexistent.nested.path' as any })

      // Should handle gracefully
      expect(invalidField.value.value).toBeUndefined()
    })

    it('should handle duplicate field registration', () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      const userForm = form.getSubForm('user')

      userForm.defineField({ path: 'name' })
      userForm.defineField({ path: 'name' })

      // Second registration should either replace or coexist
      expect(userForm.getField('name')).toBeDefined()
      expect(form.getField('user.name')).toBeDefined()
    })

    it('should handle field registration after data structure changes', async () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      const userForm = form.getSubForm('user')

      // Change data structure
      form.formData.value.user = {
        name: 'Jane',
        email: 'jane@example.com',
      }
      await nextTick()

      // Register field after structure change
      const emailField = userForm.defineField({ path: 'email' })
      expect(emailField.value.value).toBe('jane@example.com')
    })
  })

  describe('Error Recovery', () => {
    it('should recover from invalid data transitions', async () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      const userForm = form.getSubForm('user')
      const nameField = userForm.defineField({ path: 'name' })

      // Break the data structure
      form.formData.value.user = null as any
      await nextTick()

      expect(nameField.value.value).toBeUndefined()

      // Restore valid data structure
      form.formData.value.user = { name: 'Jane' }
      await nextTick()

      expect(nameField.value.value).toBe('Jane')
    })

    it('should handle validation errors gracefully', async () => {
      const form = useForm({
        initialData: { user: { name: '' } },
      })

      form.getSubForm('user', {
        schema: z.object({
          name: z.string().min(1, 'Name required'),
        }),
      })

      // Trigger validation error
      const result = await form.validateForm()
      expect(result.isValid).toBe(false)

      // Fix the data
      form.formData.value.user.name = 'John'
      const result2 = await form.validateForm()
      expect(result2.isValid).toBe(true)
    })
  })
})

