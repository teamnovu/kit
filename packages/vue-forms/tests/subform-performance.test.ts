import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'

describe('Subform Performance Tests', () => {
  describe('Large Form Performance', () => {
    it('should handle large numbers of subforms efficiently', () => {
      const initialData = {}
      for (let i = 0; i < 1000; i++) {
        initialData[`section${i}`] = {
          name: `Section ${i}`,
          description: `Description for section ${i}`,
          items: Array.from({ length: 10 }, (_, j) => ({
            id: j,
            name: `Item ${j}`,
            value: j * i,
          })),
        }
      }

      const form = useForm({ initialData })

      const startTime = performance.now()

      // Create 1000 subforms
      const subforms = []
      for (let i = 0; i < 1000; i++) {
        subforms.push(form.getSubForm(`section${i}`))
      }

      const endTime = performance.now()

      // Should complete in reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(2000) // 2 seconds

      // Verify subforms work correctly
      expect(subforms[0].formData.value.name).toBe('Section 0')
      expect(subforms[999].formData.value.name).toBe('Section 999')
      expect(subforms[500].formData.value.items).toHaveLength(10)
    })

    it('should handle deep nesting efficiently', () => {
      const createNestedData = (depth, currentDepth = 0) => {
        if (currentDepth >= depth) {
          return { value: `Deep value at level ${currentDepth}` }
        }

        return {
          [`level${currentDepth}`]: createNestedData(depth, currentDepth + 1),
          [`data${currentDepth}`]: `Data at level ${currentDepth}`,
        }
      }

      const form = useForm({
        initialData: createNestedData(20), // 20 levels deep
      })

      const startTime = performance.now()

      // Navigate to deep level
      let currentForm = form
      for (let i = 0; i < 19; i++) {
        currentForm = currentForm.getSubForm(`level${i}`)
      }

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // 100ms
      expect(currentForm.formData.value.value).toBe('Deep value at level 19')
    })

    it('should handle rapid field registration efficiently', () => {
      const initialData = {
        sections: Array.from({ length: 500 }, (_, i) => ({
          id: i,
          name: `Section ${i}`,
          description: `Description ${i}`,
          settings: {
            enabled: true,
            priority: i % 5,
            tags: [`tag${i}`, `category${i % 10}`],
          },
        })),
      }

      const form = useForm({ initialData })

      const startTime = performance.now()

      // Create subforms and register fields rapidly
      for (let i = 0; i < 500; i++) {
        const sectionForm = form.getSubForm(`sections.${i}`)
        sectionForm.defineField({ path: 'name' })
        sectionForm.defineField({ path: 'description' })

        const settingsForm = sectionForm.getSubForm('settings')
        settingsForm.defineField({ path: 'enabled' })
        settingsForm.defineField({ path: 'priority' })
      }

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // 1 second
      expect(form.getFields()).toHaveLength(2000) // 500 sections * 4 fields
    })

    it('should handle complex validation on large forms', async () => {
      const initialData = {
        users: Array.from({ length: 200 }, (_, i) => ({
          id: i,
          name: i < 100 ? `User ${i}` : '', // Half have valid names
          email: i < 100 ? `user${i}@example.com` : 'invalid', // Half have valid emails
          profile: {
            age: i < 100 ? 25 + i : 10, // Half have valid age
            bio: i < 100 ? `Bio for user ${i}` : 'short',
          },
        })),
      }

      const form = useForm({ initialData })

      // Add validation to many subforms
      for (let i = 0; i < 200; i++) {
        const userForm = form.getSubForm(`users.${i}`, {
          schema: z.object({
            name: z.string().min(1, 'Name required'),
            email: z.string().email('Invalid email'),
          }),
        })

        const profileForm = userForm.getSubForm('profile', {
          schema: z.object({
            age: z.number().min(18, 'Must be 18 or older'),
            bio: z.string().min(10, 'Bio too short'),
          }),
        })
      }

      const startTime = performance.now()

      const result = await form.validateForm()

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(5000) // 5 seconds
      expect(result.isValid).toBe(false)

      // Should have many validation errors
      const errorCount = Object.keys(result.errors.propertyErrors).length
      expect(errorCount).toBeGreaterThan(100)
    })
  })

  describe('Memory Usage', () => {
    it('should not create excessive memory usage with many subforms', () => {
      const form = useForm({
        initialData: {
          data: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            nested: {
              value: i * 2,
              description: `Description ${i}`,
            },
          })),
        },
      })

      const subforms = []
      const nestedSubforms = []

      // Create many subforms
      for (let i = 0; i < 1000; i++) {
        const subform = form.getSubForm(`data.${i}`)
        subforms.push(subform)

        const nestedSubform = subform.getSubForm('nested')
        nestedSubforms.push(nestedSubform)
      }

      // Memory usage should be reasonable
      // (This is more of a documentation test - actual memory measurement would require additional tools)
      expect(subforms).toHaveLength(1000)
      expect(nestedSubforms).toHaveLength(1000)
    })

    it('should handle subform cleanup properly', () => {
      const form = useForm({
        initialData: {
          sections: Array.from({ length: 100 }, (_, i) => ({
            id: i,
            name: `Section ${i}`,
          })),
        },
      })

      let subforms = []

      // Create subforms with fields
      for (let i = 0; i < 100; i++) {
        const subform = form.getSubForm(`sections.${i}`)
        subform.defineField({ path: 'name' })
        subforms.push(subform)
      }

      expect(form.getFields()).toHaveLength(100)

      // Clear subform references
      subforms = []

      // Fields should still exist in main form
      expect(form.getFields()).toHaveLength(100)
    })
  })

  describe('Reactivity Performance', () => {
    it('should handle frequent data updates efficiently', async () => {
      const form = useForm({
        initialData: {
          counters: Array.from({ length: 100 }, (_, i) => ({
            id: i,
            value: 0,
            metadata: {
              lastUpdated: Date.now(),
              updateCount: 0,
            },
          })),
        },
      })

      // Create subforms and fields
      const subforms = []
      const fields = []

      for (let i = 0; i < 100; i++) {
        const subform = form.getSubForm(`counters.${i}`)
        subforms.push(subform)

        const valueField = subform.defineField({ path: 'value' })
        fields.push(valueField)
      }

      const startTime = performance.now()

      // Simulate frequent updates
      for (let update = 0; update < 100; update++) {
        for (let i = 0; i < 100; i++) {
          fields[i].setValue(update * i)
        }
        await nextTick()
      }

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(10000) // 10 seconds

      // Verify final values
      for (let i = 0; i < 100; i++) {
        expect(fields[i].value.value).toBe(99 * i)
      }
    })

    it('should handle nested reactivity updates efficiently', async () => {
      const form = useForm({
        initialData: {
          tree: {
            level1: Array.from({ length: 10 }, (_, i) => ({
              id: i,
              level2: Array.from({ length: 10 }, (_, j) => ({
                id: j,
                value: i * 10 + j,
              })),
            })),
          },
        },
      })

      const level1Forms = []
      const level2Forms = []
      const valueFields = []

      // Create nested subforms
      for (let i = 0; i < 10; i++) {
        const level1Form = form.getSubForm(`tree.level1.${i}`)
        level1Forms.push(level1Form)

        for (let j = 0; j < 10; j++) {
          const level2Form = level1Form.getSubForm(`level2.${j}`)
          level2Forms.push(level2Form)

          const valueField = level2Form.defineField({ path: 'value' })
          valueFields.push(valueField)
        }
      }

      const startTime = performance.now()

      // Update all nested values
      for (let i = 0; i < 100; i++) {
        valueFields[i].setValue(i * 1000)
      }

      await nextTick()

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // 1 second

      // Verify updates propagated correctly
      for (let i = 0; i < 100; i++) {
        expect(valueFields[i].value.value).toBe(i * 1000)
      }
    })
  })

  describe('State Computation Performance', () => {
    it('should compute state efficiently for large forms', async () => {
      const form = useForm({
        initialData: {
          items: Array.from({ length: 500 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            enabled: i % 2 === 0,
          })),
        },
      })

      const subforms = []
      const nameFields = []

      // Create subforms and fields
      for (let i = 0; i < 500; i++) {
        const subform = form.getSubForm(`items.${i}`)
        subforms.push(subform)

        const nameField = subform.defineField({ path: 'name' })
        nameFields.push(nameField)
      }

      const startTime = performance.now()

      // Trigger state computation by checking dirty state
      let dirtyCount = 0
      for (let i = 0; i < 500; i++) {
        if (subforms[i].isDirty.value) {
          dirtyCount++
        }
      }

      // Make changes to trigger dirty state
      for (let i = 0; i < 250; i++) {
        nameFields[i].setValue(`Modified Item ${i}`)
      }

      await nextTick()

      // Check dirty state again
      dirtyCount = 0
      for (let i = 0; i < 500; i++) {
        if (subforms[i].isDirty.value) {
          dirtyCount++
        }
      }

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // 1 second
      expect(dirtyCount).toBe(250) // Half should be dirty
    })

    it('should handle touched state computation efficiently', async () => {
      const form = useForm({
        initialData: {
          fields: Array.from({ length: 300 }, (_, i) => ({
            id: i,
            value: `Value ${i}`,
          })),
        },
      })

      const subforms = []
      const valueFields = []

      // Create subforms and fields
      for (let i = 0; i < 300; i++) {
        const subform = form.getSubForm(`fields.${i}`)
        subforms.push(subform)

        const valueField = subform.defineField({ path: 'value' })
        valueFields.push(valueField)
      }

      const startTime = performance.now()

      // Touch fields gradually
      for (let i = 0; i < 150; i++) {
        valueFields[i].onBlur()
      }

      await nextTick()

      // Check touched state
      let touchedCount = 0
      for (let i = 0; i < 300; i++) {
        if (subforms[i].isTouched.value) {
          touchedCount++
        }
      }

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // 1 second
      expect(touchedCount).toBe(150) // Half should be touched
    })
  })

  describe('Validation Performance', () => {
    it('should handle schema validation efficiently on large datasets', async () => {
      const form = useForm({
        initialData: {
          records: Array.from({ length: 300 }, (_, i) => ({
            id: i,
            name: i < 150 ? `Record ${i}` : '', // Half invalid
            email: i < 150 ? `record${i}@example.com` : 'invalid',
          })),
        },
      })

      // Add validation to all subforms
      for (let i = 0; i < 300; i++) {
        const recordForm = form.getSubForm(`records.${i}`, {
          schema: z.object({
            name: z.string().min(1, 'Name required'),
            email: z.string().email('Invalid email'),
          }),
        })
      }

      const startTime = performance.now()

      const result = await form.validateForm()

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(3000) // 3 seconds
      expect(result.isValid).toBe(false)

      // Should have validation errors for invalid records
      const errorCount = Object.keys(result.errors.propertyErrors).length
      expect(errorCount).toBeGreaterThan(150)
    })

    it('should handle validation function performance', async () => {
      const form = useForm({
        initialData: {
          users: Array.from({ length: 200 }, (_, i) => ({
            id: i,
            username: `user${i}`,
            permissions: Array.from({ length: 10 }, (_, j) => `perm${j}`),
          })),
        },
      })

      // Add complex validation functions
      for (let i = 0; i < 200; i++) {
        const userForm = form.getSubForm(`users.${i}`, {
          validateFn: async (data) => {
            // Simulate complex validation logic
            const hasValidPermissions = data.permissions.length >= 5
            const hasValidUsername = data.username.length >= 4

            await new Promise(resolve => setTimeout(resolve, 1)) // Simulate async operation

            return {
              isValid: hasValidPermissions && hasValidUsername,
              errors: {
                general: [],
                propertyErrors: {
                  permissions: hasValidPermissions ? [] : ['Need at least 5 permissions'],
                  username: hasValidUsername ? [] : ['Username too short'],
                },
              },
            }
          },
        })
      }

      const startTime = performance.now()

      const result = await form.validateForm()

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(5000) // 5 seconds
      expect(result.isValid).toBe(true) // All should be valid based on our data
    })
  })
})

