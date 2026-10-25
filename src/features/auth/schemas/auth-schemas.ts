import { z } from "zod"

const passwordField = (label: string) => z.string({ error: `Vui lòng nhập ${label.toLowerCase()}.` }).min(6, `${label} phải có ít nhất 6 ký tự.`).max(1024, `${label} không được vượt quá 1024 ký tự.`)
export const passwordSchema = passwordField("Mật khẩu")
export const loginSchema = z.object({
  email: z.string().trim().email("Địa chỉ email không hợp lệ.").toLowerCase(),
  password: passwordSchema,
})
export const customerRegistrationSchema = loginSchema.extend({
  firstName: z.string().trim().min(1, "Vui lòng nhập tên.").max(50, "Tên tối đa 50 ký tự."),
  lastName: z.string().trim().min(1, "Vui lòng nhập họ.").max(50, "Họ tối đa 50 ký tự."),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"], message: "Mật khẩu xác nhận không khớp.",
})
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại.").max(1024, "Mật khẩu hiện tại không được vượt quá 1024 ký tự."),
  newPassword: passwordField("Mật khẩu mới"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"], message: "Mật khẩu xác nhận không khớp.",
}).refine((data) => data.newPassword !== data.currentPassword, {
  path: ["newPassword"], message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
})
