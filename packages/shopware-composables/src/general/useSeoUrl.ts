import type { GenericRecord } from '#store-types'
import type { MaybeRef } from 'vue'
import { computed, unref } from 'vue'
import { cleanSeoUrl } from '../util/url'

interface SeoUrlEntity {
  extensions?: {
    novuSeoUrls?: GenericRecord
  }
}

export const getSeoUrl = <T extends SeoUrlEntity>(entity: T, languageId: string) => {
  const urls = entity.extensions?.novuSeoUrls as Record<string, string>
  const seoUrl = urls?.[languageId] ?? '#'

  return cleanSeoUrl(seoUrl)
}

export const useSeoUrl = <T extends SeoUrlEntity>(entity: MaybeRef<T>, languageId: MaybeRef<string>) => {
  return computed(() => getSeoUrl(unref(entity), unref(languageId)))
}
