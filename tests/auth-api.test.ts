import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { api, authApi, clearAuth, refreshAccessToken } from "@/services/api"
import { initializeSession, login, logout, changePassword } from "@/features/auth/services/auth.service"
import { useAuthStore } from "@/stores/auth.store"
import { queryClient } from "@/services/query-client"
import type { User } from "@/features/auth/types/auth"

const user: User = { id: "a", name: "Test User", firstName: "Test", lastName: "User", email: "test@example.com", role: "staff", mustChangePassword: false }
const oldTokens = { accessToken: "old-access", refreshToken: "old-refresh" }
const newTokens = { accessToken: "new-access", refreshToken: "new-refresh" }
const response = (config: InternalAxiosRequestConfig, data: unknown, status = 200) => ({ data, status, statusText: "", headers: new AxiosHeaders(), config })
function unauthorized(config: InternalAxiosRequestConfig, status = 401) {
  return new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, response(config, { message: "Unauthorized" }, status))
}
const apiAdapter = api.defaults.adapter
const authAdapter = authApi.defaults.adapter

beforeEach(() => {
  clearAuth()
  useAuthStore.getState().setSession(user, oldTokens)
})
afterEach(() => {
  api.defaults.adapter = apiAdapter
  authApi.defaults.adapter = authAdapter
  clearAuth()
})

