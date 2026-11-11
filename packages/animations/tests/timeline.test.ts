import { describe, expect, it } from 'vitest'
import { create, createTimeline, type Animation } from '../src'

const animation = (name: string, options: Partial<Animation> = {}): Animation => ({
  name,
  node: {
    id: `node-${name}`,
    element: document.createElement('div'),
    intersecting: false,
    animations: {},
    caches: {},
  },
  ...options,
})

const timelineOf = (...animations: Animation[]) => {
  const timeline = createTimeline()

  for (const anim of animations) {
    timeline.addAnimation(anim)
  }

  return timeline
}

describe('createTimeline', () => {
  it('starts the first animation without delay', () => {
    const first = animation('first', { duration: 1000 })

    expect(timelineOf(first).getDelay(first)).toBe(0)
  })

  it('starts each animation when the previous one ends', () => {
    const first = animation('first', { duration: 1000 })
    const second = animation('second', { duration: 500 })
    const third = animation('third', { duration: 200 })
    const timeline = timelineOf(first, second, third)

    expect(timeline.getDelay(second)).toBe(1000)
    expect(timeline.getDelay(third)).toBe(1500)
  })

  it('adds a += offset in seconds to the end of the previous animation', () => {
    const first = animation('first', { duration: 1000 })
    const second = animation('second', {
      duration: 500,
      timelineOffset: '+=0.25',
    })

    expect(timelineOf(first, second).getDelay(second)).toBe(1250)
  })

  it('anchors a < offset to the start of the previous animation', () => {
    const first = animation('first', { duration: 1000 })
    const second = animation('second', { duration: 500 })
    const third = animation('third', { timelineOffset: '<0.1' })
    const fourth = animation('fourth', { timelineOffset: '<+=0.1' })

    expect(timelineOf(first, second, third).getDelay(third)).toBe(1100)
    expect(timelineOf(first, second, fourth).getDelay(fourth)).toBe(1100)
  })

  it('anchors a > offset to the end of the previous animation', () => {
    const first = animation('first', { duration: 1000 })
    const second = animation('second', { duration: 500 })
    const third = animation('third', { timelineOffset: '>0.2' })

    expect(timelineOf(first, second, third).getDelay(third)).toBe(1700)
  })

  it('includes the stagger of all targets in the previous duration', () => {
    const targets = [document.createElement('div'), document.createElement('div'), document.createElement('div')]
    const first = animation('first', {
      duration: 1000,
      stagger: 100,
      target: targets,
    })
    const second = animation('second')

    expect(timelineOf(first, second).getDelay(second)).toBe(1200)
  })

  it('falls back to the default duration of the instance', () => {
    const { instance } = create({ defaultAnimationOptions: { duration: 400 } })
    const first = animation('first', { instance })
    const second = animation('second', { instance })

    expect(timelineOf(first, second).getDelay(second)).toBe(400)
  })

  it('forgets removed animations', () => {
    const first = animation('first', { duration: 1000 })
    const second = animation('second', { duration: 500 })
    const timeline = timelineOf(first, second)

    timeline.removeAnimation(first)

    expect(timeline.getDelay(second)).toBe(0)
  })
})
