import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useForm } from '../src/composables/useForm'
import { HashStore, useFieldArray } from '../src/composables/useFieldArray'

describe('useFieldArray', () => {
  describe('HashStore', () => {
    it('should store and retrieve primitive values with identity hash', () => {
      const store = new HashStore<string[]>()

      store.set(5, ['id-1'])
      expect(store.has(5)).toBe(true)
      expect(store.get(5)).toEqual(['id-1'])

      store.set(10, ['id-2'])
      expect(store.get(10)).toEqual(['id-2'])
      expect(store.get(5)).toEqual(['id-1'])
    })

    it('should store objects by reference with identity hash', () => {
      const store = new HashStore<string[]>()
      const obj1 = {
        id: 1,
        name: 'A',
      }
      const obj2 = {
        id: 1,
        name: 'A',
      } // Same content, different reference

      store.set(obj1, ['uuid-1'])

      expect(store.has(obj1)).toBe(true)
      expect(store.has(obj2)).toBe(false)
      expect(store.get(obj1)).toEqual(['uuid-1'])
      expect(store.get(obj2)).toBeUndefined()
    })

    it('should use custom hash function for semantic equality', () => {
      const store = new HashStore<string[], { id: number }>(item => item.id)
      const obj1 = {
        id: 1,
        name: 'A',
      }
      const obj2 = {
        id: 1,
        name: 'B',
      } // Same ID, different name
      const obj3 = {
        id: 2,
        name: 'A',
      }

      store.set(obj1, ['uuid-1'])

      expect(store.has(obj2)).toBe(true)
      expect(store.get(obj2)).toEqual(['uuid-1'])
      expect(store.has(obj3)).toBe(false)
    })

    it('should overwrite value on subsequent set calls', () => {
      const store = new HashStore<string[]>()
      const item = { id: 1 }

      store.set(item, ['id-1'])
      expect(store.get(item)).toEqual(['id-1'])

      store.set(item, ['id-1', 'id-2'])
      expect(store.get(item)).toEqual(['id-1', 'id-2'])
    })
  })

  describe('Core Functionality', () => {
    it('should initialize with array data and generate IDs', () => {
      const form = useForm({
        initialData: {
          items: [
            {
              id: 1,
              name: 'Item 1',
            },
            {
              id: 2,
              name: 'Item 2',
            },
          ],
        },
      })
      const fieldArray = useFieldArray(form, 'items')

      expect(fieldArray.fields.value).toHaveLength(2)
      expect(fieldArray.fields.value[0]).toHaveProperty('id')
      expect(fieldArray.fields.value[0]).toHaveProperty('item')
      expect(fieldArray.fields.value[0].item).toEqual({
        id: 1,
        name: 'Item 1',
      })
      expect(typeof fieldArray.fields.value[0].id).toBe('string')
      expect(fieldArray.errors.value).toEqual([])
      expect(fieldArray.dirty.value).toBe(false)
    })

    it('should push new items to the array', async () => {
      const form = useForm({
        initialData: {
          items: [
            {
              id: 1,
              name: 'First',
            },
          ],
        },
      })
      const fieldArray = useFieldArray(form, 'items')

      expect(fieldArray.fields.value).toHaveLength(1)

      fieldArray.push({
        id: 2,
        name: 'Second',
      })
      await nextTick()

      expect(fieldArray.fields.value).toHaveLength(2)
      expect(fieldArray.fields.value[1].item).toEqual({
        id: 2,
        name: 'Second',
      })
      expect(fieldArray.dirty.value).toBe(true)
    })

    it('should remove item by reference', async () => {
      const form = useForm({
        initialData: {
          items: [
            {
              id: 1,
              name: 'Keep',
            },
            {
              id: 2,
              name: 'Remove',
            },
          ],
        },
      })
      const fieldArray = useFieldArray(form, 'items')
      const itemToRemove = fieldArray.fields.value[1].item

      fieldArray.remove(itemToRemove)
      await nextTick()

      expect(fieldArray.fields.value).toHaveLength(1)
      expect(fieldArray.fields.value[0].item.name).toBe('Keep')
      expect(fieldArray.dirty.value).toBe(true)
    })

    it('should remove item by index', async () => {
      const form = useForm({
        initialData: {
          items: [
            {
              id: 1,
              name: 'First',
            },
            {
              id: 2,
              name: 'Second',
            },
            {
              id: 3,
              name: 'Third',
            },
          ],
        },
      })
      const fieldArray = useFieldArray(form, 'items')

      fieldArray.removeByIndex(1)
      await nextTick()

      expect(fieldArray.fields.value).toHaveLength(2)
      expect(fieldArray.fields.value[0].item.name).toBe('First')
      expect(fieldArray.fields.value[1].item.name).toBe('Third')
    })
  })

  describe('ID Persistence', () => {
    it('should maintain IDs when items are reordered', async () => {
      const form = useForm({
        initialData: {
          items: [
            {
              id: 1,
              name: 'First',
            },
            {
              id: 2,
              name: 'Second',
            },
            {
              id: 3,
              name: 'Third',
            },
          ],
        },
      })
      const fieldArray = useFieldArray(form, 'items', {
        hashFn: (item: { id: number }) => item.id,
      })

      // Capture initial IDs
      const id1 = fieldArray.fields.value[0].id
      const id2 = fieldArray.fields.value[1].id
      const id3 = fieldArray.fields.value[2].id

      // Reverse the array
      const arrayField = form.getField('items')
      arrayField.setData([...arrayField.data.value].reverse())
      await nextTick()

      // Verify order changed but IDs followed the items
      expect(fieldArray.fields.value[0].item.name).toBe('Third')
      expect(fieldArray.fields.value[0].id).toBe(id3)
      expect(fieldArray.fields.value[1].item.name).toBe('Second')
      expect(fieldArray.fields.value[1].id).toBe(id2)
      expect(fieldArray.fields.value[2].item.name).toBe('First')
      expect(fieldArray.fields.value[2].id).toBe(id1)
    })

    it('should maintain IDs based on custom hash function', async () => {
      const form = useForm({
        initialData: {
          products: [
            {
              sku: 'ABC',
              name: 'Widget',
              price: 10,
            },
            {
              sku: 'DEF',
              name: 'Gadget',
              price: 20,
            },
          ],
        },
      })
      const fieldArray = useFieldArray(form, 'products', {
        hashFn: (item: { sku: string }) => item.sku,
      })

      const idABC = fieldArray.fields.value[0].id
      const idDEF = fieldArray.fields.value[1].id

      // Update price and swap order
      const arrayField = form.getField('products')
      arrayField.setData([
        {
          sku: 'DEF',
          name: 'Gadget',
          price: 25,
        },
        {
          sku: 'ABC',
          name: 'Widget',
          price: 15,
        },
      ])
      await nextTick()

      // IDs should persist because SKUs didn't change
      expect(fieldArray.fields.value[0].id).toBe(idDEF)
      expect(fieldArray.fields.value[1].id).toBe(idABC)

      // Change SKU - should get new ID
      arrayField.setData([
        {
          sku: 'XYZ',
          name: 'Widget',
          price: 15,
        },
        {
          sku: 'DEF',
          name: 'Gadget',
          price: 25,
        },
      ])
      await nextTick()

      expect(fieldArray.fields.value[0].id).not.toBe(idABC)
      expect(fieldArray.fields.value[1].id).toBe(idDEF)
    })

    it('should assign IDs in order for items with same hash', async () => {
      // When multiple items share the same hash, IDs are assigned in order
      // from the stored ID list. This means reordering items with same hash
      // will NOT preserve ID-to-item mapping (IDs follow position, not identity).
      const form = useForm({
        initialData: {
          items: [
            {
              type: 'tag',
              value: 'vue',
            },
            {
              type: 'tag',
              value: 'react',
            },
            {
              type: 'tag',
              value: 'svelte',
            },
          ],
        },
      })
      // Hash by type only - all items have same hash 'tag'
      const fieldArray = useFieldArray(form, 'items', {
        hashFn: (item: { type: string }) => item.type,
      })

      // All items get unique IDs despite same hash
      const [id1, id2, id3] = fieldArray.fields.value.map(f => f.id)
      expect(new Set([id1, id2, id3]).size).toBe(3)

      // Reorder: move last item to first position
      const arrayField = form.getField('items')
      arrayField.setData([
        {
          type: 'tag',
          value: 'svelte',
        },
        {
          type: 'tag',
          value: 'vue',
        },
        {
          type: 'tag',
          value: 'react',
        },
      ])
      await nextTick()

      // IDs are assigned in order from stored list, NOT following items
      // This is expected behavior with hash collisions
      expect(fieldArray.fields.value[0].id).toBe(id1) // svelte gets id1 (was vue's)
      expect(fieldArray.fields.value[1].id).toBe(id2) // vue gets id2 (was react's)
      expect(fieldArray.fields.value[2].id).toBe(id3) // react gets id3 (was svelte's)

      // The values confirm the reorder happened
      expect(fieldArray.fields.value[0].item.value).toBe('svelte')
      expect(fieldArray.fields.value[1].item.value).toBe('vue')
      expect(fieldArray.fields.value[2].item.value).toBe('react')
    })
  })

  describe('Form Integration', () => {
    it('should track dirty state correctly', async () => {
      const form = useForm({
        initialData: { items: [{ name: 'Item' }] },
      })
      const fieldArray = useFieldArray(form, 'items')

      expect(form.isDirty.value).toBe(false)
      expect(fieldArray.dirty.value).toBe(false)

      // Make a change
      fieldArray.push({ name: 'New Item' })
      await nextTick()

      expect(form.isDirty.value).toBe(true)
      expect(fieldArray.dirty.value).toBe(true)

      // Reset form
      form.reset()
      await nextTick()

      expect(form.isDirty.value).toBe(false)
      expect(fieldArray.dirty.value).toBe(false)
    })
  })
})
