import { expect, it } from "vitest"
import { changePasswordSchema, loginSchema } from "@/features/auth/schemas/auth-schemas"

it.each(["Ab1!xy", "NewPassword123!"])("accepts a strong new password: %s", newPassword => {
  expect(changePasswordSchema.safeParse({ currentPassword: "Admin123", newPassword, confirmPassword: newPassword }).success).toBe(true)
})

it.each(["Ab1!x", "abcdef1!", "Abcdef!", "Abcdef1", "Abcd1 "])("rejects a new password missing required strength: %s", newPassword => {
  const result = changePasswordSchema.safeParse({ currentPassword: "Admin123", newPassword, confirmPassword: newPassword })
  expect(result.success).toBe(false)
  if (!result.success) expect(result.error.issues[0].path).toEqual(["newPassword"])
})

it.each(["Admin123", "Staff123"])("still allows demo passwords at login: %s", password => {
  expect(loginSchema.safeParse({ email: "demo@example.com", password }).success).toBe(true)
})

it("requires matching confirmation and a different new password", () => {
  expect(changePasswordSchema.safeParse({ currentPassword: "Admin123", newPassword: "New123!", confirmPassword: "Other123!" }).success).toBe(false)
  expect(changePasswordSchema.safeParse({ currentPassword: "New123!", newPassword: "New123!", confirmPassword: "New123!" }).success).toBe(false)
})
