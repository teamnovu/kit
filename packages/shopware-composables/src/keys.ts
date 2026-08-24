import type { MaybeRef } from 'vue'

export const shopwareKeys = {
  all: () => ['shopware'] as const,
}

export const contextKeys = {
  all: () => [...shopwareKeys.all(), 'context'] as const,
}

export const languageKey = {
  all: () => [...shopwareKeys.all(), 'language'] as const,
}

export const categoryKeys = {
  all: () => [...shopwareKeys.all(), 'category'] as const,
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
  all: () => [...shopwareKeys.all(), 'navigation'] as const,
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
  all: () => [...shopwareKeys.all(), 'product'] as const,
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
  detail: (productId: MaybeRef<string>, body: MaybeRef<unknown>) =>
    [
      ...productKeys.details(),
      productId,
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
  searchSuggest: (body: MaybeRef<unknown>) =>
    [
      ...productKeys.all(),
      'searchSuggest',
      {
        body,
      },
    ] as const,
}

export const cartKeys = {
  get: () => [...shopwareKeys.all(), 'cart'] as const,
}

export const customerKeys = {
  all: () => [...shopwareKeys.all(), 'customer'] as const,
  detail: (body: MaybeRef<unknown>) => [...customerKeys.all(), { body }] as const,
  imitateLogin: (body: MaybeRef<unknown>) => [...customerKeys.all(), 'imitateLogin', { body }] as const,
}

export const addressKeys = {
  all: () => [...shopwareKeys.all(), 'address'] as const,
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
  all: () => [...shopwareKeys.all(), 'shippingMethod'] as const,
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
  all: () => [...shopwareKeys.all(), 'paymentMethod'] as const,
  lists: () => [...paymentKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [
      ...paymentKeys.lists(),
      {
        body,
      },
    ] as const,
}

export const orderKeys = {
  all: () => [...shopwareKeys.all(), 'order'] as const,
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
  all: () => [...shopwareKeys.all(), 'seoUrl'] as const,
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
  all: () => [...shopwareKeys.all(), 'salutation'] as const,
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
  all: () => [...shopwareKeys.all(), 'country'] as const,
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
