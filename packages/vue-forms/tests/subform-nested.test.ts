import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'

describe('Nested Subforms', () => {
  describe('Deep Nesting', () => {
    it('should handle infinite nesting levels', () => {
      const form = useForm({
        initialData: {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: { name: 'Deep Value' },
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

      expect(deepForm.formData.value.name).toBe('Deep Value')

      const nameField = deepForm.defineField({ path: 'name' })
      expect(form.getField('level1.level2.level3.level4.level5.name')).toBe(nameField)
    })

    it('should handle complex nested structure', () => {
      const form = useForm({
        initialData: {
          organization: {
            departments: {
              engineering: {
                teams: {
                  frontend: {
                    members: [
                      {
                        personal: {
                          name: 'John',
                          contact: {
                            email: 'john@example.com',
                            phone: '123-456-7890',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      })

      const memberForm = form
        .getSubForm('organization')
        .getSubForm('departments')
        .getSubForm('engineering')
        .getSubForm('teams')
        .getSubForm('frontend')
        .getSubForm('members.0')

      const personalForm = memberForm.getSubForm('personal')
      const contactForm = personalForm.getSubForm('contact')

      expect(contactForm.formData.value.email).toBe('john@example.com')
      expect(contactForm.formData.value.phone).toBe('123-456-7890')
    })

    it('should handle mixed object and array nesting', () => {
      const form = useForm({
        initialData: {
          companies: [
            {
              name: 'Tech Corp',
              departments: [
                {
                  name: 'Engineering',
                  employees: [
                    {
                      name: 'John',
                      projects: [
                        {
                          name: 'Project A',
                          tasks: [
                            {
                              name: 'Task 1',
                              completed: false,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      })

      const taskForm = form
        .getSubForm('companies.0')
        .getSubForm('departments.0')
        .getSubForm('employees.0')
        .getSubForm('projects.0')
        .getSubForm('tasks.0')

      expect(taskForm.formData.value.name).toBe('Task 1')
      expect(taskForm.formData.value.completed).toBe(false)

      const completedField = taskForm.defineField({ path: 'completed' })
      expect(form.getField('companies.0.departments.0.employees.0.projects.0.tasks.0.completed')).toBe(completedField)
    })
  })

  describe('Nested Field Operations', () => {
    it('should handle field registration across nested levels', () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              personal: {
                name: 'John',
                age: 30,
              },
              professional: {
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
      const professionalForm = profileForm.getSubForm('professional')

      const nameField = personalForm.defineField({ path: 'name' })
      const titleField = professionalForm.defineField({ path: 'title' })

      // Fields should be registered with full paths
      expect(form.getField('user.profile.personal.name')).toBe(nameField)
      expect(form.getField('user.profile.professional.title')).toBe(titleField)

      // Fields should be accessible through nested subforms
      expect(personalForm.getField('name')).toBe(nameField)
      expect(professionalForm.getField('title')).toBe(titleField)

      // Parent subforms should be able to access nested fields
      expect(profileForm.getField('personal.name')).toBe(nameField)
      expect(userForm.getField('profile.personal.name')).toBe(nameField)
    })

    it('should handle field filtering across nested levels', () => {
      const form = useForm({
        initialData: {
          section1: {
            subsection1: {
              field1: 'value1',
              field2: 'value2',
            },
            subsection2: {
              field3: 'value3',
              field4: 'value4',
            },
          },
          section2: {
            subsection3: { field5: 'value5' },
          },
        },
      })

      const section1Form = form.getSubForm('section1')
      const subsection1Form = section1Form.getSubForm('subsection1')
      const subsection2Form = section1Form.getSubForm('subsection2')
      const section2Form = form.getSubForm('section2')

      // Define fields at different levels
      subsection1Form.defineField({ path: 'field1' })
      subsection1Form.defineField({ path: 'field2' })
      subsection2Form.defineField({ path: 'field3' })
      subsection2Form.defineField({ path: 'field4' })
      section2Form.defineField({ path: 'subsection3.field5' })

      // Field filtering should work correctly
      expect(subsection1Form.getFields()).toHaveLength(2)
      expect(subsection2Form.getFields()).toHaveLength(2)
      expect(section1Form.getFields()).toHaveLength(4)
      expect(section2Form.getFields()).toHaveLength(1)
      expect(form.getFields()).toHaveLength(5)
    })
  })

  describe('Nested Data Synchronization', () => {
    it('should maintain data synchronization across nested levels', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              name: 'John',
              settings: {
                theme: 'dark',
              },
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')
      const settingsForm = profileForm.getSubForm('settings')

      const themeField = settingsForm.defineField({ path: 'theme' })

      // Change through deepest level
      themeField.setValue('light')
      await nextTick()

      // All levels should reflect the change
      expect(form.formData.value.user.profile.settings.theme).toBe('light')
      expect(userForm.formData.value.profile.settings.theme).toBe('light')
      expect(profileForm.formData.value.settings.theme).toBe('light')
      expect(settingsForm.formData.value.theme).toBe('light')
    })

    it('should handle changes from any level', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              name: 'John',
              preferences: {
                theme: 'dark',
                language: 'en',
              },
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')
      const preferencesForm = profileForm.getSubForm('preferences')

      const themeField = preferencesForm.defineField({ path: 'theme' })

      // Change through main form
      form.formData.value.user.profile.preferences.theme = 'light'
      await nextTick()

      // Nested subforms should reflect the change
      expect(preferencesForm.formData.value.theme).toBe('light')
      expect(themeField.value.value).toBe('light')

      // Change through intermediate level
      profileForm.formData.value.preferences.language = 'es'
      await nextTick()

      // Main form should reflect the change
      expect(form.formData.value.user.profile.preferences.language).toBe('es')
    })
  })

  describe('Nested Validation', () => {
    it('should handle validation at multiple nested levels', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              personal: {
                name: '',
                email: '',
              },
              professional: {
                title: '',
                company: '',
              },
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')

      profileForm.getSubForm('personal', {
        schema: z.object({
          name: z.string().min(1, 'Name required'),
          email: z.string().email('Invalid email'),
        }),
      })

      profileForm.getSubForm('professional', {
        schema: z.object({
          title: z.string().min(1, 'Title required'),
          company: z.string().min(1, 'Company required'),
        }),
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.profile.personal.name']).toContain('Name required')
      expect(result.errors.propertyErrors['user.profile.personal.email']).toContain('Invalid email')
      expect(result.errors.propertyErrors['user.profile.professional.title']).toContain('Title required')
      expect(result.errors.propertyErrors['user.profile.professional.company']).toContain('Company required')
    })

    it('should handle validation functions at nested levels', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              security: {
                password: 'weak',
                confirmPassword: 'different',
              },
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')

      profileForm.getSubForm('security', {
        validateFn: async (data) => {
          const errors = {
            general: [],
            propertyErrors: {},
          }

          if (data.password.length < 8) {
            errors.propertyErrors.password = ['Password must be at least 8 characters']
          }

          if (data.password !== data.confirmPassword) {
            errors.propertyErrors.confirmPassword = ['Passwords do not match']
          }

          return {
            isValid: Object.keys(errors.propertyErrors).length === 0,
            errors,
          }
        },
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.profile.security.password']).toContain('Password must be at least 8 characters')
      expect(result.errors.propertyErrors['user.profile.security.confirmPassword']).toContain('Passwords do not match')
    })

    it('should handle mixed validation types at different levels', async () => {
      const form = useForm({
        initialData: {
          user: {
            basic: {
              name: '',
              email: '',
            },
            advanced: {
              password: 'weak',
              role: 'invalid',
            },
          },
        },
        schema: z.object({
          user: z.object({
            basic: z.object({
              name: z.string().min(1, 'Name required'),
            }),
          }),
        }),
      })

      const userForm = form.getSubForm('user')
      userForm.getSubForm('basic', {
        schema: z.object({
          email: z.string().email('Invalid email'),
        }),
      })

      userForm.getSubForm('advanced', {
        validateFn: async data => ({
          isValid: data.password.length >= 8 && data.role === 'admin',
          errors: {
            general: [],
            propertyErrors: {
              password: data.password.length < 8 ? ['Password too short'] : [],
              role: data.role !== 'admin' ? ['Invalid role'] : [],
            },
          },
        }),
      })

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.basic.name']).toContain('Name required')
      expect(result.errors.propertyErrors['user.basic.email']).toContain('Invalid email')
      expect(result.errors.propertyErrors['user.advanced.password']).toContain('Password too short')
      expect(result.errors.propertyErrors['user.advanced.role']).toContain('Invalid role')
    })
  })

  describe('Nested State Management', () => {
    it('should handle state computation across nested levels', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              personal: { name: 'John' },
              professional: { title: 'Developer' },
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')
      const personalForm = profileForm.getSubForm('personal')
      const professionalForm = profileForm.getSubForm('professional')

      const nameField = personalForm.defineField({ path: 'name' })
      professionalForm.defineField({ path: 'title' })

      // Initially not dirty
      expect(personalForm.isDirty.value).toBe(false)
      expect(professionalForm.isDirty.value).toBe(false)
      expect(profileForm.isDirty.value).toBe(false)
      expect(userForm.isDirty.value).toBe(false)

      // Change personal name
      nameField.setValue('Jane')
      await nextTick()

      // Personal, profile, and user should be dirty, but not professional
      expect(personalForm.isDirty.value).toBe(true)
      expect(professionalForm.isDirty.value).toBe(false)
      expect(profileForm.isDirty.value).toBe(true)
      expect(userForm.isDirty.value).toBe(true)
    })

    it('should handle nested reset operations', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              personal: {
                name: 'John',
                age: 30,
              },
              professional: {
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
      const professionalForm = profileForm.getSubForm('professional')

      const nameField = personalForm.defineField({ path: 'name' })
      const titleField = professionalForm.defineField({ path: 'title' })

      // Change values
      nameField.setValue('Jane')
      titleField.setValue('Senior Developer')
      await nextTick()

      // Reset profile level
      profileForm.reset()
      await nextTick()

      // Both personal and professional should be reset
      expect(personalForm.formData.value.name).toBe('John')
      expect(professionalForm.formData.value.title).toBe('Developer')
    })

    it('should handle selective nested resets', async () => {
      const form = useForm({
        initialData: {
          user: {
            profile: {
              personal: {
                name: 'John',
                age: 30,
              },
              professional: {
                title: 'Developer',
                company: 'Tech Corp',
              },
            },
            settings: {
              theme: 'dark',
            },
          },
        },
      })

      const userForm = form.getSubForm('user')
      const profileForm = userForm.getSubForm('profile')
      const personalForm = profileForm.getSubForm('personal')
      const professionalForm = profileForm.getSubForm('professional')
      const settingsForm = userForm.getSubForm('settings')

      const nameField = personalForm.defineField({ path: 'name' })
      const titleField = professionalForm.defineField({ path: 'title' })
      const themeField = settingsForm.defineField({ path: 'theme' })

      // Change values
      nameField.setValue('Jane')
      titleField.setValue('Senior Developer')
      themeField.setValue('light')
      await nextTick()

      // Reset only personal form
      personalForm.reset()
      await nextTick()

      // Only personal should be reset
      expect(personalForm.formData.value.name).toBe('John')
      expect(professionalForm.formData.value.title).toBe('Senior Developer')
      expect(settingsForm.formData.value.theme).toBe('light')
    })
  })

  describe('Performance with Deep Nesting', () => {
    it('should handle reasonable performance with moderate nesting', () => {
      const form = useForm({
        initialData: {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: {
                    items: Array.from({ length: 100 }, (_, i) => ({
                      id: i,
                      name: `Item ${i}`,
                      details: {
                        description: `Description ${i}`,
                        metadata: {
                          tags: [`tag${i}`],
                          priority: i % 3,
                        },
                      },
                    })),
                  },
                },
              },
            },
          },
        },
      })

      const startTime = performance.now()

      // Create nested subforms
      const deepForm = form
        .getSubForm('level1')
        .getSubForm('level2')
        .getSubForm('level3')
        .getSubForm('level4')
        .getSubForm('level5')

      // Access array items
      const firstItemForm = deepForm.getSubForm('items.0')
      const detailsForm = firstItemForm.getSubForm('details')
      const metadataForm = detailsForm.getSubForm('metadata')

      const endTime = performance.now()

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(100) // 100ms
      expect(firstItemForm.formData.value.name).toBe('Item 0')
      expect(metadataForm.formData.value.priority).toBe(0)
    })
  })
})

