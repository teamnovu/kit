import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useForm } from '../src/composables/useForm'

describe('initialData overrides — subfield propagation', () => {
  it('default merge: subfields see ancestor override and stay clean', () => {
    const form = useForm({
      initialData: {
        user: {
          name: 'A',
          email: 'x@x',
        },
      },
    })

    const userField = form.getField('user')
    const nameField = form.getField('user.name')
    const emailField = form.getField('user.email')

    userField.setInitialData({
      name: 'B',
      email: 'x@x',
    })

    expect(nameField.initialValue.value).toBe('B')
    expect(nameField.dirty.value).toBe(false)

    // email was not touched by the override → falls through to external
    expect(emailField.initialValue.value).toBe('x@x')
    expect(emailField.dirty.value).toBe(false)
  })

  it('partial merge at parent path leaves untouched siblings on external value', () => {
    const form = useForm({
      initialData: {
        user: {
          name: 'A',
          email: 'x@x',
        },
      },
    })

    const userField = form.getField('user')
    const emailField = form.getField('user.email')

    // Override only `name` — `email` should fall through to the external value
    userField.setInitialData({ name: 'B' } as {
      name: string
      email: string
    })

    expect(form.getField('user.name').initialValue.value).toBe('B')
    expect(emailField.initialValue.value).toBe('x@x')
  })

  it('replace flag drops sibling keys at the overridden path', () => {
    const form = useForm({
      initialData: {
        user: {
          name: 'A',
          email: 'x@x',
        },
      },
    })

    const userField = form.getField('user')
    const emailField = form.getField('user.email')

    userField.setInitialData(
      { name: 'B' } as {
        name: string
        email: string
      },
      { replace: true },
    )

    expect(form.getField('user.name').initialValue.value).toBe('B')
    expect(emailField.initialValue.value).toBeUndefined()
  })

  it('external initialData reassignment wipes overrides', () => {
    const initialData = ref({
      user: {
        name: 'A',
        email: 'x@x',
      },
    })

    const form = useForm({ initialData })
    const userField = form.getField('user')
    const nameField = form.getField('user.name')

    userField.setInitialData({
      name: 'B',
      email: 'x@x',
    })
    expect(nameField.initialValue.value).toBe('B')

    initialData.value = {
      user: {
        name: 'C',
        email: 'y@y',
      },
    }

    expect(nameField.initialValue.value).toBe('C')
    expect(form.getField('user.email').initialValue.value).toBe('y@y')
  })

  it('overriding an ancestor drops a descendant override (cascade)', () => {
    const form = useForm({
      initialData: {
        user: {
          name: 'A',
          email: 'x@x',
        },
      },
    })

    const userField = form.getField('user')
    const nameField = form.getField('user.name')

    nameField.setInitialData('X')
    expect(nameField.initialValue.value).toBe('X')

    // Writing to the ancestor invalidates the descendant override
    userField.setInitialData({
      name: 'B',
      email: 'x@x',
    })
    expect(nameField.initialValue.value).toBe('B')
  })

  it('sibling-prefix paths are not dropped by cascade', () => {
    type Data = {
      users1: { name: string }
      users10: { name: string }
    }
    const form = useForm<Data>({
      initialData: {
        users1: { name: 'one' },
        users10: { name: 'ten' },
      },
    })

    const users1Field = form.getField('users1')
    const users10Field = form.getField('users10')

    users1Field.setInitialData({ name: 'one-override' })
    expect(form.getField('users1.name').initialValue.value).toBe('one-override')

    // Writing to a sibling whose path is a prefix-collision string must not
    // touch the existing override on `users1`.
    users10Field.setInitialData({ name: 'ten-override' })

    expect(form.getField('users1.name').initialValue.value).toBe('one-override')
    expect(form.getField('users10.name').initialValue.value).toBe('ten-override')
  })

  it('clean parent override pushes value into subfield data', () => {
    const form = useForm({
      initialData: {
        user: {
          name: 'A',
          email: 'x@x',
        },
      },
    })

    const userField = form.getField('user')
    const nameField = form.getField('user.name')

    userField.setInitialData({
      name: 'B',
      email: 'x@x',
    })

    expect(nameField.data.value).toBe('B')
    expect(form.isDirty.value).toBe(false)
  })

  it('dirty subfield keeps its value when an ancestor override is set', () => {
    const form = useForm({
      initialData: {
        user: {
          name: 'A',
          email: 'x@x',
        },
      },
    })

    const userField = form.getField('user')
    const nameField = form.getField('user.name')

    nameField.setData('Z')
    expect(nameField.dirty.value).toBe(true)

    userField.setInitialData({
      name: 'B',
      email: 'x@x',
    })

    // Field is dirty → data is preserved, but baseline still tracks the
    // override (so dirty stays true because Z ≠ B).
    expect(nameField.data.value).toBe('Z')
    expect(nameField.initialValue.value).toBe('B')
    expect(nameField.dirty.value).toBe(true)
  })

  it('form.reset() rebuilds data from the merged tree (overrides survive)', () => {
    const form = useForm({
      initialData: {
        user: {
          name: 'A',
          email: 'x@x',
        },
      },
    })

    const userField = form.getField('user')
    form.getField('user.name')
    form.getField('user.email')

    userField.setInitialData({ name: 'B' } as {
      name: string
      email: string
    })

    // Mutate the data away from the override, then reset
    form.data.value.user.name = 'changed'
    form.reset()

    expect(form.data.value.user.name).toBe('B')
    expect(form.data.value.user.email).toBe('x@x')
    expect(form.isDirty.value).toBe(false)
  })
})
