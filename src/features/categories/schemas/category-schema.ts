import { DESCRIPTION_MAX_LENGTH } from '@/constants/text-limits';
import { z } from 'zod';
import { imageUrlSchema } from '@/utils/image-url';

export const categorySchema = z.object({
  icon: imageUrlSchema.optional(),
  name: z.string().trim().min(1, 'Vui lòng nhập tên danh mục.'),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH).optional(),
  parent: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;
