import type { GenericRecord } from '#store-types'
import type { MaybeRef } from 'vue'
import { computed, unref } from 'vue'

interface SeoUrlEntity {
  extensions?: {
    novuSeoUrls?: GenericRecord
  }
}

export const getSeoUrl = <T extends SeoUrlEntity>(entity: T, languageId: string) => {
  const urls = entity.extensions?.novuSeoUrls as Record<string, string>
  return urls?.[languageId] ?? ''
}

export const useSeoUrl = <T extends SeoUrlEntity>(entity: MaybeRef<T>, languageId: MaybeRef<string>) => {
  return computed(() => getSeoUrl(unref(entity), unref(languageId)))
}
