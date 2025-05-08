import { Timeline } from './timeline'

export type ScrollContainer = HTMLElement | Window

export type Threshold = number | [number, number, number, number]

export interface AnimationOptions {
  easing?: string
  duration?: number | string
  delay?: number | string
  cssVars?: Record<string, string | number>
  repeatAnimation?: boolean
  stagger?: number
  target?: HTMLElement[] | HTMLElement | string
  timeline?: Timeline
  timelineOffset?: string
}

export interface Animation extends AnimationOptions {
  name: string
  classes?: Record<string, string>

  node: Node

  instance?: Instance
  initialized?: boolean
  scrollContainer?: string | ScrollContainer | (() => ScrollContainer)
}

export interface Node {
  id: string
  element: HTMLElement
  intersecting: boolean
  animations: Record<string, Animation>
  caches: {
    appliedClasses?: string[]
  }
}

export interface Context {
  scrollContainer?: ScrollContainer
  scrollDistance: {
    x: number
    y: number
  }
  defaultAnimationOptions: AnimationOptions
  nodes: Record<string, Node>
  classes: Record<string, string>
  threshold: Threshold | ((node: Node) => Threshold)
  destroyers: Record<string, Array<() => void>>
}

export interface Instance {
  context: Context
  isStarted: () => boolean
  start: (scrollContainer?: ScrollContainer) => () => void
  addAnimation: (node: Node, animation: Animation) => void
  removeNode: (node: Node) => void
  removeAnimation: (node: Node, animation: Animation) => void
  removeAnimations: (node: Node) => void
  stop: () => void
  addNode: (node: Node) => void
  applyAnimations: (node: Node) => void
}

export interface Options {
  target?: HTMLElement
  defaultAnimationOptions?: AnimationOptions
  classes?: Record<string, string>
  threshold?: Threshold | ((node: Node) => Threshold)
}

export interface Offset {
  x: number
  y: number
}

export interface Rect {
  top: number
  bottom: number
  left: number
  right: number
  height: number
  width: number
}
