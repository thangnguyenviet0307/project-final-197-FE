import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios"
import { afterEach, beforeEach, expect, it } from "vitest"
import { authApi, clearAuth, refreshAccessToken } from "@/services/api"
import { configureAuthArea, useAuthStore } from "@/stores/auth.store"

const originalAdapter = authApi.defaults.adapter
const response = (config: InternalAxiosRequestConfig, data: unknown, status = 200) => ({ config, data, status, statusText: "", headers: new AxiosHeaders() })
const failure = (config: InternalAxiosRequestConfig, status: number, code: string) => new AxiosError("Refresh failed", "ERR_BAD_REQUEST", config, undefined, response(config, { code }, status))
beforeEach(() => {
  configureAuthArea("storefront")
  useAuthStore.getState().setSession({ id: "customer", name: "Buyer", firstName: "Buyer", lastName: "", email: "buyer@example.com", accountType: "customer", mustChangePassword: false }, { accessToken: "old-access" })
})
afterEach(() => {
  authApi.defaults.adapter = originalAdapter
  clearAuth()
  configureAuthArea("admin")
})
it("recovers a customer rotation conflict using the current cookie without clearing the session", async () => {
  let calls = 0
  authApi.defaults.adapter = async config => {
    expect(config.url).toBe("/customer-auth/refresh")
    expect(config.headers.get("X-Login-Area")).toBe("storefront")
    expect(config.withCredentials).toBe(true)
    expect(JSON.parse(config.data)).toEqual({})
    if (++calls === 1) throw failure(config, 409, "AUTH_REFRESH_CONFLICT")
    return response(config, { data: { accessToken: "new-customer-access" } })
  }
  await expect(refreshAccessToken()).resolves.toBe("new-customer-access")
  expect(calls).toBe(2)
  expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: true, hasSession: true })
})
it("limits conflict recovery to one retry and keeps repeated conflicts retryable", async () => {
  let calls = 0
  authApi.defaults.adapter = async config => { calls++; throw failure(config, 409, "AUTH_REFRESH_CONFLICT") }
  await expect(refreshAccessToken()).rejects.toBeDefined()
  expect(calls).toBe(2)
  expect(useAuthStore.getState().hasSession).toBe(true)
})
it("does not retry a revoked or reused customer token", async () => {
  let calls = 0
  authApi.defaults.adapter = async config => { calls++; throw failure(config, 401, "AUTH_REFRESH_REVOKED") }
  await expect(refreshAccessToken()).rejects.toBeDefined()
  expect(calls).toBe(1)
  expect(useAuthStore.getState().hasSession).toBe(false)
})
