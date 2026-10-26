import { expect, it } from "vitest"
import { changePasswordSchema, loginSchema } from "@/features/auth/schemas/auth-schemas"
it.each(["abcdef", "abcdef1!", "Abcdef!", "Abcdef1", "Ab1!x"])("rejects invalid new password %s", newPassword => {
  expect(changePasswordSchema.safeParse({ currentPassword: "Admin123", newPassword, confirmPassword: newPassword }).success).toBe(false)
})
it("accepts a strong new password and keeps existing login passwords valid", () => {
  expect(changePasswordSchema.safeParse({ currentPassword: "Admin123", newPassword: "New123!", confirmPassword: "New123!" }).success).toBe(true)
  expect(loginSchema.safeParse({ email: "admin@example.com", password: "Admin123" }).success).toBe(true)
})
