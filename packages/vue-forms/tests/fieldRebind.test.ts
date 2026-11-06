/* eslint-disable vue/one-component-per-file */
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, unref, type App, type PropType } from 'vue'
import Field from '../src/components/Field.vue'
import FormPart from '../src/components/FormPart.vue'
import { useForm } from '../src/composables/useForm'
import type { FieldArray, Form } from '../src/types/form'

interface Worker {
  employee: string
}

interface WorkersData {
  workers: Worker[]
}

interface ProjectsData {
  projectWorkers: WorkersData[]
}

interface RowSlot {
  data: string
  setData: (value: string) => void
}

type WorkerArray = FieldArray<Worker, 'workers'>

interface Rendered {
  rows: () => string[]
  rowById: (id: string) => RowSlot
  array: () => WorkerArray
  unmount: () => void
}

let mountedApp: App | undefined

afterEach(() => {
  mountedApp?.unmount()
  mountedApp = undefined
})

function renderWorkerList(mountForm: (list: ReturnType<typeof defineWorkerList>) => () => ReturnType<typeof h>): Rendered {
  const slotsById = new Map<string, RowSlot>()
  let workerArray: WorkerArray | undefined
  const WorkerList = defineWorkerList({
    onRow: (id, slot) => slotsById.set(id, slot),
    onArray: (array) => {
      workerArray = array
    },
  })

  const container = document.createElement('div')
  const app = createApp(defineComponent({ setup: () => mountForm(WorkerList) }))
  app.mount(container)
  mountedApp = app

  return {
    rows: () => [...container.querySelectorAll('li')].map(row => row.textContent ?? ''),
    rowById: id => slotsById.get(id)!,
    array: () => workerArray!,
    unmount: () => {
      app.unmount()
      mountedApp = undefined
    },
  }
}

interface WorkerListHooks {
  onRow: (id: string, slot: RowSlot) => void
  onArray: (array: WorkerArray) => void
}

function defineWorkerList(hooks: WorkerListHooks) {
  return defineComponent({
    props: {
      form: {
        type: Object as PropType<Form<WorkersData>>,
        required: true,
      },
    },

    setup(props) {
      const array = props.form.getFieldArray('workers')
      hooks.onArray(array)

      return () => h('ul', array.items.value.map((item, index) => h(
        FormPart,
        {
          key: item.id,
          form: props.form,
          path: `workers.${index}`,
        },
        {
          default: ({ subform }: { subform: Form<Worker> }) => h(
            Field,
            {
              form: subform,
              path: 'employee',
            },
            {
              default: (slot: RowSlot) => {
                hooks.onRow(item.id, slot)

                return h('li', String(slot.data))
              },
            },
          ),
        },
      )))
    },
  })
}

function renderWorkers(initialData: WorkersData, formOptions: { keepValuesOnUnmount?: boolean } = {}) {
  const form = useForm({
    initialData,
    ...formOptions,
  })
  const rendered = renderWorkerList(WorkerList => () => h(WorkerList, { form }))

  return {
    form,
    ...rendered,
  }
}

function renderNestedWorkers(initialData: ProjectsData) {
  const form = useForm({ initialData })
  const rendered = renderWorkerList(WorkerList => () => h(
    FormPart,
    {
      form,
      path: 'projectWorkers.0',
    },
    { default: ({ subform }: { subform: Form<WorkersData> }) => h(WorkerList, { form: subform }) },
  ))

  return {
    form,
    ...rendered,
  }
}

function fieldPaths(form: Form<object>) {
  return form.fields.value.map(field => unref(field.path))
}

describe('Field rebinding inside field arrays keyed by item id', () => {
  it('shows and writes the shifted item after an earlier item is removed', async () => {
    const view = renderWorkers({ workers: [{ employee: 'OLD' }] })
    const pushed = view.array().push({ employee: '' })
    await nextTick()
    view.rowById(pushed.id).setData('NEW')
    const firstId = view.array().items.value[0]!.id

    view.array().remove(firstId)
    await nextTick()

    expect(view.rows()).toEqual(['NEW'])
    view.rowById(pushed.id).setData('NEW2')
    expect(view.form.data.value).toEqual({ workers: [{ employee: 'NEW2' }] })
  })

  it('keeps showing an item at its new index after an item is inserted before it', async () => {
    const view = renderWorkers({ workers: [{ employee: 'FIRST' }] })
    const firstId = view.array().items.value[0]!.id

    view.array().insert({ employee: 'INSERTED' }, 0)
    await nextTick()

    expect(view.rows()).toEqual(['INSERTED', 'FIRST'])
    view.rowById(firstId).setData('FIRST2')
    expect(view.form.data.value).toEqual({ workers: [{ employee: 'INSERTED' }, { employee: 'FIRST2' }] })
  })

  it('releases fields of vanished paths after a rebind and all fields on unmount', async () => {
    const view = renderWorkers({ workers: [{ employee: 'A' }, { employee: 'B' }] })
    const firstId = view.array().items.value[0]!.id

    view.array().remove(firstId)
    await nextTick()
    await nextTick()

    expect(fieldPaths(view.form)).not.toContain('workers.1.employee')
    expect(fieldPaths(view.form)).toContain('workers.0.employee')
    view.unmount()
    expect(fieldPaths(view.form)).toEqual([])
  })

  it('rebinds fields of a field array nested in a form part', async () => {
    const view = renderNestedWorkers({ projectWorkers: [{ workers: [{ employee: 'OLD' }] }] })
    const pushed = view.array().push({ employee: '' })
    await nextTick()
    view.rowById(pushed.id).setData('NEW')
    const firstId = view.array().items.value[0]!.id

    view.array().remove(firstId)
    await nextTick()

    expect(view.rows()).toEqual(['NEW'])
    view.rowById(pushed.id).setData('NEW2')
    expect(view.form.data.value).toEqual({ projectWorkers: [{ workers: [{ employee: 'NEW2' }] }] })
  })

  it('does not reset the item that shifts into a removed path when values are not kept on unmount', async () => {
    const view = renderWorkers({ workers: [{ employee: 'A' }, { employee: 'B' }] }, { keepValuesOnUnmount: false })
    const firstId = view.array().items.value[0]!.id

    view.array().remove(firstId)
    await nextTick()
    await nextTick()

    expect(view.rows()).toEqual(['B'])
    expect(view.form.data.value).toEqual({ workers: [{ employee: 'B' }] })
  })

  it('does not reset the shifted item when an item is inserted before it and values are not kept on unmount', async () => {
    const view = renderWorkers({ workers: [{ employee: 'FIRST' }] }, { keepValuesOnUnmount: false })

    view.array().insert({ employee: 'INSERTED' }, 0)
    await nextTick()
    await nextTick()

    expect(view.rows()).toEqual(['INSERTED', 'FIRST'])
    expect(view.form.data.value).toEqual({ workers: [{ employee: 'INSERTED' }, { employee: 'FIRST' }] })
  })
})
