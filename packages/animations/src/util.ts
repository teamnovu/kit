import { Animation } from './types'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function throttleFn<Fn extends Function>(
  handler: Fn,
  timeout: number = 0,
) {
  if (typeof handler !== 'function') {
    throw new Error(
      'Throttle handler argument is incorrect. Must be a function.',
    )
  }

  let timeoutTime: unknown | undefined

  return (...args: any[]) => {
    if (timeoutTime) return
    timeoutTime = setTimeout(() => {
      timeoutTime = undefined
      handler(...args)
    }, timeout)
  }
}

export function animationTargets(animation: Animation): HTMLElement[] {
  const { node } = animation

  if (typeof animation.target === 'string') {
    const root = animation.target.trim().startsWith('&')
      ? node.element
      : document
    const target = animation.target.trim().replace(/^&/, '')
    return [...root.querySelectorAll(target)] as HTMLElement[]
  }
  if (Array.isArray(animation.target)) {
    return animation.target
  }

  if (animation.target instanceof HTMLElement) {
    return [animation.target]
  }

  return [node.element]
}

export function parseCSSDuration(duration?: string) {
  if (!duration) return 0

  const value = parseFloat(duration)
  if (duration.includes('s')) {
    return value * 1000
  }

  return value
}

export function parseDuration(duration?: string | number) {
  return typeof duration === 'number' ? duration : parseCSSDuration(duration)
}
