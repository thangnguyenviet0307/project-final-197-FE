import { z } from "zod"
import { profileSchema } from "@/features/profile/schemas/profile-schema"

export const customerProfileSchema = profileSchema.pick({ firstName: true, lastName: true, phone: true }).extend({
  birthDate: z.string().refine(value => {
    if (!value) return true
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T00:00:00Z`)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && date.getTime() <= Date.now()
  }, "Ngày sinh không hợp lệ hoặc nằm trong tương lai."),
  gender: z.enum(["", "male", "female", "other"]),
})

export const shippingAddressSchema = z.object({
  recipientName: z.string().trim().min(1, "Vui lòng nhập tên người nhận.").max(100, "Tên người nhận tối đa 100 ký tự."),
  email: z.string().trim().email("Email không hợp lệ.").toLowerCase(),
  province: z.string().trim().min(1, "Vui lòng nhập tỉnh/thành phố.").max(100),
  ward: z.string().trim().min(1, "Vui lòng nhập phường/xã.").max(100),
  street: z.string().trim().min(1, "Vui lòng nhập địa chỉ chi tiết.").max(255),
  deliveryTime: z.string().trim().max(255, "Thời gian giao hàng tối đa 255 ký tự."),
})
export type CustomerProfileValues = z.infer<typeof customerProfileSchema>
export type ShippingAddressValues = z.infer<typeof shippingAddressSchema>
