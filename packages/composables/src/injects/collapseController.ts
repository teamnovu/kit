import { inject, type InjectionKey, type Ref } from 'vue'

export type CollapseController = {
  control: (id: string, open: Ref<boolean>) => () => void
}

export const collapseControllerKey = Symbol('jk/collapseController') as InjectionKey<CollapseController>

export const useCollapseController = () => inject(collapseControllerKey)
