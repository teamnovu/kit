import { MaybeRef } from 'vue'

export const contextKeys = {
  all: () => ['context'] as const,
}

export const productKeys = {
  all: () => ['product'] as const,
  lists: () => [...productKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [...productKeys.all(), 'list', { body }] as const,
}
