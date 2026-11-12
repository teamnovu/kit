import { enableAutoUnmount } from '@vue/test-utils'
import {
  afterEach, beforeEach, describe, expect, it,
} from 'vitest'
import { nextTick } from 'vue'
import { useScrollState, type ScrollStateOptions } from '../src'
import { scrollWindowTo, withSetup } from './helpers'

enableAutoUnmount(afterEach)

async function scrollTo(y: number) {
  scrollWindowTo(y)
  await nextTick()
}

const setupScrollState = (options: ScrollStateOptions = {}) => withSetup(() => useScrollState(options)).result

describe('useScrollState', () => {
  beforeEach(() => {
    document.documentElement.scrollTop = 0
  })

  it('starts at the beginning and not downward at the top of the page', () => {
    const { beginning, downward, y } = setupScrollState()

    expect(beginning.value).toBe(true)
    expect(downward.value).toBe(false)
    expect(y.value).toBe(0)
  })

  it('picks up an already scrolled page once mounted', async () => {
    document.documentElement.scrollTop = 300

    const { beginning, downward, y } = setupScrollState()
    await nextTick()

    expect(y.value).toBe(300)
    expect(downward.value).toBe(true)
    expect(beginning.value).toBe(false)
  })

  it('tracks the window scroll position in y', async () => {
    const { y } = setupScrollState()

    await scrollTo(120)

    expect(y.value).toBe(120)
  })

  it('detects scrolling down and up', async () => {
    const { beginning, downward } = setupScrollState()

    await scrollTo(100)
    expect(downward.value).toBe(true)
    expect(beginning.value).toBe(false)

    await scrollTo(40)
    expect(downward.value).toBe(false)
    expect(beginning.value).toBe(false)
  })

  it('ignores changes smaller than the default scrollThreshold of 50', async () => {
    const { downward } = setupScrollState()

    await scrollTo(30)
    expect(downward.value).toBe(false)

    await scrollTo(60)
    expect(downward.value).toBe(true)

    await scrollTo(20)
    expect(downward.value).toBe(true)

    await scrollTo(9)
    expect(downward.value).toBe(false)
  })

  it('uses a custom scrollThreshold', async () => {
    const { downward } = setupScrollState({ scrollThreshold: 0 })

    await scrollTo(10)
    expect(downward.value).toBe(true)

    await scrollTo(5)
    expect(downward.value).toBe(false)
  })

  it('resets to the beginning and not downward at y = 0', async () => {
    const { beginning, downward } = setupScrollState()

    await scrollTo(200)
    expect(beginning.value).toBe(false)
    expect(downward.value).toBe(true)

    await scrollTo(0)
    expect(beginning.value).toBe(true)
    expect(downward.value).toBe(false)
  })

  it('stays at the beginning while y is below the topThreshold', async () => {
    const { beginning } = setupScrollState({ topThreshold: 100 })

    await scrollTo(60)
    expect(beginning.value).toBe(true)

    await scrollTo(100)
    expect(beginning.value).toBe(false)

    await scrollTo(99)
    expect(beginning.value).toBe(true)
  })
})
