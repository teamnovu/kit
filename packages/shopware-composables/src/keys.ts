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

export const cartKeys = {
  get: () => ['cart'] as const,
}

export const customerKeys = {
  get: () => ['customer'] as const,
}

export const addressKeys = {
  all: () => ['address'] as const,
  lists: () => [...addressKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [
      ...addressKeys.all(),
      'list',
      {
        body,
      },
    ] as const,
}

export const shippingKeys = {
  all: () => ['shippingMethod'] as const,
  lists: () => [...shippingKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [
      ...shippingKeys.all(),
      'list',
      {
        body,
      },
    ] as const,
}

export const paymentKeys = {
  all: () => ['paymentMethod'] as const,
  lists: () => [...paymentKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [
      ...paymentKeys.all(),
      'list',
      {
        body,
      },
    ] as const,
}

export const orderKeys = {
  all: () => ['order'] as const,
  lists: () => [...orderKeys.all(), 'list'] as const,
  details: () => [...orderKeys.all(), 'detail'] as const,
  detail: (body: MaybeRef<unknown>) =>
    [
      ...orderKeys.all(),
      'detail',
      {
        body,
      },
    ] as const,
}
