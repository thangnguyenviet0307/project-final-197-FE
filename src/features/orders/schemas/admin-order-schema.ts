import { z } from "zod"

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Mã tham chiếu không hợp lệ.")
export const adminOrderAddressSchema = z.object({
  street: z.string().trim().min(1, "Vui lòng nhập địa chỉ đường.").max(255, "Địa chỉ đường tối đa 255 ký tự."),
  city: z.string().trim().min(1, "Vui lòng nhập thành phố.").max(50, "Thành phố tối đa 50 ký tự."),
  state: z.string().trim().min(1, "Vui lòng nhập tỉnh/khu vực.").max(50, "Tỉnh/khu vực tối đa 50 ký tự."),
})
export const adminOrderSchema = adminOrderAddressSchema.extend({
  customerId: objectId,
  orderNote: z.string().trim().max(2000),
  paymentType: z.literal(1),
  orderItems: z.array(z.object({ productId: objectId, variantId: objectId.optional(), quantity: z.number().int().positive() })).min(1),
})
export type AdminOrderInput = z.infer<typeof adminOrderSchema>
