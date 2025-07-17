import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useForm } from '../src/composables/useForm'

describe('Basic Subform Functionality', () => {
  describe('Subform Creation', () => {
    it('should create subform with correct data scoping', () => {
      const form = useForm({
        initialData: {
          user: {
            name: 'John',
            email: 'john@example.com',
          },
          company: { name: 'Tech Corp' },
        },
      })

      const userForm = form.getSubForm('user')

      expect(userForm.formData.value).toEqual({
        name: 'John',
        email: 'john@example.com',
      })
      expect(userForm.initialData.value).toEqual({
        name: 'John',
        email: 'john@example.com',
      })
    })

    it('should create nested subforms', () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              name: 'John',
              bio: 'Developer',
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')

      expect(profileForm.formData.value).toEqual({
        name: 'John',
        bio: 'Developer',
      })
    })

    it('should handle non-existent paths gracefully', () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      const nonExistentForm = form.getSubForm('nonexistent' as any)

      expect(nonExistentForm.formData.value).toBeUndefined()
    })

    it('should maintain reactivity with main form data', async () => {
      const form = useForm({
        initialData: {
          user: { name: 'John' },
        },
      })

      const userForm = form.getSubForm('user')

      // Change main form data
      form.formData.value.user.name = 'Jane'
      await nextTick()

      // Subform should reflect the change
      expect(userForm.formData.value.name).toBe('Jane')
    })
  })

  describe('Field Operations', () => {
    it('should register fields with correct paths in main form', () => {
      const form = useForm({
        initialData: {
          user: {
            name: 'John',
            email: 'john@example.com',
          },
        },
      })

      const userForm = form.getSubForm('user')
      const nameField = userForm.defineField({ path: 'name' })

      // Field should be registered in main form with prefixed path
      expect(form.getField('user.name')).toBe(nameField)
    })

    it('should retrieve fields with path transformation', () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      const userForm = form.getSubForm('user')
      const nameField = userForm.defineField({ path: 'name' })

      // Should retrieve same field through subform
      expect(userForm.getField('name')).toBe(nameField)
    })

    it('should filter fields correctly for subform', () => {
      const form = useForm({
        initialData: {
          user: {
            name: 'John',
            email: 'john@example.com',
          },
          company: { name: 'Tech Corp' },
        },
      })

      const userForm = form.getSubForm('user')
      userForm.defineField({ path: 'name' })
      userForm.defineField({ path: 'email' })

      const companyForm = form.getSubForm('company')
      companyForm.defineField({ path: 'name' })

      expect(userForm.getFields()).toHaveLength(2)
      expect(companyForm.getFields()).toHaveLength(1)
    })

    it('should handle nested field operations', () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              name: 'John',
              bio: 'Developer',
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')

      const nameField = profileForm.defineField({ path: 'name' })

      // Field should be registered with full path
      expect(form.getField('user.profile.name')).toBe(nameField)
      expect(profileForm.getField('name')).toBe(nameField)
    })
  })

  describe('Data Synchronization', () => {
    it('should sync subform changes to main form', async () => {
      const form = useForm({
        initialData: {
          user: { name: 'John' },
        },
      })

      const userForm = form.getSubForm('user')
      const nameField = userForm.defineField({ path: 'name' })

      // Change through subform field
      nameField.setValue('Jane')
      await nextTick()

      // Main form should reflect the change
      expect(form.formData.value.user.name).toBe('Jane')
    })

    it('should handle complex nested data synchronization', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              preferences: {
                theme: 'dark',
                notifications: true,
              },
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')
      const preferencesForm = profileForm.getSubForm('preferences')

      const themeField = preferencesForm.defineField({ path: 'theme' })
      themeField.setValue('light')
      await nextTick()

      expect(form.formData.value.user.profile.preferences.theme).toBe('light')
    })
  })

  describe('Subform API Consistency', () => {
    it('should provide same API as main form', () => {
      const form = useForm({
        initialData: { user: { name: 'John' } },
      })

      const userForm = form.getSubForm('user')

      // Should have same methods as main form
      expect(typeof userForm.defineField).toBe('function')
      expect(typeof userForm.getField).toBe('function')
      expect(typeof userForm.getFields).toBe('function')
      expect(typeof userForm.reset).toBe('function')
      expect(typeof userForm.validateForm).toBe('function')
      expect(typeof userForm.getSubForm).toBe('function')

      // Should have same reactive properties
      expect(userForm.formData).toBeDefined()
      expect(userForm.initialData).toBeDefined()
      expect(userForm.isDirty).toBeDefined()
      expect(userForm.isTouched).toBeDefined()
      expect(userForm.isValid).toBeDefined()
      expect(userForm.isValidated).toBeDefined()
      expect(userForm.errors).toBeDefined()
    })

    it('should handle infinite nesting', () => {
      const form = useForm({
        initialData: {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: { name: 'Deep' },
                },
              },
            },
          },
        },
      })

      const deepForm = form
        .getSubForm('level1')
        .getSubForm('level2')
        .getSubForm('level3')
        .getSubForm('level4')
        .getSubForm('level5')

      expect(deepForm.formData.value.name).toBe('Deep')

      const nameField = deepForm.defineField({ path: 'name' })
      expect(form.getField('level1.level2.level3.level4.level5.name')).toBe(nameField)
    })
  })

  describe('Array Data Support', () => {
    it('should handle array data in subforms', () => {
      const form = useForm({
        initialData: {
          users: [
            {
              name: 'John',
              email: 'john@example.com',
            },
            {
              name: 'Jane',
              email: 'jane@example.com',
            },
          ],
        },
      })

      const firstUserForm = form.getSubForm('users.0')
      const secondUserForm = form.getSubForm('users.1')

      expect(firstUserForm.formData.value.name).toBe('John')
      expect(secondUserForm.formData.value.name).toBe('Jane')
    })

    it('should handle nested arrays', () => {
      const form = useForm({
        initialData: {
          companies: [
            {
              name: 'Tech Corp',
              employees: [
                {
                  name: 'John',
                  role: 'Developer',
                },
                {
                  name: 'Jane',
                  role: 'Designer',
                },
              ],
            },
          ],
        },
      })

      const companyForm = form.getSubForm('companies.0')
      const firstEmployeeForm = companyForm.getSubForm('employees.0')

      expect(firstEmployeeForm.formData.value.name).toBe('John')
      expect(firstEmployeeForm.formData.value.role).toBe('Developer')
    })
  })
})

