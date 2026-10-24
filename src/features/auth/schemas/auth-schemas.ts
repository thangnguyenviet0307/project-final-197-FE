import { z } from "zod"

const passwordField = (label: string) => z.string({ error: `Enter a ${label.toLowerCase()}.` }).min(6, `${label} must contain at least 6 characters.`).max(1024, `${label} cannot exceed 1024 characters.`)
export const passwordSchema = passwordField("Password")
export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address.").toLowerCase(),
  password: passwordSchema,
})
export const customerRegistrationSchema = loginSchema.extend({
  firstName: z.string().trim().min(1, "Vui lòng nhập tên.").max(100, "Tên tối đa 100 ký tự."),
  lastName: z.string().trim().min(1, "Vui lòng nhập họ.").max(100, "Họ tối đa 100 ký tự."),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"], message: "Mật khẩu xác nhận không khớp.",
})
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password.").max(1024, "Current password cannot exceed 1024 characters."),
  newPassword: passwordField("New password"),
  confirmPassword: z.string().min(1, "Confirm your new password."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"], message: "Passwords do not match.",
}).refine((data) => data.newPassword !== data.currentPassword, {
  path: ["newPassword"], message: "The new password must differ from your current password.",
})
