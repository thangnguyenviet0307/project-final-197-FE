import { z } from "zod"

export const passwordSchema = z.string().min(6, "Password must contain at least 6 characters.").max(1024)
export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address.").toLowerCase(),
  password: passwordSchema,
})
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password.").max(1024),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm your new password."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"], message: "Passwords do not match.",
}).refine((data) => data.newPassword !== data.currentPassword, {
  path: ["newPassword"], message: "The new password must differ from your current password.",
})
