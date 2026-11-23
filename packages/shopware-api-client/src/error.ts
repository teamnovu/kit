import * as z from 'zod/mini'

const shopwareErrorSchema = z.object({
  status: z.string(),
  code: z.string(),
  title: z.optional(z.string()),
  detail: z.optional(z.string()),
  meta: z.optional(z.record(z.string(), z.unknown())),
  source: z.optional(z.object({
    pointer: z.optional(z.string()),
  })),
  trace: z.optional(z.array(
    z.object({
      file: z.string(),
      line: z.number(),
      function: z.string(),
    }),
  )),
})

const shopwareErrorResponseSchema = z.object({
  errors: z.array(shopwareErrorSchema),
})

export type ShopwareError = z.infer<typeof shopwareErrorSchema>

export class ShopwareApiError extends Error {
  errors: ShopwareError[]

  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: unknown,
  ) {
    super(message)
    this.name = 'ShopwareApiError'

    const { success, data } = shopwareErrorResponseSchema.safeParse(response)

    this.errors = success ? data.errors : []
  }
}
