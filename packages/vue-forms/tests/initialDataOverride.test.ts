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

  it('subtree scope: strict ancestor reads external baseline, override path and below read override', () => {
    const form = useForm({
      initialData: {
        outer: {
          inner: {
            name: 'A',
            email: 'x@x',
          },
        },
      },
    })

    const outerField = form.getField('outer')
    const innerField = form.getField('outer.inner')
    const nameField = form.getField('outer.inner.name')

    innerField.setInitialData(
      {
        name: 'B',
        email: 'x@x',
      },
      { scope: 'subtree' },
    )

    // Override path and descendants see the override.
    expect(innerField.initialValue.value).toEqual({
      name: 'B',
      email: 'x@x',
    })
    expect(nameField.initialValue.value).toBe('B')
    expect(nameField.dirty.value).toBe(false)

    // Strict ancestor (outer) keeps the external baseline. Data was pushed
    // into the inner subtree (the inner field was clean), so outer.data now
    // diverges from outer's external initial → dirty.
    expect(outerField.initialValue.value).toEqual({
      inner: {
        name: 'A',
        email: 'x@x',
      },
    })
    expect(outerField.dirty.value).toBe(true)
    expect(form.isDirty.value).toBe(true)
  })

  it('subtree scope on array index: array stays dirty, item subfields clean', () => {
    type Row = {
      name: string
      email: string
    }
    const form = useForm<{ rows: Row[] }>({
      initialData: {
        rows: [
          {
            name: 'A',
            email: 'a@a',
          },
        ],
      },
    })

    const arrayField = form.getField('rows')
    form.getField('rows.0.name')
    form.getField('rows.0.email')

    // Mimic a "push pristine" flow: push a new item, then anchor it.
    const newItem: Row = {
      name: 'B',
      email: 'b@b',
    }
    form.data.value.rows.push(newItem)

    // Register the new index's subfields so we can inspect them.
    const newName = form.getField('rows.1.name')
    const newEmail = form.getField('rows.1.email')
    const newRow = form.getField('rows.1')

    expect(arrayField.dirty.value).toBe(true) // length changed

    newRow.setInitialData(newItem, { scope: 'subtree' })

    // The whole new row's subtree reads from the anchor → all clean.
    expect(newName.initialValue.value).toBe('B')
    expect(newEmail.initialValue.value).toBe('b@b')
    expect(newName.dirty.value).toBe(false)
    expect(newEmail.dirty.value).toBe(false)
    expect(newRow.dirty.value).toBe(false)

    // The array field stays dirty: its baseline still has only the original
    // item (subtree override at rows.1 is invisible to rows).
    expect(arrayField.initialValue.value).toEqual([
      {
        name: 'A',
        email: 'a@a',
      },
    ])
    expect(arrayField.dirty.value).toBe(true)
    expect(form.isDirty.value).toBe(true)
  })

  it('subtree scope does not affect sibling subtrees', () => {
    type Data = {
      a: { v: string }
      b: { v: string }
    }
    const form = useForm<Data>({
      initialData: {
        a: { v: 'a' },
        b: { v: 'b' },
      },
    })

    const aField = form.getField('a')
    const bField = form.getField('b')

    aField.setInitialData({ v: 'A' }, { scope: 'subtree' })

    expect(form.getField('a.v').initialValue.value).toBe('A')
    expect(bField.initialValue.value).toEqual({ v: 'b' })
    expect(bField.dirty.value).toBe(false)
  })

  it('subtree scope: setInitialData on the same field is the natural read path', () => {
    // The field whose path equals the override path *does* read the override
    // (the rule is "skip subtree overrides strictly below the reading path").
    const form = useForm({
      initialData: { user: { name: 'A' } },
    })

    const userField = form.getField('user')
    userField.setInitialData({ name: 'B' }, { scope: 'subtree' })

    expect(userField.initialValue.value).toEqual({ name: 'B' })
    expect(userField.dirty.value).toBe(false)
  })

  it('mixed scopes: tree override at parent + subtree override at child', () => {
    const form = useForm({
      initialData: {
        user: {
          profile: {
            name: 'A',
            age: 1,
          },
          settings: { theme: 'light' },
        },
      },
    })

    const userField = form.getField('user')
    const profileField = form.getField('user.profile')
    const nameField = form.getField('user.profile.name')

    // Tree override at user: globally repoints baseline.
    userField.setInitialData(
      {
        profile: {
          name: 'B',
          age: 2,
        },
        settings: { theme: 'dark' },
      },
      { scope: 'tree' },
    )
    expect(userField.dirty.value).toBe(false)
    expect(profileField.initialValue.value).toEqual({
      name: 'B',
      age: 2,
    })

    // Subtree override deeper: should pin only its subtree, but since it lives
    // strictly below the user-tree override, user's view is unaffected.
    nameField.setInitialData('C', { scope: 'subtree' })

    // The leaf reads its own anchor.
    expect(nameField.initialValue.value).toBe('C')
    expect(nameField.dirty.value).toBe(false)

    // The profile field (ancestor of the subtree anchor, descendant of the
    // tree override) keeps its tree-override view: name still 'B'.
    expect(profileField.initialValue.value).toEqual({
      name: 'B',
      age: 2,
    })

    // The user field (further ancestor) still sees its tree override too.
    expect(userField.initialValue.value).toEqual({
      profile: {
        name: 'B',
        age: 2,
      },
      settings: { theme: 'dark' },
    })
  })

  it('subtree scope: external initialData reassignment still wipes it', () => {
    const initialData = ref({ user: { name: 'A' } })
    const form = useForm({ initialData })

    const userField = form.getField('user')
    userField.setInitialData({ name: 'B' }, { scope: 'subtree' })
    expect(userField.initialValue.value).toEqual({ name: 'B' })

    initialData.value = { user: { name: 'Z' } }
    expect(userField.initialValue.value).toEqual({ name: 'Z' })
  })

  it('subtree scope: cascade drops a deeper subtree anchor when ancestor is rewritten', () => {
    const form = useForm({
      initialData: { user: { name: 'A' } },
    })

    const userField = form.getField('user')
    const nameField = form.getField('user.name')

    nameField.setInitialData('X', { scope: 'subtree' })
    expect(nameField.initialValue.value).toBe('X')

    userField.setInitialData({ name: 'B' }, { scope: 'subtree' })
    expect(nameField.initialValue.value).toBe('B')
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
