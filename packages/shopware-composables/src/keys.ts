import type { MaybeRef } from 'vue'

export const contextKeys = {
  all: () => ['context'] as const,
}

export const languageKey = {
  all: () => ['language'] as const,
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
export const navigationKeys = {
  all: () => ['navigation'] as const,
  lists: () => [...navigationKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [
      ...navigationKeys.all(),
      'list',
      {
        body,
      },
    ] as const,
  details: () => [...navigationKeys.all(), 'detail'] as const,
  detail: (activeId: MaybeRef<string>, rootId: MaybeRef<string>, body: MaybeRef<unknown>) =>
    [
      ...navigationKeys.all(),
      'detail',
      {
        activeId,
        rootId,
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
  customDetail: (url: MaybeRef<string>, body: MaybeRef<unknown>) =>
    [
      ...productKeys.details(),
      'custom',
      {
        url,
        body,
      },
    ] as const,
  headlessDetail: (body: MaybeRef<unknown>) =>
    [
      ...productKeys.details(),
      {
        body,
      },
    ] as const,
  detail: (body: MaybeRef<unknown>) =>
    [
      ...productKeys.details(),
      {
        body,
      },
    ] as const,
  search: (body: MaybeRef<unknown>) =>
    [
      ...productKeys.all(),
      'search',
      {
        body,
      },
    ] as const,
}

export const cartKeys = {
  get: () => ['cart'] as const,
}

export const customerKeys = {
  all: () => ['customer'] as const,
  detail: (body: MaybeRef<unknown>) => ['customer', { body }] as const,
  imitateLogin: (body: MaybeRef<unknown>) => ['customer', 'imitateLogin', { body }] as const,
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
  details: () => [...addressKeys.all(), 'detail'] as const,
  detail: (addressId: string, body?: MaybeRef<unknown>) => [...addressKeys.details(), addressId, ...(body ? [{ body }] : [])] as const,
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

export const seoUrlKeys = {
  all: () => ['seoUrl'] as const,
  lists: () => [...seoUrlKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [
      ...seoUrlKeys.all(),
      'list',
      {
        body,
      },
    ] as const,
}

export const salutationKeys = {
  all: () => ['salutation'] as const,
  lists: () => [...salutationKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [
      ...salutationKeys.all(),
      'list',
      {
        body,
      },
    ] as const,
}

export const countryKeys = {
  all: () => ['country'] as const,
  lists: () => [...countryKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [
      ...countryKeys.all(),
      'list',
      {
        body,
      },
    ] as const,
}
