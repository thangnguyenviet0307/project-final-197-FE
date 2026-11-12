import { z } from 'zod';
export const chatInputSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập câu hỏi.')
  .max(2000, 'Câu hỏi tối đa 2000 ký tự.');
export const socketEventSchema = z.object({
  type: z.string(),
  requestId: z.string().optional(),
  data: z.unknown().optional(),
});
export const chatErrorSchema = z.object({
  code: z.string().max(80).optional(),
  retryable: z.boolean().optional(),
  status: z.enum(['cancelled', 'failed']).optional(),
  message: z.string().trim().min(1).max(500).optional(),
});
export const completedSchema = z.object({
  answer: z.string(),
  status: z.literal('completed'),
  sources: z
    .array(
      z.object({
        key: z.string(),
        title: z.string(),
        href: z.string().regex(/^\/(?!\/)/),
      })
    )
    .default([]),
  products: z
    .array(
      z.object({
        id: z.string(),
        slug: z.string(),
        name: z.string(),
        price: z.number(),
        available: z.boolean(),
        thumbnail: z.string().nullable(),
        brand: z.string(),
        category: z.string(),
        description: z.string(),
      })
    )
    .default([]),
});
export const cancelResultSchema = completedSchema.pick({
  answer: true, sources: true,
}).extend({
  requestId: z.string(),
  status: z.enum(['completed', 'cancelled', 'failed']),
});
