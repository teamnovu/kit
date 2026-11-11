import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import { throttleFn } from '../src/util'

describe('throttleFn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls the handler once the timeout has passed', () => {
    const handler = vi.fn()
    const throttled = throttleFn(handler, 16)

    throttled('a')

    expect(handler).not.toHaveBeenCalled()

    vi.advanceTimersByTime(16)

    expect(handler).toHaveBeenCalledExactlyOnceWith('a')
  })

  it('drops calls while a call is pending', () => {
    const handler = vi.fn()
    const throttled = throttleFn(handler, 16)

    throttled()
    throttled()
    throttled()
    vi.advanceTimersByTime(16)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('calls the handler again after the timeout has passed', () => {
    const handler = vi.fn()
    const throttled = throttleFn(handler, 16)

    throttled()
    vi.advanceTimersByTime(16)
    throttled()
    vi.advanceTimersByTime(16)

    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('rejects a handler that is not a function', () => {
    expect(() => throttleFn('handler' as unknown as () => void)).toThrow('Throttle handler argument is incorrect. Must be a function.')
  })
})
