import type { Schemas } from '#store-types'
import type { MaybeRef } from 'vue'
import { computed, reactive, toRef, unref, watch } from 'vue'

interface PaginationOptions {
  page?: MaybeRef<number>
  total?: MaybeRef<number>
  limit?: MaybeRef<number>
  totalCountMode?: MaybeRef<'exact' | 'next-pages' | 'none'>
}

export function usePagination(opts?: PaginationOptions) {
  const { total, limit, page, totalCountMode } = opts ?? {}

  const state = reactive({
    page: page ?? 1,
    total: total ?? 0,
    limit: limit,
    totalCountMode: totalCountMode,
  })

  const pageCount = computed(() => {
    if (state.limit === undefined) return 1
    return Math.max(1, Math.ceil(state.total / state.limit))
  })

  const privatePage = computed<number, number>({
    get() {
      return state.page
    },
    set(value) {
      // Clamp the value between 1 and totalPages
      state.page = Math.max(1, Math.min(unref(pageCount), value))
    },
  })

  watch(
    [() => unref(pageCount), () => state],
    ([newPageCount, newState]) => {
      // Reset the page to the last available page when the total pages change
      state.page = Math.min(newPageCount, state.page)
      state.total = newState.total ?? 0
      state.limit = newState.limit
    },
  )

  const isLastPage = computed(() => state.page === unref(pageCount))
  const isFirstPage = computed(() => state.page === 1)

  const queryOptions = computed(() => ({
    'p': state.page,
    'limit': state.limit,
    'total-count-mode': state.totalCountMode ?? 'none',
  }))

  const usePaginationSync = (data: MaybeRef<Schemas['EntitySearchResult'] | undefined>) => {
    watch(() => unref(data), (newData) => {
      if (!newData) return

      state.total = newData?.total ?? 0
      state.limit = newData?.limit ?? 0
    })
  }

  return {
    page: unref(privatePage),
    total: toRef(state, 'total'),
    limit: toRef(state, 'limit'),
    pageCount,
    isLastPage,
    isFirstPage,
    usePaginationSync,

    // This can be used to pass the pagination options directly to the query options
    queryOptions,
  }
}
