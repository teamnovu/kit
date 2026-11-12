import { vi } from 'vitest'

export function useAnimationTimers() {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
      'Date',
    ],
  })
}

export function stubScrollHeight(element: Element, height: number) {
  Object.defineProperty(element, 'scrollHeight', {
    configurable: true,
    get: () => height,
  })
}

export function collectWarnings() {
  const warnings: string[] = []
  const consoleWarn = vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    warnings.push(args.map(String).join(' '))
  })

  return {
    warnings,
    warnHandler: (message: string) => {
      warnings.push(message)
    },
    restore: () => consoleWarn.mockRestore(),
  }
}
