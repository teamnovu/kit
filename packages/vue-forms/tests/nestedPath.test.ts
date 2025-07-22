import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'

describe('Nested Path Handling', () => {
  interface TestFormData {
    user: {
      name: string
      email: string
      profile: {
        age: number
        bio: string
        preferences: {
          theme: string
          notifications: boolean
        }
      }
    }
    company: {
      name: string
      address: {
        street: string
        city: string
        country: string
        coordinates: {
          lat: number
          lng: number
        }
      }
    }
    tags: string[]
    contacts: Array<{
      id: string
      name: string
      email: string
      addresses: Array<{
        type: string
        street: string
        city: string
      }>
    }>
    metadata: Record<string, any>
  }

  const initialData: TestFormData = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      profile: {
        age: 30,
        bio: 'Software developer',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      },
    },
    company: {
      name: 'Tech Corp',
      address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
        coordinates: {
          lat: 40.7128,
          lng: -74.0060,
        },
      },
    },
    tags: ['javascript', 'vue', 'typescript'],
    contacts: [
      {
        id: '1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        addresses: [
          {
            type: 'home',
            street: '456 Oak Ave',
            city: 'Boston',
          },
          {
            type: 'work',
            street: '789 Pine St',
            city: 'Cambridge',
          },
        ],
      },
      {
        id: '2',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        addresses: [
          {
            type: 'home',
            street: '321 Elm St',
            city: 'Seattle',
          },
        ],
      },
    ],
    metadata: {
      version: '1.0',
      created: '2023-01-01',
      settings: {
        debug: false,
        timeout: 5000,
      },
    },
  }

  describe('Basic Nested Path Field Operations', () => {
    it('should define and access fields with simple nested paths', () => {
      const form = useForm({ initialData })

      const nameField = form.defineField({ path: 'user.name' })
      const emailField = form.defineField({ path: 'user.email' })

      expect(nameField.data.value).toBe('John Doe')
      expect(emailField.data.value).toBe('john@example.com')
    })

    it('should define and access fields with deeply nested paths', () => {
      const form = useForm({ initialData })

      const ageField = form.defineField({ path: 'user.profile.age' })
      const themeField = form.defineField({ path: 'user.profile.preferences.theme' })
      const notificationsField = form.defineField({ path: 'user.profile.preferences.notifications' })

      expect(ageField.data.value).toBe(30)
      expect(themeField.data.value).toBe('dark')
      expect(notificationsField.data.value).toBe(true)
    })

    it('should update nested field values reactively', async () => {
      const form = useForm({ initialData })

      const nameField = form.defineField({ path: 'user.name' })
      const ageField = form.defineField({ path: 'user.profile.age' })

      nameField.data.value = 'Jane Doe'
      ageField.data.value = 25

      await nextTick()

      expect(form.data.value.user.name).toBe('Jane Doe')
      expect(form.data.value.user.profile.age).toBe(25)
    })

    it('should retrieve fields using getField with nested paths', () => {
      const form = useForm({ initialData })

      form.defineField({ path: 'user.name' })
      form.defineField({ path: 'user.profile.age' })

      const nameField = form.getField('user.name')
      const ageField = form.getField('user.profile.age')

      expect(nameField).toBeDefined()
      expect(ageField).toBeDefined()
      expect(nameField?.data.value).toBe('John Doe')
      expect(ageField?.data.value).toBe(30)
    })

    it('should handle nested paths with complex coordinate data', () => {
      const form = useForm({ initialData })

      const latField = form.defineField({ path: 'company.address.coordinates.lat' })
      const lngField = form.defineField({ path: 'company.address.coordinates.lng' })

      expect(latField.data.value).toBe(40.7128)
      expect(lngField.data.value).toBe(-74.0060)

      latField.data.value = 41.8781
      lngField.data.value = -87.6298

      expect(form.data.value.company.address.coordinates.lat).toBe(41.8781)
      expect(form.data.value.company.address.coordinates.lng).toBe(-87.6298)
    })
  })

  describe('Array Path Handling', () => {
    it('should handle array index paths', () => {
      const form = useForm({ initialData })

      const firstTagField = form.defineField({ path: 'tags.0' })
      const secondTagField = form.defineField({ path: 'tags.1' })

      expect(firstTagField.data.value).toBe('javascript')
      expect(secondTagField.data.value).toBe('vue')
    })

    it('should handle nested object arrays with index paths', () => {
      const form = useForm({ initialData })

      const firstContactNameField = form.defineField({ path: 'contacts.0.name' })
      const firstContactEmailField = form.defineField({ path: 'contacts.0.email' })
      const secondContactNameField = form.defineField({ path: 'contacts.1.name' })

      expect(firstContactNameField.data.value).toBe('Jane Smith')
      expect(firstContactEmailField.data.value).toBe('jane@example.com')
      expect(secondContactNameField.data.value).toBe('Bob Johnson')
    })

    it('should handle deeply nested arrays with multiple levels', () => {
      const form = useForm({ initialData })

      const firstContactFirstAddressTypeField = form.defineField({
        path: 'contacts.0.addresses.0.type',
      })
      const firstContactFirstAddressStreetField = form.defineField({
        path: 'contacts.0.addresses.0.street',
      })
      const firstContactSecondAddressTypeField = form.defineField({
        path: 'contacts.0.addresses.1.type',
      })
      const secondContactFirstAddressStreetField = form.defineField({
        path: 'contacts.1.addresses.0.street',
      })

      expect(firstContactFirstAddressTypeField.data.value).toBe('home')
      expect(firstContactFirstAddressStreetField.data.value).toBe('456 Oak Ave')
      expect(firstContactSecondAddressTypeField.data.value).toBe('work')
      expect(secondContactFirstAddressStreetField.data.value).toBe('321 Elm St')
    })

    it('should update array element values reactively', async () => {
      const form = useForm({ initialData })

      const firstTagField = form.defineField({ path: 'tags.0' })
      const firstContactNameField = form.defineField({ path: 'contacts.0.name' })

      firstTagField.data.value = 'react'
      firstContactNameField.data.value = 'Janet Smith'

      await nextTick()

      expect(form.data.value.tags[0]).toBe('react')
      expect(form.data.value.contacts[0].name).toBe('Janet Smith')
    })

    it('should handle dynamic array indices', async () => {
      const form = useForm({ initialData })

      // Test that we can access different indices
      for (let i = 0; i < form.data.value.tags.length; i++) {
        const tagField = form.defineField({ path: `tags.${i}` as `tags.${number}` })
        expect(tagField.data.value).toBe(initialData.tags[i])
      }

      // Test that we can access different contact indices
      for (let i = 0; i < form.data.value.contacts.length; i++) {
        const contactNameField = form.defineField({ path: `contacts.${i}.name` as `contacts.${number}.name` })
        expect(contactNameField.data.value).toBe(initialData.contacts[i].name)
      }
    })
  })

  describe('Dynamic and Record Object Paths', () => {
    it('should handle record object paths', () => {
      const form = useForm({ initialData })

      const versionField = form.defineField({ path: 'metadata.version' })
      const createdField = form.defineField({ path: 'metadata.created' })
      const debugField = form.defineField({ path: 'metadata.settings.debug' })
      const timeoutField = form.defineField({ path: 'metadata.settings.timeout' })

      expect(versionField.data.value).toBe('1.0')
      expect(createdField.data.value).toBe('2023-01-01')
      expect(debugField.data.value).toBe(false)
      expect(timeoutField.data.value).toBe(5000)
    })

    it('should handle record object updates', async () => {
      const form = useForm({ initialData })

      const versionField = form.defineField({ path: 'metadata.version' })
      const debugField = form.defineField({ path: 'metadata.settings.debug' })

      versionField.data.value = '2.0'
      debugField.data.value = true

      await nextTick()

      expect(form.data.value.metadata.version).toBe('2.0')
      expect(form.data.value.metadata.settings.debug).toBe(true)
    })
  })

  describe('Field State Management with Nested Paths', () => {
    it('should track dirty state for nested fields', async () => {
      const form = useForm({ initialData })

      const nameField = form.defineField({ path: 'user.name' })
      const ageField = form.defineField({ path: 'user.profile.age' })

      expect(nameField.dirty.value).toBe(false)
      expect(ageField.dirty.value).toBe(false)

      nameField.data.value = 'Jane Doe'
      await nextTick()

      expect(nameField.dirty.value).toBe(true)
      expect(ageField.dirty.value).toBe(false)

      ageField.data.value = 25
      await nextTick()

      expect(ageField.dirty.value).toBe(true)
    })

    it('should track touched state for nested fields', async () => {
      const form = useForm({ initialData })

      const nameField = form.defineField({ path: 'user.name' })
      const emailField = form.defineField({ path: 'user.email' })

      expect(nameField.touched.value).toBe(false)
      expect(emailField.touched.value).toBe(false)

      nameField.onBlur()
      await nextTick()

      expect(nameField.touched.value).toBe(true)
      expect(emailField.touched.value).toBe(false)
    })

    it('should handle reset for nested fields', async () => {
      const form = useForm({ initialData })

      const nameField = form.defineField({ path: 'user.name' })
      const ageField = form.defineField({ path: 'user.profile.age' })

      nameField.data.value = 'Jane Doe'
      ageField.data.value = 25
      nameField.onBlur()

      await nextTick()

      expect(nameField.data.value).toBe('Jane Doe')
      expect(nameField.dirty.value).toBe(true)
      expect(nameField.touched.value).toBe(true)

      nameField.reset()
      await nextTick()

      expect(nameField.data.value).toBe('John Doe')
      expect(nameField.dirty.value).toBe(false)
      expect(nameField.touched.value).toBe(false)
    })
  })

  describe('Validation with Nested Paths', () => {
    const schema = z.looseObject({
      user: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        profile: z.object({
          age: z.number().min(18, 'Must be at least 18'),
          bio: z.string().min(10, 'Bio must be at least 10 characters'),
          preferences: z.object({
            theme: z.enum(['light', 'dark'], { message: 'Theme must be light or dark' }),
            notifications: z.boolean(),
          }),
        }),
      }),
      company: z.object({
        name: z.string().min(1, 'Company name is required'),
        address: z.object({
          street: z.string().min(1, 'Street is required'),
          city: z.string().min(1, 'City is required'),
          country: z.string().min(1, 'Country is required'),
          coordinates: z.object({
            lat: z.number().min(-90)
              .max(90, 'Invalid latitude'),
            lng: z.number().min(-180)
              .max(180, 'Invalid longitude'),
          }),
        }),
      }),
      tags: z.array(z.string().min(1)),
      contacts: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, 'Contact name is required'),
        email: z.string().email('Invalid contact email'),
        addresses: z.array(z.object({
          type: z.enum(['home', 'work'], { message: 'Address type must be home or work' }),
          street: z.string().min(1, 'Address street is required'),
          city: z.string().min(1, 'Address city is required'),
        })),
      })),
    })

    it('should validate nested field paths', async () => {
      const form = useForm({
        initialData,
        schema,
      })

      const nameField = form.defineField({ path: 'user.name' })
      const emailField = form.defineField({ path: 'user.email' })

      nameField.data.value = 'A'
      emailField.data.value = 'invalid-email'

      await nextTick()

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.name']).toContain('Name must be at least 2 characters')
      expect(result.errors.propertyErrors['user.email']).toContain('Invalid email format')
    })

    it('should validate deeply nested paths', async () => {
      const form = useForm({
        initialData,
        schema,
      })

      const ageField = form.defineField({ path: 'user.profile.age' })
      const themeField = form.defineField({ path: 'user.profile.preferences.theme' })

      ageField.data.value = 16
      themeField.data.value = 'blue' as typeof themeField.data.value

      await nextTick()

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['user.profile.age']).toContain('Must be at least 18')
      expect(result.errors.propertyErrors['user.profile.preferences.theme']).toContain('Theme must be light or dark')
    })

    it('should validate array element paths', async () => {
      const form = useForm({
        initialData,
        schema,
      })

      const firstContactNameField = form.defineField({ path: 'contacts.0.name' })
      const firstContactEmailField = form.defineField({ path: 'contacts.0.email' })

      firstContactNameField.data.value = ''
      firstContactEmailField.data.value = 'invalid-email'

      await nextTick()

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['contacts.0.name']).toContain('Contact name is required')
      expect(result.errors.propertyErrors['contacts.0.email']).toContain('Invalid contact email')
    })

    it('should validate nested array paths', async () => {
      const form = useForm({
        initialData,
        schema,
      })

      const addressTypeField = form.defineField({ path: 'contacts.0.addresses.0.type' })
      const addressStreetField = form.defineField({ path: 'contacts.0.addresses.0.street' })

      addressTypeField.data.value = 'office' as typeof addressTypeField.data.value
      addressStreetField.data.value = ''

      await nextTick()

      const result = await form.validateForm()

      expect(result.isValid).toBe(false)
      expect(result.errors.propertyErrors['contacts.0.addresses.0.type']).toContain('Address type must be home or work')
      expect(result.errors.propertyErrors['contacts.0.addresses.0.street']).toContain('Address street is required')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle non-existent nested paths gracefully', () => {
      const form = useForm({ initialData })

      const nonExistentField = form.defineField({ path: 'user.nonexistent' as any })

      expect(nonExistentField.data.value).toBeUndefined()
    })

    it('should handle deeply non-existent paths', () => {
      const form = useForm({ initialData })

      const deepNonExistentField = form.defineField({ path: 'user.nonexistent.deep.path' as any })

      expect(deepNonExistentField.data.value).toBeUndefined()
    })

    it('should handle array index out of bounds', () => {
      const form = useForm({ initialData })

      const outOfBoundsField = form.defineField({ path: 'tags.99' as any })

      expect(outOfBoundsField.data.value).toBeUndefined()
    })

    it('should handle nested array index out of bounds', () => {
      const form = useForm({ initialData })

      const outOfBoundsField = form.defineField({ path: 'contacts.99.name' as any })

      expect(outOfBoundsField.data.value).toBeUndefined()
    })

    it('should handle paths with spaces around dots', () => {
      const form = useForm({ initialData })

      const nameField = form.defineField({ path: 'user . name' as any })

      expect(nameField.data.value).toBe('John Doe')
    })

    it('should handle empty path segments', () => {
      const form = useForm({ initialData })

      const nameField = form.defineField({ path: 'user..name' as any })

      expect(nameField.data.value).toBe('John Doe')
    })

    it('should handle setting values on non-existent paths', async () => {
      const form = useForm({ initialData })

      const nonExistentField = form.defineField({ path: 'user.newField' as any })

      nonExistentField.data.value = 'new value'

      await nextTick()

      expect((form.data.value.user as any).newField).toBe('new value')
    })
  })

  describe('Performance and Memory', () => {
    it('should replace field when defining same path twice', () => {
      const form = useForm({ initialData })

      const field1 = form.defineField({ path: 'user.name' })
      const field2 = form.defineField({ path: 'user.name' })

      // Fields are not the same object, but second field replaces the first
      expect(field1).not.toBe(field2)
      expect(form.getField('user.name')).toBe(field2)
      expect(form.getFields().length).toBe(1)
    })

    it('should handle large numbers of nested fields', () => {
      const form = useForm({ initialData })

      const fields = []

      // Create many nested fields
      for (let i = 0; i < 100; i++) {
        if (i < form.data.value.contacts.length) {
          fields.push(form.defineField({ path: `contacts.${i}.name` }))
          fields.push(form.defineField({ path: `contacts.${i}.email` }))
        }
      }

      expect(fields.length).toBeGreaterThan(0)
      expect(form.getFields().length).toBeGreaterThan(0)
    })
  })

  describe('Integration with Form State', () => {
    it('should properly integrate nested fields with form dirty state', async () => {
      const form = useForm({ initialData })

      const nameField = form.defineField({ path: 'user.name' })
      form.defineField({ path: 'user.profile.age' })

      expect(form.isDirty.value).toBe(false)

      nameField.data.value = 'Jane Doe'
      await nextTick()

      expect(form.isDirty.value).toBe(true)

      nameField.reset()
      await nextTick()

      expect(form.isDirty.value).toBe(false)
    })

    it('should properly integrate nested fields with form touched state', async () => {
      const form = useForm({ initialData })

      const nameField = form.defineField({ path: 'user.name' })
      form.defineField({ path: 'user.email' })

      expect(form.isTouched.value).toBe(false)

      nameField.onBlur()
      await nextTick()

      expect(form.isTouched.value).toBe(true)

      form.reset()
      await nextTick()

      expect(form.isTouched.value).toBe(false)
    })

    it('should properly integrate nested fields with form validation state', async () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(2),
          email: z.string().email(),
        }),
      })

      const form = useForm({
        initialData,
        schema,
      })

      const nameField = form.defineField({ path: 'user.name' })
      const emailField = form.defineField({ path: 'user.email' })

      // Initial validation
      await form.validateForm()
      expect(form.isValid.value).toBe(true)

      nameField.data.value = 'A'
      emailField.data.value = 'invalid'

      await nextTick()

      // Trigger validation after changes
      await form.validateForm()
      expect(form.isValid.value).toBe(false)

      nameField.data.value = 'John Doe'
      emailField.data.value = 'john@example.com'

      await nextTick()

      // Trigger validation after changes
      await form.validateForm()
      expect(form.isValid.value).toBe(true)
    })
  })
})
