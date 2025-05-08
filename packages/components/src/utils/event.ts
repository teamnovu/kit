export function listenOnce(
  element: Element,
  event: string,
  options?: boolean | AddEventListenerOptions,
) {
  let resolved = false

  return new Promise((res) => {
    function eventHandler(this: Element, e: Event) {
      // Ensure only one event can hit
      if (!resolved) res(e)
      resolved = true

      element.removeEventListener(event, eventHandler, {
        capture: typeof options === 'boolean' ? options : options?.capture,
      })
    }

    element.addEventListener(event, eventHandler, options)
  })
}

export async function raceEvents(
  element: Element,
  events: string[],
  options?: boolean | AddEventListenerOptions,
) {
  return Promise.race(
    events.map(event => listenOnce(element, event, options)),
  )
}
