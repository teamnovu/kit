import { describe, expect, it, vi } from 'vitest'
import { createClient } from './helpers'

describe('client events', () => {
  it('calls function and handleEvent listeners with the event and its detail', () => {
    const client = createClient()
    const listener = vi.fn()
    const handleEvent = vi.fn()
    client.on('custom', listener)
    client.on('custom', { handleEvent })

    client.emit('custom', { value: 1 })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0]).toMatchObject({
      type: 'custom',
      detail: { value: 1 },
    })
    expect(handleEvent.mock.calls[0][0]).toBe(listener.mock.calls[0][0])
  })

  it('calls listeners in registration order', () => {
    const client = createClient()
    const calls: string[] = []
    client.on('custom', () => calls.push('first'))
    client.on('custom', () => calls.push('second'))

    client.emit('custom')

    expect(calls).toEqual(['first', 'second'])
  })

  it('removes listeners with off', () => {
    const client = createClient()
    const listener = vi.fn()
    client.on('custom', listener)

    client.off('custom', listener)
    client.emit('custom')

    expect(listener).not.toHaveBeenCalled()
  })

  it('calls once listeners only for the first event', () => {
    const client = createClient()
    const viaOnce = vi.fn()
    const viaOption = vi.fn()
    client.once('custom', viaOnce)
    client.on('custom', viaOption, { once: true })

    client.emit('custom', 1)
    client.emit('custom', 2)

    expect(viaOnce).toHaveBeenCalledTimes(1)
    expect(viaOnce.mock.calls[0][0].detail).toBe(1)
    expect(viaOption).toHaveBeenCalledTimes(1)
  })

  it('removes a listener when its signal aborts', () => {
    const client = createClient()
    const listener = vi.fn()
    const controller = new AbortController()
    client.on('custom', listener, { signal: controller.signal })

    client.emit('custom')
    controller.abort()
    client.emit('custom')

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('never registers a listener whose signal is already aborted', () => {
    const client = createClient()
    const listener = vi.fn()

    client.on('custom', listener, { signal: AbortSignal.abort() })
    client.emit('custom')

    expect(listener).not.toHaveBeenCalled()
  })

  it('stops calling further listeners once propagation is stopped', () => {
    const client = createClient()
    const second = vi.fn()
    client.on('custom', event => event.stopPropagation())
    client.on('custom', second)

    client.emit('custom')

    expect(second).not.toHaveBeenCalled()
  })

  it('lists and removes registered event types', () => {
    const client = createClient()
    const listener = vi.fn()
    client.on('first', listener)
    client.on('second', listener)

    expect(client.getEventTypes()).toEqual(expect.arrayContaining(['first', 'second']))

    client.removeAllListeners('first')
    client.emit('first')
    client.emit('second')
    expect(listener).toHaveBeenCalledTimes(1)

    client.removeAllListeners()
    client.emit('second')
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
