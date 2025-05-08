import { inject, type InjectionKey, type Ref } from 'vue'

export type CollapseContext = {
  id: string
  toggle: Ref<boolean>
  ref: HTMLElement | Ref<HTMLElement | undefined> | undefined
}

export const collapseContextKey = Symbol('jk/collapseContext') as InjectionKey<CollapseContext>

export const useCollapseContext = () => inject(collapseContextKey)
