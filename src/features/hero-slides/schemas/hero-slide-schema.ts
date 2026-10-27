import { z } from "zod"
export const heroSlideSchema = z.object({
  category: z.string().regex(/^[a-f\d]{24}$/i, "Chọn danh mục hợp lệ."),
  title: z.string().trim().min(1, "Nhập tiêu đề.").max(200),
  description: z.string().trim().max(1000),
  imageUrl: z.union([z.string().trim().url().max(2048).regex(/^https?:\/\//i, "Chỉ dùng URL HTTP(S)."), z.literal("")]).transform(value => value || null),
  sortOrder: z.number().int().min(0).max(10000),
  isActive: z.boolean(),
})