describe("auth API/session", () => {
  it("accepts legacy login responses without firstName/lastName and displays the email", async () => {
    authApi.defaults.adapter = async (config) => response(config, { data: {
      ...newTokens, user: { id: "legacy", email: "legacy@example.com", role: "admin" },
    } })
    const result = await login({ email: "legacy@example.com", password: "Password123" })
    expect(result).toMatchObject({ firstName: "", lastName: "", name: "legacy@example.com", role: "admin" })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it("restores legacy sessions with missing names and uses an existing display name", async () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true })
    api.defaults.adapter = async (config) => response(config, { data: {
      id: "legacy", email: "legacy@example.com", role: "staff", name: "Legacy User", firstName: null,
    } })
    await initializeSession()
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true, isLoading: false, user: { name: "Legacy User", firstName: "", lastName: "" },
    })
  })

  it("still rejects missing roles instead of granting access to malformed users", async () => {
    clearAuth()
    authApi.defaults.adapter = async (config) => response(config, { data: {
      ...newTokens, user: { id: "legacy", email: "legacy@example.com" },
    } })
    await expect(login({ email: "legacy@example.com", password: "Password123" })).rejects.toBeDefined()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it("shares one refresh for concurrent 401s and rotates both tokens before retry", async () => {
    const refresh = vi.fn(async (config: InternalAxiosRequestConfig) => response(config, { data: newTokens }))
    authApi.defaults.adapter = refresh
    const sent: string[] = []
    api.defaults.adapter = async (config) => {
      sent.push(String(config.headers.get("Authorization")))
      if (config.headers.get("Authorization") === "Bearer old-access") throw unauthorized(config)
      return response(config, { ok: true })
    }
    await Promise.all([api.get("/one"), api.get("/two"), api.get("/three")])
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(JSON.parse(refresh.mock.calls[0][0].data)).toEqual({})
    expect(refresh.mock.calls[0][0].headers.get("X-Auth-Transport")).toBe("cookie")
    expect(sent.filter((token) => token === "Bearer new-access")).toHaveLength(3)
    expect(useAuthStore.getState()).toMatchObject(newTokens)
  })

  it("does not refresh a late 401 again after another request rotated the token", async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    authApi.defaults.adapter = vi.fn(async (config) => response(config, { data: newTokens }))
    api.defaults.adapter = async (config) => {
      if (config.headers.get("Authorization") === "Bearer old-access") {
        if (config.url === "/late") await gate
        throw unauthorized(config)
      }
      return response(config, {})
    }
    const late = api.get("/late")
    await api.get("/fast")
    release()
    await late
    expect(authApi.defaults.adapter).toHaveBeenCalledTimes(1)
  })

  it("clears state and query cache if refresh is rejected", async () => {
    queryClient.setQueryData(["private"], { secret: true })
    api.defaults.adapter = async (config) => { throw unauthorized(config) }
    authApi.defaults.adapter = async (config) => { throw unauthorized(config) }
    await expect(api.get("/private")).rejects.toBeDefined()
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
    expect(queryClient.getQueryData(["private"])).toBeUndefined()
  })

  it("retries at most once if the new access token is also rejected", async () => {
    api.defaults.adapter = vi.fn(async (config) => { throw unauthorized(config) })
    authApi.defaults.adapter = vi.fn(async (config) => response(config, { data: newTokens }))
    await expect(api.get("/private")).rejects.toBeDefined()
    expect(api.defaults.adapter).toHaveBeenCalledTimes(2)
    expect(authApi.defaults.adapter).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it("never refreshes a wrong-password login or a forbidden API", async () => {
    authApi.defaults.adapter = vi.fn(async (config) => { throw unauthorized(config) })
    await expect(login({ email: user.email, password: "wrong-pass" })).rejects.toBeDefined()
    expect(authApi.defaults.adapter).toHaveBeenCalledTimes(1)
    api.defaults.adapter = async (config) => { throw unauthorized(config, 403) }
    await expect(api.get("/users")).rejects.toBeDefined()
    expect(authApi.defaults.adapter).toHaveBeenCalledTimes(1)
  })

  it("does not resurrect a logged-out session when refresh finishes late", async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    authApi.defaults.adapter = async (config) => { await gate; return response(config, { data: newTokens }) }
    const pending = refreshAccessToken()
    clearAuth()
    release()
    await expect(pending).rejects.toThrow("Session changed")
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it("restores fresh user/role from /me and deduplicates initialization", async () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true })
    api.defaults.adapter = vi.fn(async (config) => response(config, { data: { ...user, role: "admin" } }))
    await Promise.all([initializeSession(), initializeSession()])
    expect(api.defaults.adapter).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState()).toMatchObject({ isLoading: false, isAuthenticated: true, user: { role: "admin", name: "Test User" } })
  })

  it("persists only a session marker and never credentials or a cached role", () => {
    const persisted = JSON.parse(localStorage.getItem("admin-auth") || "{}")
    expect(persisted.state).toEqual({ hasSession: true, sessionId: expect.any(String) })
  })

  it("keeps an unavailable server distinct from an invalid session so retry remains possible", async () => {
    api.defaults.adapter = async () => { throw new AxiosError("Network Error", "ERR_NETWORK") }
    await initializeSession()
    expect(useAuthStore.getState().initializationError).toBeTruthy()
    expect(useAuthStore.getState().accessToken).toBe("old-access")
  })

  it("always clears local credentials even when logout cannot reach the server", async () => {
    api.defaults.adapter = async () => { throw new AxiosError("Network Error", "ERR_NETWORK") }
    await expect(logout()).rejects.toBeDefined()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it("clears all credentials after changing password and sends no confirmation field", async () => {
    api.defaults.adapter = vi.fn(async (config) => {
      expect(config.url).toBe("/auth/change-password")
      expect(JSON.parse(config.data)).toEqual({ currentPassword: "old-pass", newPassword: "new-pass" })
      return response(config, {})
    })
    await changePassword({ currentPassword: "old-pass", newPassword: "new-pass" })
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

it("restores an access token from HttpOnly refresh transport after reload", async () => {
  useAuthStore.setState({ accessToken: null, refreshToken: null, hasSession: true, isAuthenticated: false });
  authApi.defaults.adapter = async config => {
    expect(JSON.parse(config.data)).toEqual({});
    expect(config.headers.get("X-Auth-Transport")).toBe("cookie");
    return response(config, { data: { accessToken: "cookie-access" } });
  };
  api.defaults.adapter = async config => response(config, { data: user });
  await initializeSession();
  expect(useAuthStore.getState()).toMatchObject({ accessToken: "cookie-access", refreshToken: null, isAuthenticated: true });
  expect(localStorage.getItem("admin-auth")).not.toContain("cookie-access");
});

it("keeps cookie-session initialization retryable during a network outage", async () => {
  useAuthStore.setState({ accessToken: null, refreshToken: null, hasSession: true, isAuthenticated: false });
  authApi.defaults.adapter = async () => { throw new AxiosError("Network Error", "ERR_NETWORK") };
  await initializeSession();
  expect(useAuthStore.getState()).toMatchObject({ hasSession: true, isLoading: false, isAuthenticated: false });
  expect(useAuthStore.getState().initializationError).toBeTruthy();
});
