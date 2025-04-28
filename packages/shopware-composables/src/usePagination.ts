import { computed, MaybeRef, ref, unref, watch } from 'vue'

interface PaginationOptions {
  total: MaybeRef<number>
  pageSize: MaybeRef<number>
}

export function usePagination({ total, pageSize }: PaginationOptions) {
  const privatePage = ref(1)

  const pageCount = computed(() => Math.max(1, Math.ceil(unref(total) / unref(pageSize))))

  const page = computed<number, number>({
    get() {
      return privatePage.value
    },
    set(value) {
      // Clamp the value between 1 and totalPages
      privatePage.value = Math.max(1, Math.min(unref(pageCount), value))
    },
  })

  watch(() => unref(pageCount), () => {
    // Reset the page to the last available page when the total pages change
    privatePage.value = Math.min(unref(pageCount), privatePage.value)
  })

  const isLastPage = computed(() => unref(page) === unref(pageCount))
  const isFirstPage = computed(() => unref(page) === 1)

  // This may seem counter-intuitive but goes sure that `pageSize` is always a ref
  const computedPageSize = computed(() => unref(pageSize))

  return {
    page,
    pageSize: computedPageSize,
    pageCount,
    isLastPage,
    isFirstPage,
  }
}
