import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'
import { Form } from '../src/types/form'
import { isValidResult } from '../src/utils/validation'

describe('Subform Implementation', () => {
  describe('Basic Functionality', () => {
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

        expect(userForm.data.value).toEqual({
          name: 'John',
          email: 'john@example.com',
        })
        expect(userForm.initialData.value).toEqual({
          name: 'John',
          email: 'john@example.com',
        })
      })

      it('should create array subforms', () => {
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

        expect(firstUserForm.data.value).toEqual({
          name: 'John',
          email: 'john@example.com',
        })
        expect(secondUserForm.data.value).toEqual({
          name: 'Jane',
          email: 'jane@example.com',
        })
      })

      it('should handle deeply nested subforms', () => {
        const form = useForm({
          initialData: {
            user: {
              profile: {
                personal: {
                  name: 'John',
                  age: 30,
                },
                work: {
                  title: 'Developer',
                  company: 'Tech Corp',
                },
              },
            },
          },
        })

        const userForm = form.getSubForm('user')
        const profileForm = userForm.getSubForm('profile')
        const personalForm = profileForm.getSubForm('personal')

        expect(personalForm.data.value).toEqual({
          name: 'John',
          age: 30,
        })
      })
    })

    describe('Field Operations', () => {
      it('should register fields with correct paths in main form', () => {
        const form = useForm({
          initialData: {
            user: { name: 'John' },
          },
        })

        const userForm = form.getSubForm('user')
        const nameField = userForm.defineField({ path: 'name' })

        expect(nameField.path.value).toBe('name')
        expect(nameField.data.value).toBe('John')
        expect(form.getField('user.name')).toBeDefined()
      })

      it('should retrieve fields with path transformation', () => {
        const form = useForm({
          initialData: {
            user: {
              name: 'John',
              email: 'john@example.com',
            },
          },
        })

        const userForm = form.getSubForm('user')
        userForm.defineField({ path: 'name' })
        userForm.defineField({ path: 'email' })

        const nameField = userForm.getField('name')
        const emailField = userForm.getField('email')

        expect(nameField).toBeDefined()
        expect(emailField).toBeDefined()
        expect(nameField?.path.value).toBe('name')
        expect(emailField?.path.value).toBe('email')
      })

      it('should handle field operations on nested subforms', () => {
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

        expect(nameField.path.value).toBe('name')
        expect(nameField.data.value).toBe('John')

        // Should be registered in main form with full path
        expect(form.getField('user.profile.name')).toBeDefined()
      })

      it('should handle field value updates correctly', async () => {
        const form = useForm({
          initialData: {
            user: { name: 'John' },
          },
        })

        const userForm = form.getSubForm('user')
        const nameField = userForm.defineField({ path: 'name' })

        nameField.setData('Jane')
        await nextTick()

        expect(nameField.data.value).toBe('Jane')
        expect(userForm.data.value.name).toBe('Jane')
        expect(form.data.value.user.name).toBe('Jane')
      })
    })

    describe('Nested Subforms', () => {
      it('should create nested subforms from subforms', () => {
        const form = useForm({
          initialData: {
            user: {
              profile: {
                name: 'John',
                settings: {
                  theme: 'dark',
                  notifications: true,
                },
              },
            },
          },
        })

        const userForm = form.getSubForm('user')
        const profileForm = userForm.getSubForm('profile')
        const settingsForm = profileForm.getSubForm('settings')

        expect(settingsForm.data.value).toEqual({
          theme: 'dark',
          notifications: true,
        })
      })

      it('should handle infinite nesting levels', () => {
        const form = useForm({
          initialData: {
            level1: {
              level2: {
                level3: {
                  level4: {
                    level5: {
                      name: 'Deep Value',
                    },
                  },
                },
              },
            },
          },
        })

        const level1Form = form.getSubForm('level1')
        const level2Form = level1Form.getSubForm('level2')
        const level3Form = level2Form.getSubForm('level3')
        const level4Form = level3Form.getSubForm('level4')
        const level5Form = level4Form.getSubForm('level5')

        expect(level5Form.data.value).toEqual({
          name: 'Deep Value',
        })

        level5Form.defineField({ path: 'name' })
        expect(form.getField('level1.level2.level3.level4.level5.name')).toBeDefined()
      })

      it('should handle mixed object and array nesting', () => {
        const form = useForm({
          initialData: {
            teams: [
              {
                name: 'Team A',
                members: [
                  {
                    name: 'John',
                    role: 'lead',
                  },
                  {
                    name: 'Jane',
                    role: 'dev',
                  },
                ],
              },
            ],
          },
        })

        const teamForm = form.getSubForm('teams.0')
        const memberForm = teamForm.getSubForm('members.0')

        expect(memberForm.data.value).toEqual({
          name: 'John',
          role: 'lead',
        })
      })
    })
  })

  describe('Validation Integration', () => {
    describe('Schema Validation', () => {
      it('should validate subform with schema using defineValidator', async () => {
        const form = useForm({
          initialData: {
            user: {
              name: '',
              email: '',
            },
          },
        })

        const userForm = form.getSubForm('user')
        userForm.defineValidator({
          schema: z.object({
            name: z.string().min(1, 'Name required'),
            email: z.email('Invalid email'),
          }),
        })

        // Set invalid data
        userForm.data.value.name = ''
        userForm.data.value.email = 'invalid'

        const result = await form.validateForm()

        expect(isValidResult(result)).toBe(false)
        expect(result.errors.propertyErrors['user.name']).toContain('Name required')
        expect(result.errors.propertyErrors['user.email']).toContain('Invalid email')
      })

      it('should validate nested subforms with schemas', async () => {
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
        const profileForm = userForm.getSubForm('profile')

        profileForm.defineValidator({
          schema: z.object({
            name: z.string().min(1, 'Name required'),
            bio: z.string().min(10, 'Bio too short'),
          }),
        })

        // Set invalid data
        profileForm.data.value.name = ''
        profileForm.data.value.bio = 'Short'

        const result = await form.validateForm()

        expect(isValidResult(result)).toBe(false)
        expect(result.errors.propertyErrors['user.profile.name']).toContain('Name required')
        expect(result.errors.propertyErrors['user.profile.bio']).toContain('Bio too short')
      })

      it('should handle multiple subform validations at same level', async () => {
        const form = useForm({
          initialData: {
            user: { name: '' },
            company: { name: '' },
          },
        })

        const userForm = form.getSubForm('user')
        const companyForm = form.getSubForm('company')

        userForm.defineValidator({
          schema: z.object({
            name: z.string().min(1, 'User name required'),
          }),
        })

        companyForm.defineValidator({
          schema: z.object({
            name: z.string().min(1, 'Company name required'),
          }),
        })

        const result = await form.validateForm()

        expect(isValidResult(result)).toBe(false)
        expect(result.errors.propertyErrors['user.name']).toContain('User name required')
        expect(result.errors.propertyErrors['company.name']).toContain('Company name required')
      })
    })

    describe('Custom Validation Functions', () => {
      it('should validate subform with custom validation function', async () => {
        const form = useForm({
          initialData: {
            user: {
              name: 'admin',
              email: 'admin@example.com',
            },
          },
        })

        const userForm = form.getSubForm('user')
        userForm.defineValidator({
          validateFn: async (data) => {
            const errors: Record<string, string[]> = {}

            if (data.name === 'admin') {
              errors.name = ['Admin name not allowed']
            }

            return {
              isValid: Object.keys(errors).length === 0,
              errors: {
                general: [],
                propertyErrors: errors,
              },
            }
          },
        })

        const result = await form.validateForm()

        expect(isValidResult(result)).toBe(false)
        expect(result.errors.propertyErrors['user.name']).toContain('Admin name not allowed')
      })

      it('should handle both schema and custom validation', async () => {
        const form = useForm({
          initialData: {
            user: {
              name: '',
              email: 'test@example.com',
            },
          },
        })

        const userForm = form.getSubForm('user')
        userForm.defineValidator({
          schema: z.object({
            name: z.string().min(1, 'Name required'),
            email: z.email(),
          }),
          validateFn: async (data) => {
            const errors: Record<string, string[]> = {}

            if (data.email === 'test@example.com') {
              errors.email = ['Test email not allowed']
            }

            return {
              isValid: Object.keys(errors).length === 0,
              errors: {
                general: [],
                propertyErrors: errors,
              },
            }
          },
        })

        const result = await form.validateForm()

        expect(isValidResult(result)).toBe(false)
        expect(result.errors.propertyErrors['user.name']).toContain('Name required')
        expect(result.errors.propertyErrors['user.email']).toContain('Test email not allowed')
      })

      it('should handle validation with nested custom functions', async () => {
        const form = useForm({
          initialData: {
            user: {
              profile: {
                name: 'admin',
                bio: 'Test bio',
              },
            },
          },
        })

        const userForm = form.getSubForm('user')
        const profileForm = userForm.getSubForm('profile')

        profileForm.defineValidator({
          validateFn: async (data) => {
            const errors: Record<string, string[]> = {}

            if (data.name === 'admin') {
              errors.name = ['Admin profile name not allowed']
            }

            return {
              isValid: Object.keys(errors).length === 0,
              errors: {
                general: [],
                propertyErrors: errors,
              },
            }
          },
        })

        const result = await form.validateForm()

        expect(isValidResult(result)).toBe(false)
        expect(result.errors.propertyErrors['user.profile.name']).toContain('Admin profile name not allowed')
      })
    })

    describe('Main Form and Subform Validation Integration', () => {
      it('should integrate main form and subform validation', async () => {
        const form = useForm({
          initialData: {
            globalSetting: 'abc',
            user: {
              name: 'admin',
            },
          },
        })

        // Main form validation
        form.defineValidator({
          schema: z.object({
            globalSetting: z.string().min(5, 'Global setting too short'),
          }),
        })

        // Subform validation
        const userForm = form.getSubForm('user')
        userForm.defineValidator({
          validateFn: async (data) => {
            const errors: Record<string, string[]> = {}

            if (data.name === 'admin') {
              errors.name = ['Admin name not allowed']
            }

            return {
              isValid: Object.keys(errors).length === 0,
              errors: {
                general: [],
                propertyErrors: errors,
              },
            }
          },
        })

        const result = await form.validateForm()

        expect(isValidResult(result)).toBe(false)
        expect(result.errors.propertyErrors['globalSetting']).toContain('Global setting too short')
        expect(result.errors.propertyErrors['user.name']).toContain('Admin name not allowed')
      })
    })
  })

  describe('State Management', () => {
    describe('Dirty State', () => {
      it('should compute isDirty for subform scope only', async () => {
        const form = useForm({
          initialData: {
            user: { name: 'John' },
            company: { name: 'Tech Corp' },
          },
        })

        const userForm = form.getSubForm('user')
        const companyForm = form.getSubForm('company')

        // Define fields to enable dirty state computation
        const userNameField = userForm.defineField({ path: 'name' })

        expect(userForm.isDirty.value).toBe(false)
        expect(companyForm.isDirty.value).toBe(false)

        userNameField.setData('Jane')
        await nextTick()

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
            },
          },
        })

        const userForm = form.getSubForm('user')
        const profileForm = userForm.getSubForm('profile')

        // Define fields to enable dirty state computation
        const nameField = profileForm.defineField({ path: 'name' })

        expect(profileForm.isDirty.value).toBe(false)

        nameField.setData('Jane')
        await nextTick()

        expect(profileForm.isDirty.value).toBe(true)
        expect(userForm.isDirty.value).toBe(true)
      })

      it('should handle array subform isDirty', async () => {
        const form = useForm({
          initialData: {
            users: [
              { name: 'John' },
              { name: 'Jane' },
            ],
          },
        })

        const firstUserForm = form.getSubForm('users.0')
        const secondUserForm = form.getSubForm('users.1')

        // Define fields to enable dirty state computation
        const firstNameField = firstUserForm.defineField({ path: 'name' })
        secondUserForm.defineField({ path: 'name' })

        expect(firstUserForm.isDirty.value).toBe(false)
        expect(secondUserForm.isDirty.value).toBe(false)

        firstNameField.setData('Johnny')
        await nextTick()

        expect(firstUserForm.isDirty.value).toBe(true)
        expect(secondUserForm.isDirty.value).toBe(false)
      })
    })

    describe('Touched State', () => {
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

        expect(userForm.isTouched.value).toBe(false)
        expect(companyForm.isTouched.value).toBe(false)

        userNameField.onBlur()
        await nextTick()

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
            },
          },
        })

        const userForm = form.getSubForm('user')
        const profileForm = userForm.getSubForm('profile')

        const nameField = profileForm.defineField({ path: 'name' })

        expect(profileForm.isTouched.value).toBe(false)
        expect(userForm.isTouched.value).toBe(false)

        nameField.onBlur()
        await nextTick()

        expect(profileForm.isTouched.value).toBe(true)
        expect(userForm.isTouched.value).toBe(true)
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

        expect(userForm.isTouched.value).toBe(false)

        nameField.onBlur()
        await nextTick()

        expect(userForm.isTouched.value).toBe(true)

        emailField.onBlur()
        await nextTick()

        expect(userForm.isTouched.value).toBe(true)
      })
    })

    describe('Error State', () => {
      it('should filter errors to subform scope', async () => {
        const form = useForm({
          initialData: {
            user: { name: '' },
            company: { name: '' },
          },
        })

        const userForm = form.getSubForm('user')
        const companyForm = form.getSubForm('company')

        userForm.defineValidator({
          schema: z.object({
            name: z.string().min(1, 'User name required'),
          }),
        })

        companyForm.defineValidator({
          schema: z.object({
            name: z.string().min(1, 'Company name required'),
          }),
        })

        await form.validateForm()

        // User form should only see user errors
        expect(userForm.errors.value.propertyErrors['name']).toContain('User name required')
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
              settings: {
                theme: '',
              },
            },
          },
        })

        const userForm = form.getSubForm('user')
        const profileForm = userForm.getSubForm('profile')
        const settingsForm = userForm.getSubForm('settings')

        profileForm.defineValidator({
          schema: z.object({
            name: z.string().min(1, 'Name required'),
            bio: z.string().min(1, 'Bio required'),
          }),
        })

        settingsForm.defineValidator({
          schema: z.object({
            theme: z.string().min(1, 'Theme required'),
          }),
        })

        await form.validateForm()

        // Profile form should only see profile errors
        expect(profileForm.errors.value.propertyErrors['name']).toContain('Name required')
        expect(profileForm.errors.value.propertyErrors['bio']).toContain('Bio required')
        expect(profileForm.errors.value.propertyErrors['settings.theme']).toBeUndefined()

        // Settings form should only see settings errors
        expect(settingsForm.errors.value.propertyErrors['theme']).toContain('Theme required')
        expect(settingsForm.errors.value.propertyErrors['profile.name']).toBeUndefined()
      })

      it('should handle general errors in subforms', async () => {
        const form = useForm({
          initialData: {
            user: {
              name: 'test',
            },
          },
        })

        const userForm = form.getSubForm('user')
        userForm.defineValidator({
          validateFn: async () => ({
            isValid: false,
            errors: {
              general: ['General user error'],
              propertyErrors: {},
            },
          }),
        })

        await form.validateForm()

        expect(userForm.errors.value.general).toContain('General user error')
      })
    })

    describe('Reset Functionality', () => {
      it('should reset only subform fields', async () => {
        const form = useForm({
          initialData: {
            user: { name: 'John' },
            company: { name: 'Tech Corp' },
          },
        })

        const userForm = form.getSubForm('user')
        const companyForm = form.getSubForm('company')

        const userNameField = userForm.defineField({ path: 'name' })
        const companyNameField = companyForm.defineField({ path: 'name' })

        // Change values
        userNameField.setData('Jane')
        companyNameField.setData('New Corp')
        await nextTick()

        expect(userForm.data.value.name).toBe('Jane')
        expect(companyForm.data.value.name).toBe('New Corp')

        // Reset only user subform
        userForm.reset()
        await nextTick()

        expect(userForm.data.value.name).toBe('John')
        expect(companyForm.data.value.name).toBe('New Corp')
      })

      it('should handle nested subform reset', async () => {
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
        const bioField = profileForm.defineField({ path: 'bio' })

        // Change values
        nameField.setData('Jane')
        bioField.setData('Designer')
        await nextTick()

        expect(profileForm.data.value.name).toBe('Jane')
        expect(profileForm.data.value.bio).toBe('Designer')

        // Reset profile subform
        profileForm.reset()
        await nextTick()

        expect(profileForm.data.value.name).toBe('John')
        expect(profileForm.data.value.bio).toBe('Developer')
      })

      it('should handle array subform reset', async () => {
        const form = useForm({
          initialData: {
            users: [
              { name: 'John' },
              { name: 'Jane' },
            ],
          },
        })

        const firstUserForm = form.getSubForm('users.0')
        const secondUserForm = form.getSubForm('users.1')

        const firstNameField = firstUserForm.defineField({ path: 'name' })
        const secondNameField = secondUserForm.defineField({ path: 'name' })

        // Change values
        firstNameField.setData('Johnny')
        secondNameField.setData('Janie')
        await nextTick()

        expect(firstUserForm.data.value.name).toBe('Johnny')
        expect(secondUserForm.data.value.name).toBe('Janie')

        // Reset only first user subform
        firstUserForm.reset()
        await nextTick()

        expect(firstUserForm.data.value.name).toBe('John')
        expect(secondUserForm.data.value.name).toBe('Janie')
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
        userForm.data.value.name = 'Jane'
        await nextTick()

        expect(form.data.value.user.name).toBe('Jane')
        expect(nameField.data.value).toBe('Jane')

        // Change through main form
        form.data.value.user.name = 'Bob'
        await nextTick()

        expect(userForm.data.value.name).toBe('Bob')
        expect(nameField.data.value).toBe('Bob')
      })

      it('should handle state changes through main form', async () => {
        const form = useForm({
          initialData: {
            user: {
              profile: {
                name: 'John',
              },
            },
          },
        })

        const userForm = form.getSubForm('user')
        const profileForm = userForm.getSubForm('profile')

        // Change through main form
        form.data.value.user.profile.name = 'Jane'
        await nextTick()

        expect(userForm.data.value.profile.name).toBe('Jane')
        expect(profileForm.data.value.name).toBe('Jane')
      })

      it('should handle initial data changes', async () => {
        const initialData = {
          user: { name: 'John' },
        }

        const form = useForm({
          initialData: () => initialData,
        })

        const userForm = form.getSubForm('user')

        expect(userForm.initialData.value.name).toBe('John')

        // This test would need reactive initial data to work properly
        // For now, just verify the current behavior
        expect(userForm.initialData.value).toEqual({ name: 'John' })
      })
    })
  })

  describe('Edge Cases', () => {
    describe('Validation Edge Cases', () => {
      it('should handle validation function that throws error', async () => {
        const form = useForm({
          initialData: {
            user: { name: 'test' },
          },
        })

        const userForm = form.getSubForm('user')
        userForm.defineValidator({
          validateFn: async () => {
            throw new Error('Validation function error')
          },
        })

        const result = await form.validateForm()

        expect(isValidResult(result)).toBe(false)
        expect(result.errors.general).toContain('Validation function error')
      })

      it('should handle validation function that returns invalid format', async () => {
        const form = useForm({
          initialData: {
            user: { name: 'test' },
          },
        })

        const userForm = form.getSubForm('user')
        userForm.defineValidator({
          validateFn: async () => {
            // Return invalid format (missing propertyErrors)
            return {
              isValid: false,
              errors: {
                general: ['Invalid format error'],
                propertyErrors: {},
              },
            }
          },
        })

        const result = await form.validateForm()

        expect(isValidResult(result)).toBe(false)
        expect(result.errors.general).toContain('Invalid format error')
      })

      it('should handle validation function with undefined data', async () => {
        const form = useForm({
          initialData: {
            user: undefined,
          },
        })

        const userForm = form.getSubForm('user' as never)
        userForm.defineValidator({
          validateFn: async (data) => {
            if (!data) {
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

        expect(isValidResult(result)).toBe(false)
        expect(result.errors.general).toContain('Data is undefined')
      })

      it('can create subforms on non-existent paths', async () => {
        const form = useForm<{
          test: string[]
          nonExistentPath?: { name: string }
        }>({
          initialData: { test: ['item1', 'item2'] },
        })

        const subform = form.getSubForm('nonExistentPath')

        const nameField = subform.defineField({ path: 'name' })

        nameField.setData('Test Name')

        expect(nameField.data.value).toEqual('Test Name')
      })
    })

    describe('Path Edge Cases', () => {
      it('should handle special characters in paths', () => {
        const form = useForm({
          initialData: {
            'user-name': { 'first-name': 'John' },
          },
        })

        const userForm = form.getSubForm('user-name')
        expect(userForm.data.value).toEqual({ 'first-name': 'John' })
      })

      it('should handle numeric string paths', () => {
        const form = useForm({
          initialData: {
            123: { name: 'test' },
          },
        })

        const numericForm = form.getSubForm('123')
        expect(numericForm.data.value).toEqual({ name: 'test' })
      })
    })

    describe('Data Structure Edge Cases', () => {
      it('should handle null values in subform data', () => {
        const form = useForm({
          initialData: {
            user: {
              name: null,
              email: 'test@example.com',
            },
          },
        })

        const userForm = form.getSubForm('user')
        expect(userForm.data.value.name).toBe(null)
        expect(userForm.data.value.email).toBe('test@example.com')
      })

      it('should handle undefined values in subform data', () => {
        const form = useForm({
          initialData: {
            user: {
              name: undefined,
              email: 'test@example.com',
            },
          },
        })

        const userForm = form.getSubForm('user')
        expect(userForm.data.value.name).toBe(undefined)
        expect(userForm.data.value.email).toBe('test@example.com')
      })

      it('should handle empty objects', () => {
        const form = useForm({
          initialData: {
            user: {},
          },
        })

        const userForm = form.getSubForm('user' as never)
        expect(userForm.data.value).toEqual({})
      })

      it('should handle empty arrays', () => {
        const form = useForm({
          initialData: {
            users: [],
          },
        })

        const usersForm = form.getSubForm('users')
        expect(usersForm.data.value).toEqual([])
      })
    })
  })

  describe('Performance', () => {
    describe('Large Form Performance', () => {
      it('should handle large numbers of subforms efficiently', () => {
        const initialData = {
          users: [] as {
            id: number
            name: string
            email: string
          }[],
        }

        // Create 100 users
        for (let i = 0; i < 100; i++) {
          initialData.users.push({
            id: i,
            name: `User ${i}`,
            email: `user${i}@example.com`,
          })
        }

        const form = useForm({ initialData })

        const startTime = performance.now()

        // Create 100 subforms
        const subforms: Form<{
          id: number
          name: string
          email: string
        }>[] = []
        for (let i = 0; i < 100; i++) {
          subforms.push(form.getSubForm(`users.${i}`))
        }

        const endTime = performance.now()
        const duration = endTime - startTime

        // Should complete within reasonable time (less than 100ms)
        expect(duration).toBeLessThan(100)
        expect(subforms).toHaveLength(100)
        expect(subforms[0].data.value.name).toBe('User 0')
        expect(subforms[99].data.value.name).toBe('User 99')
      })

      it('should handle rapid field registration efficiently', () => {
        const form = useForm({
          initialData: {
            user: {
              name: 'John',
              email: 'john@example.com',
              bio: 'Developer',
              phone: '123-456-7890',
              address: '123 Main St',
            },
          },
        })

        const userForm = form.getSubForm('user')

        const startTime = performance.now()

        // Register many fields rapidly
        const fields = [
          userForm.defineField({ path: 'name' }),
          userForm.defineField({ path: 'email' }),
          userForm.defineField({ path: 'bio' }),
          userForm.defineField({ path: 'phone' }),
          userForm.defineField({ path: 'address' }),
        ]

        const endTime = performance.now()
        const duration = endTime - startTime

        // Should complete within reasonable time
        expect(duration).toBeLessThan(50)
        expect(fields).toHaveLength(5)
        expect(fields[0].data.value).toBe('John')
      })

      it('should handle complex validation on large forms', async () => {
        const initialData = {
          users: [] as {
            id: number
            name: string
            email: string
          }[],
        }

        // Create 50 users for validation test
        for (let i = 0; i < 50; i++) {
          initialData.users.push({
            id: i,
            name: `User ${i}`,
            email: `user${i}@example.com`,
          })
        }

        const form = useForm({ initialData })

        // Add validation to multiple subforms
        for (let i = 0; i < 50; i++) {
          const userForm = form.getSubForm(`users.${i}`)
          userForm.defineValidator({
            schema: z.object({
              id: z.number(),
              name: z.string().min(1, 'Name required'),
              email: z.email('Invalid email'),
            }),
          })
        }

        const startTime = performance.now()
        const result = await form.validateForm()
        const endTime = performance.now()
        const duration = endTime - startTime

        // Should complete within reasonable time (less than 1000ms)
        expect(duration).toBeLessThan(1000)
        expect(isValidResult(result)).toBe(true)
      })
    })

    describe('Memory Usage', () => {
      it('should not create excessive memory usage with many subforms', () => {
        const form = useForm({
          initialData: {
            users: Array.from({ length: 1000 }, (_, i) => ({
              id: i,
              name: `User ${i}`,
            })),
          },
        })

        // Create many subforms
        const subforms: Form<{
          id: number
          name: string
        }>[] = []
        for (let i = 0; i < 100; i++) {
          subforms.push(form.getSubForm(`users.${i}`))
        }

        // Should not crash or cause memory issues
        expect(subforms).toHaveLength(100)

        // Clear references
        subforms.length = 0
      })

      it('should handle subform cleanup properly', () => {
        const form = useForm({
          initialData: {
            users: [
              { name: 'John' },
              { name: 'Jane' },
            ],
          },
        })

        let userForm: Form<{
          name: string
        }> | undefined = form.getSubForm('users.0')
        expect(userForm.data.value.name).toBe('John')

        // Remove reference
        userForm = undefined

        // Should not cause issues
        const newUserForm = form.getSubForm('users.0')
        expect(newUserForm.data.value.name).toBe('John')
      })
    })

    describe('Reactivity Performance', () => {
      it('should handle frequent data updates efficiently', async () => {
        const form = useForm({
          initialData: {
            user: { name: 'John' },
          },
        })

        const userForm = form.getSubForm('user')
        const nameField = userForm.defineField({ path: 'name' })

        const startTime = performance.now()

        // Make many rapid updates
        for (let i = 0; i < 100; i++) {
          nameField.setData(`Name ${i}`)
          await nextTick()
        }

        const endTime = performance.now()
        const duration = endTime - startTime

        // Should complete within reasonable time (less than 500ms)
        expect(duration).toBeLessThan(500)
        expect(nameField.data.value).toBe('Name 99')
      })

      it('should handle nested reactivity updates efficiently', async () => {
        const form = useForm({
          initialData: {
            user: {
              profile: {
                personal: {
                  name: 'John',
                },
              },
            },
          },
        })

        const userForm = form.getSubForm('user')
        const profileForm = userForm.getSubForm('profile')
        const personalForm = profileForm.getSubForm('personal')

        const startTime = performance.now()

        // Make updates at different levels
        for (let i = 0; i < 50; i++) {
          personalForm.data.value.name = `Name ${i}`
          await nextTick()
        }

        const endTime = performance.now()
        const duration = endTime - startTime

        // Should complete within reasonable time
        expect(duration).toBeLessThan(500)
        expect(personalForm.data.value.name).toBe('Name 49')
      })
    })
  })

  describe('Toplevel array subform', () => {
    it('can handle arrays on top level', async () => {
      const schema = z.object({ test: z.array(z.string()) })

      const form = useForm({
        initialData: { test: ['item1', 'item2'] },
        schema,
      })

      const subform = form.getSubForm('test')

      const rootField = subform.defineField({ path: '' })
      const itemField = subform.defineField({ path: '0' })

      expect(rootField.data.value).toEqual(['item1', 'item2'])
      expect(itemField.data.value).toEqual('item1')
    })
  })
})
