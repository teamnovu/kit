import type { MaybeRef } from 'vue'

export const contextKeys = {
  all: () => ['context'] as const,
}

export const categoryKeys = {
  all: () => ['category'] as const,
  lists: () => [...categoryKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [
      ...categoryKeys.all(),
      'list',
      {
        body,
      },
    ] as const,
}

export const productKeys = {
  all: () => ['product'] as const,
  lists: () => [...productKeys.all(), 'list'] as const,
  list: (url: MaybeRef<string>, body: MaybeRef<unknown>) =>
    [
      ...productKeys.all(),
      'list',
      {
        url,
        body,
      },
    ] as const,
  details: () => [...productKeys.all(), 'detail'] as const,
  detail: (url: MaybeRef<string>, body: MaybeRef<unknown>) =>
    [
      ...productKeys.all(),
      'detail',
      {
        url,
        body,
      },
    ] as const,
}
