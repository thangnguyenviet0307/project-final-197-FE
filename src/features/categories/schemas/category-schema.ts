import { z } from "zod";
import { imageUrlSchema } from "@/utils/image-url";

export const categorySchema = z.object({
  icon: imageUrlSchema.optional(),
  name: z.string().trim().min(1, "Category name is required."),
  description: z.string().trim().optional(),
  parent: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;

