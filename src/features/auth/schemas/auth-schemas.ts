import { z } from "zod"

const passwordField = (label: string) => z.string({ error: `Enter a ${label.toLowerCase()}.` }).min(6, `${label} must contain at least 6 characters.`).max(1024, `${label} cannot exceed 1024 characters.`)
export const passwordSchema = passwordField("Password")
export const newPasswordRequirements = "Use at least 6 characters, including an uppercase letter, a number, and a special character."
export const newPasswordSchema = passwordField("New password").regex(
  /^(?=[\s\S]*[A-Z])(?=[\s\S]*[0-9])(?=[\s\S]*[^A-Za-z0-9\s])[\s\S]{6,}$/,
  newPasswordRequirements,
)
export const loginSchema = z.object({
  email: z.string().trim().check(z.email("Invalid email address.")).toLowerCase(),
  password: passwordSchema,
})
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password.").max(1024, "Current password cannot exceed 1024 characters."),
  newPassword: newPasswordSchema,
  confirmPassword: z.string().min(1, "Confirm your new password."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"], error: "Passwords do not match.",
}).refine((data) => data.newPassword !== data.currentPassword, {
  path: ["newPassword"], error: "The new password must differ from your current password.",
})
