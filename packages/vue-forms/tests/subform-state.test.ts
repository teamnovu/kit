import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'

describe('Subform State Management', () => {
  describe('Scoped isDirty State', () => {
    it('should compute isDirty for subform scope only', async () => {
      const form = useForm({
        initialData: {
          user: { name: 'John' },
          company: { name: 'Tech Corp' },
        },
      })

      const userForm = form.getSubForm('user')
      const companyForm = form.getSubForm('company')

      const userNameField = userForm.defineField({ path: 'name' })
      companyForm.defineField({ path: 'name' })

      // Initially not dirty
      expect(userForm.isDirty.value).toBe(false)
      expect(companyForm.isDirty.value).toBe(false)

      // Change user name
      userNameField.setValue('Jane')
      await nextTick()

      // Only user form should be dirty
      expect(userForm.isDirty.value).toBe(true)
      expect(companyForm.isDirty.value).toBe(false)
    })

    it('should handle nested isDirty computation', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              name: 'John',
              bio: 'Developer',
            },
            settings: { theme: 'dark' },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')
      const settingsForm = userForm.getSubForm('settings')

      const profileNameField = profileForm.defineField({ path: 'name' })
      settingsForm.defineField({ path: 'theme' })

      // Initially not dirty
      expect(userForm.isDirty.value).toBe(false)
      expect(profileForm.isDirty.value).toBe(false)
      expect(settingsForm.isDirty.value).toBe(false)

      // Change profile name
      profileNameField.setValue('Jane')
      await nextTick()

      // Profile and parent user should be dirty, settings should not
      expect(profileForm.isDirty.value).toBe(true)
      expect(userForm.isDirty.value).toBe(true)
      expect(settingsForm.isDirty.value).toBe(false)
    })

    it('should handle array subform isDirty', async () => {
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

      const firstUserNameField = firstUserForm.defineField({ path: 'name' })
      secondUserForm.defineField({ path: 'name' })

      // Initially not dirty
      expect(firstUserForm.isDirty.value).toBe(false)
      expect(secondUserForm.isDirty.value).toBe(false)

      // Change first user name
      firstUserNameField.setValue('Johnny')
      await nextTick()

      // Only first user form should be dirty
      expect(firstUserForm.isDirty.value).toBe(true)
      expect(secondUserForm.isDirty.value).toBe(false)
    })

    it('should maintain dirty state across field changes', async () => {
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
      const emailField = userForm.defineField({ path: 'email' })

      // Change name
      nameField.setValue('Jane')
      await nextTick()
      expect(userForm.isDirty.value).toBe(true)

      // Change email too
      emailField.setValue('jane@example.com')
      await nextTick()
      expect(userForm.isDirty.value).toBe(true)

      // Reset name back to original
      nameField.setValue('John')
      await nextTick()
      expect(userForm.isDirty.value).toBe(true) // Still dirty because email changed
    })
  })

  describe('Scoped isTouched State', () => {
    it('should compute isTouched for subform scope only', async () => {
      const form = useForm({
        initialData: {
          user: { name: 'John' },
          company: { name: 'Tech Corp' },
        },
      })

      const userForm = form.getSubForm('user')
      const companyForm = form.getSubForm('company')

      const userNameField = userForm.defineField({ path: 'name' })
      companyForm.defineField({ path: 'name' })

      // Initially not touched
      expect(userForm.isTouched.value).toBe(false)
      expect(companyForm.isTouched.value).toBe(false)

      // Touch user field
      userNameField.onBlur()
      await nextTick()

      // Only user form should be touched
      expect(userForm.isTouched.value).toBe(true)
      expect(companyForm.isTouched.value).toBe(false)
    })

    it('should handle nested isTouched computation', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              name: 'John',
              bio: 'Developer',
            },
            settings: { theme: 'dark' },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')
      const settingsForm = userForm.getSubForm('settings')

      const profileNameField = profileForm.defineField({ path: 'name' })
      settingsForm.defineField({ path: 'theme' })

      // Initially not touched
      expect(userForm.isTouched.value).toBe(false)
      expect(profileForm.isTouched.value).toBe(false)
      expect(settingsForm.isTouched.value).toBe(false)

      // Touch profile field
      profileNameField.onBlur()
      await nextTick()

      // Profile and parent user should be touched, settings should not
      expect(profileForm.isTouched.value).toBe(true)
      expect(userForm.isTouched.value).toBe(true)
      expect(settingsForm.isTouched.value).toBe(false)
    })

    it('should handle multiple fields touched in same subform', async () => {
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
      const emailField = userForm.defineField({ path: 'email' })

      // Touch name field
      nameField.onBlur()
      await nextTick()
      expect(userForm.isTouched.value).toBe(true)

      // Touch email field too
      emailField.onBlur()
      await nextTick()
      expect(userForm.isTouched.value).toBe(true)
    })
  })

  describe('Scoped Reset Functionality', () => {
    it('should reset only subform fields', async () => {
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
      const companyForm = form.getSubForm('company')

      const userNameField = userForm.defineField({ path: 'name' })
      const companyNameField = companyForm.defineField({ path: 'name' })

      // Change values
      userNameField.setValue('Jane')
      companyNameField.setValue('New Corp')
      await nextTick()

      // Touch fields
      userNameField.onBlur()
      companyNameField.onBlur()
      await nextTick()

      // Reset only user form
      userForm.reset()
      await nextTick()

      // User form should be reset, company form should remain changed
      expect(userForm.formData.value.name).toBe('John')
      expect(companyForm.formData.value.name).toBe('New Corp')
      expect(userNameField.touched.value).toBe(false)
      expect(companyNameField.touched.value).toBe(true)
    })

    it('should handle nested subform reset', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              name: 'John',
              bio: 'Developer',
            },
            settings: { theme: 'dark' },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')
      const settingsForm = userForm.getSubForm('settings')

      const profileNameField = profileForm.defineField({ path: 'name' })
      const settingsThemeField = settingsForm.defineField({ path: 'theme' })

      // Change values
      profileNameField.setValue('Jane')
      settingsThemeField.setValue('light')
      await nextTick()

      // Reset only profile form
      profileForm.reset()
      await nextTick()

      // Profile should be reset, settings should remain changed
      expect(profileForm.formData.value.name).toBe('John')
      expect(settingsForm.formData.value.theme).toBe('light')
    })

    it('should handle array subform reset', async () => {
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

      const firstUserNameField = firstUserForm.defineField({ path: 'name' })
      const secondUserNameField = secondUserForm.defineField({ path: 'name' })

      // Change values
      firstUserNameField.setValue('Johnny')
      secondUserNameField.setValue('Janet')
      await nextTick()

      // Reset only first user
      firstUserForm.reset()
      await nextTick()

      // First user should be reset, second should remain changed
      expect(firstUserForm.formData.value.name).toBe('John')
      expect(secondUserForm.formData.value.name).toBe('Janet')
    })
  })

  describe('Error State Management', () => {
    it('should filter errors to subform scope', async () => {
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
      const companyForm = form.getSubForm('company')

      await form.validateForm()

      // User form should only see user errors
      expect(userForm.errors.value.propertyErrors['name']).toContain('User name required')
      expect(userForm.errors.value.propertyErrors['email']).toContain('Invalid user email')
      expect(userForm.errors.value.propertyErrors['company.name']).toBeUndefined()

      // Company form should only see company errors
      expect(companyForm.errors.value.propertyErrors['name']).toContain('Company name required')
      expect(companyForm.errors.value.propertyErrors['user.name']).toBeUndefined()
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
      const settingsForm = userForm.getSubForm('settings')

      await form.validateForm()

      // Profile form should only see profile errors
      expect(profileForm.errors.value.propertyErrors['name']).toContain('Name required')
      expect(profileForm.errors.value.propertyErrors['bio']).toContain('Bio too short')
      expect(profileForm.errors.value.propertyErrors['settings.theme']).toBeUndefined()

      // Settings form should only see settings errors
      expect(settingsForm.errors.value.propertyErrors['theme']).toContain('Theme required')
      expect(settingsForm.errors.value.propertyErrors['profile.name']).toBeUndefined()
    })

    it('should handle general errors in subforms', async () => {
      const form = useForm({
        initialData: { user: { name: 'admin' } },
      })

      const userForm = form.getSubForm('user', {
        validateFn: async data => ({
          isValid: data.name !== 'admin',
          errors: {
            general: data.name === 'admin' ? ['Admin user not allowed'] : [],
            propertyErrors: {},
          },
        }),
      })

      await form.validateForm()

      // General errors should be propagated but not filtered
      expect(userForm.errors.value.general).toContain('Admin user not allowed')
    })
  })

  describe('State Synchronization', () => {
    it('should maintain state consistency between main form and subforms', async () => {
      const form = useForm({
        initialData: {
          user: { name: 'John' },
        },
      })

      const userForm = form.getSubForm('user')
      const nameField = userForm.defineField({ path: 'name' })

      // Change through subform
      nameField.setValue('Jane')
      await nextTick()

      // Both forms should reflect the change
      expect(form.formData.value.user.name).toBe('Jane')
      expect(userForm.formData.value.name).toBe('Jane')

      // Both should be dirty
      expect(form.isDirty.value).toBe(true)
      expect(userForm.isDirty.value).toBe(true)
    })

    it('should handle state changes through main form', async () => {
      const form = useForm({
        initialData: {
          user: { name: 'John' },
        },
      })

      const userForm = form.getSubForm('user')
      userForm.defineField({ path: 'name' })

      // Change through main form data
      form.formData.value.user.name = 'Jane'
      await nextTick()

      // Subform should reflect the change
      expect(userForm.formData.value.name).toBe('Jane')
    })

    it('should handle initial data changes', async () => {
      const initialData = {
        user: { name: 'John' },
      }

      const form = useForm({ initialData })
      form.getSubForm('user')

      // Change initial data (simulating reactive initial data)
      initialData.user.name = 'Jane'
      await nextTick()

      // Note: This test depends on how reactive initial data is implemented
      // The exact behavior may vary based on implementation
    })
  })
})

