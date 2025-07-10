import { z } from 'zod'

const shopwareErrorSchema = z.object({
  status: z.string(),
  code: z.string(),
  title: z.string().optional(),
  detail: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
  source: z.object({
    pointer: z.string().optional(),
  }).optional(),
  trace: z.array(
    z.object({
      file: z.string(),
      line: z.number(),
      function: z.string(),
    }),
  ).optional(),
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
