import type { GenericRecord } from '#store-types'
import { computed, unref } from 'vue'
import { useReadContextQuery } from '../../query'

interface SeoUrlEntity {
  extensions?: {
    novuSeoUrls?: GenericRecord
  }
}

const getSeoUrl = <T extends SeoUrlEntity>(entity: T, languageId: string | string[]) => {
  const urls = entity?.extensions?.novuSeoUrls as Record<string, string>
  if (Array.isArray(languageId)) {
    const matchedId = languageId.find(id => !!urls?.[id])
    return matchedId ? urls?.[matchedId] ?? '' : ''
  }
  return urls?.[languageId] ?? ''
}

export const useSeoUrl = <T extends SeoUrlEntity>() => {
  const contextQuery = useReadContextQuery()
  const contextLanguageChain = computed(() => contextQuery.data?.value?.context?.languageIdChain ?? [])

  return (entity: T, languageId: string) => {
    const languageChain = [languageId, ...contextLanguageChain.value]
    return getSeoUrl(unref(entity), unref(languageChain))
  }
}
