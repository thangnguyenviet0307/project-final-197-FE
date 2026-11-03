import { z } from 'zod';

export const saveInformationSchema = z
  .object({
    content: z.string().trim().max(30000),
    expectedVersion: z.number().int().nonnegative(),
    publish: z.boolean(),
  })
  .strict()
  .refine(
    (value) =>
      !value.publish ||
      value.content
        .replace(/<[^>]*>/g, '')
        .replace(/&(?:nbsp|#160|#xA0);/gi, ' ')
        .trim().length > 0,
    { message: 'Vui lòng nhập nội dung trước khi công bố.' }
  );
