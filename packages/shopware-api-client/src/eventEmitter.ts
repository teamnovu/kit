interface EventListenerEntry {
  listener: EventListenerOrEventListenerObject
  options: AddEventListenerOptions
  signal?: AbortSignal
}

export class EventEmitter implements EventTarget {
  private listeners = new Map<string, EventListenerEntry[]>()

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (!listener) return

    const listenerOptions = this.normalizeOptions(options)
    const entry: EventListenerEntry = {
      listener,
      options: listenerOptions,
    }

    if (listenerOptions.signal) {
      if (listenerOptions.signal.aborted) return

      entry.signal = listenerOptions.signal
      listenerOptions.signal.addEventListener('abort', () => {
        this.removeEventListener(type, listener, options)
      }, { once: true })
    }

    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }

    this.listeners.get(type)!.push(entry)
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void {
    if (!listener) return

    const entries = this.listeners.get(type)
    if (!entries) return

    const listenerOptions = this.normalizeOptions(options)
    const index = entries.findIndex(entry =>
      entry.listener === listener
      && this.optionsMatch(entry.options, listenerOptions))

    if (index !== -1) {
      entries.splice(index, 1)
      if (entries.length === 0) {
        this.listeners.delete(type)
      }
    }
  }

  dispatchEvent(event: Event): boolean {
    const entries = this.listeners.get(event.type)
    if (!entries || entries.length === 0) return true

    const entriesCopy = [...entries]

    for (const entry of entriesCopy) {
      if (entry.signal?.aborted) continue

      try {
        if (typeof entry.listener === 'function') {
          entry.listener.call(this, event)
        } else {
          entry.listener.handleEvent(event)
        }
      } catch (error) {
        // In a real implementation, you might want to handle errors differently
        console.error('Error in event listener:', error)
      }

      // Remove if 'once' option was set
      if (entry.options.once) {
        this.removeEventListener(event.type, entry.listener, entry.options)
      }

      // Stop if event propagation was stopped
      if (event.cancelBubble) break
    }

    return !event.defaultPrevented
  }

  private normalizeOptions(
    options?: boolean | AddEventListenerOptions | EventListenerOptions,
  ): AddEventListenerOptions {
    if (typeof options === 'boolean') {
      return { capture: options }
    }
    return {
      capture: false,
      once: false,
      passive: false,
      ...options,
    }
  }

  private optionsMatch(a: AddEventListenerOptions, b: AddEventListenerOptions): boolean {
    return a.capture === b.capture
  }

  // Utility methods for easier usage
  on(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.addEventListener(type, listener, options)
  }

  off(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    this.removeEventListener(type, listener, options)
  }

  once(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    const onceOptions = typeof options === 'boolean'
      ? {
          capture: options,
          once: true,
        }
      : {
          ...options,
          once: true,
        }
    this.addEventListener(type, listener, onceOptions)
  }

  emit(type: string, detail?: unknown): boolean {
    const event = new CustomEvent(type, { detail })
    return this.dispatchEvent(event)
  }

  getEventTypes(): string[] {
    return Array.from(this.listeners.keys())
  }

  removeAllListeners(type?: string): void {
    if (type) {
      this.listeners.delete(type)
    } else {
      this.listeners.clear()
    }
  }
}
