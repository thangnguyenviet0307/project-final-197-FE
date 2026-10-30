import { expect, it } from "vitest"
import { canManageUser, isAdministrator } from "@/features/auth/utils/roles"

it("gives Super Admin administrative controls while keeping Customer/Staff separate", () => {
  expect(isAdministrator("super_admin")).toBe(true)
  expect(isAdministrator("admin")).toBe(true)
  expect(isAdministrator("staff")).toBe(false)
  expect(isAdministrator(undefined)).toBe(false)
  expect(canManageUser("super_admin", "admin")).toBe(true)
  expect(canManageUser("super_admin", "staff")).toBe(true)
  expect(canManageUser("super_admin", "super_admin")).toBe(false)
  expect(canManageUser("admin", "admin")).toBe(false)
  expect(canManageUser("admin", "super_admin")).toBe(false)
  expect(canManageUser("admin", "staff")).toBe(true)
  expect(canManageUser("staff", "staff")).toBe(false)
})
