import { expect, it, vi } from "vitest"
it("a fresh storefront tab never hydrates or migrates the admin storage key", async () => {
  const adminMarker = JSON.stringify({ version: 1, state: { hasSession: true, sessionId: "older-admin-marker" } })
  localStorage.setItem("admin-auth", adminMarker)
  localStorage.setItem("customer-auth", JSON.stringify({ version: 2, state: { hasSession: true, sessionId: "buyer-marker" } }))
  vi.resetModules()
  const { configureAuthArea, useAuthStore } = await import("@/stores/auth.store")
  expect(localStorage.getItem("admin-auth")).toBe(adminMarker)
  configureAuthArea("storefront")
  expect(useAuthStore.getState()).toMatchObject({ hasSession: true, sessionId: "buyer-marker", accessToken: null })
  expect(localStorage.getItem("admin-auth")).toBe(adminMarker)
  localStorage.clear()
})
