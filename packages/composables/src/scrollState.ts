import {
  useWindowScroll,
  isClient,
} from '@vueuse/core'
import {
  watch,
  ref,
  type Ref,
} from 'vue'

export interface ScrollStateOptions {
  scrollThreshold?: number
  topThreshold?: number
}

export interface ScrollState {
  beginning: Ref<boolean>
  downward: Ref<boolean>
  y: Ref<number>
}

export default function useScrollState(options: ScrollStateOptions): ScrollState {
  const scrollThreshold = options.scrollThreshold ?? 50
  const topThreshold = options.topThreshold ?? 0

  const beginning = ref(true)
  const downward = ref(false)

  if (!isClient) {
    return ({
      beginning,
      downward,
      y: ref(0),
    })
  }

  const { y } = useWindowScroll()

  downward.value = y.value > 0

  const lastY = ref(0)
  watch([y], ([currentY]) => {
    if (currentY === 0) {
      beginning.value = true
      downward.value = false
      return
    }

    beginning.value = currentY < topThreshold!

    // add a threshold to prevent jitter
    if (Math.abs(currentY - lastY.value) < scrollThreshold!) return

    downward.value = currentY > lastY.value
    lastY.value = currentY
  })

  return {
    beginning,
    downward,
    y,
  }
}
