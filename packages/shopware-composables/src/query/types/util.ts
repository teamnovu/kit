type DeepOverride<T, U> = {
  [K in keyof U]: K extends keyof T
    ? U[K] extends infer UK
      ? T[K] extends infer TK
        ? TK extends Record<string, unknown>
          ? UK extends Record<string, unknown>
            ? Override<T[K], U[K]>
            : U[K]
          : U[K]
        : U[K]
      : never
    : never
}

export type Override<T, U> = T extends Record<string, unknown>
  ? DeepOverride<T, U> & Omit<T, keyof U>
  : U

export type PartialProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
