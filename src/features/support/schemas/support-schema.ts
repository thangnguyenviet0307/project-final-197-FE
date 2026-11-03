import { z } from "zod"

export const policyContentSchema = z.object({
  warranty: z.string().trim().max(30000), returns: z.string().trim().max(30000),
  shipping: z.string().trim().max(30000), payment: z.string().trim().max(30000), support: z.string().trim().max(30000),
  privacy: z.string().trim().max(30000),
}).strict()
export const savePolicySchema = z.object({ content: policyContentSchema, expectedVersion: z.number().int().nonnegative(), publish: z.boolean() }).strict()
  .refine(value => !value.publish || Object.values(value.content).every(text => text.replace(/<[^>]*>/g, "").replace(/&(?:nbsp|#160|#xA0);/gi, " ").trim().length > 0), { message: "Vui lòng điền đủ các mục trước khi công bố chính sách." })
export const warrantyIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/)
export const warrantyStatuses = ["submitted", "reviewing", "repairing", "resolved", "rejected"] as const
export const createWarrantySchema = z.object({
  requestId: z.uuid(), orderId: warrantyIdSchema, itemIndex: z.number().int().min(0).max(9999),
  description: z.string().trim().min(10, "Vui lòng mô tả lỗi ít nhất 10 ký tự.").max(3000),
}).strict()
export const updateWarrantySchema = z.object({
  expectedVersion: z.number().int().nonnegative(), status: z.enum(warrantyStatuses),
  note: z.string().trim().min(1, "Vui lòng nhập phản hồi cho khách hàng.").max(1000),
}).strict()
export function validateWarrantyImage(file: File): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Chọn ảnh JPG, PNG hoặc WebP."
  if (file.size > 5 * 1024 * 1024) return "Mỗi ảnh không được vượt quá 5 MB."
  return null
}
