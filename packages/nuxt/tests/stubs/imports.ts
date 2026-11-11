export function defineNuxtPlugin<T>(plugin: T) {
  return plugin
}

export function useRuntimeConfig(): { public: Record<string, unknown> } {
  return { public: {} }
}

export function useHeadSafe(_input: unknown) {}

export function inject<T>(_key: string): T | undefined {
  return undefined
}
