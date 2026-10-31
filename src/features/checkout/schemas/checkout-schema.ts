import { z } from "zod"
export const checkoutResultSchema = z.object({
  _id: z.string().regex(/^[a-f\d]{24}$/i),
  orderCode: z.string().regex(/^ORD-[A-HJ-NP-Z2-9]{6}$/),
  totalAmount: z.number().finite().nonnegative(),
  orderStatus: z.number().int().min(1).max(4),
})
export const checkoutRecipientSchema = z.object({
  recipientName: z.string().trim().min(1, "Vui lòng nhập tên người nhận.").max(100, "Tên người nhận tối đa 100 ký tự."),
  phone: z.string().trim().regex(/^(?:0|\+84)[0-9]{9}$/, "Vui lòng nhập số điện thoại Việt Nam hợp lệ."),
  provinceCode: z.string().regex(/^[1-9][0-9]*$/, "Vui lòng chọn tỉnh/thành phố."),
  districtCode: z.string().regex(/^[1-9][0-9]*$/, "Vui lòng chọn phường/xã hợp lệ."),
  wardCode: z.string().regex(/^[1-9][0-9]*$/, "Vui lòng chọn phường/xã."),
  street: z.string().trim().min(1, "Vui lòng nhập địa chỉ nhà.").max(255, "Địa chỉ tối đa 255 ký tự."),
  note: z.string().trim().max(1000, "Ghi chú tối đa 1000 ký tự."),
})
