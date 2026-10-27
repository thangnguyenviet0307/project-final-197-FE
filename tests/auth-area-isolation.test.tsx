import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { AxiosHeaders } from "axios"
import { QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { configureAuthArea, getAuthArea, useAuthStore } from "@/stores/auth.store"
import { api, authApi, clearAuth, refreshAccessToken } from "@/services/api"
import { initializeSession, login, logout } from "@/features/auth/services/auth.service"
import { queryClient } from "@/services/query-client"
import { useAuthSession } from "@/features/auth/hooks/use-auth-session"
import { LoginForm1 } from "@/pages/auth/sign-in/components/login-form-1"
import { CustomerAuthForm } from "@/features/auth/components/customer-auth-form"
import type { User } from "@/features/auth/types/auth"

const admin: User = { id: "admin", email: "admin@example.com", name: "Admin", firstName: "Admin", lastName: "", role: "admin", mustChangePassword: false }
const customer: User = { ...admin, id: "customer", email: "buyer@example.com", accountType: "customer" as const, role: undefined }
const adapters = { api: api.defaults.adapter, auth: authApi.defaults.adapter }
beforeEach(() => { localStorage.clear(); configureAuthArea("admin"); clearAuth() })
afterEach(() => { api.defaults.adapter = adapters.api; authApi.defaults.adapter = adapters.auth; configureAuthArea("admin"); clearAuth(); localStorage.clear() })

it("keeps markers, login and logout independent across admin and storefront", async () => {
  useAuthStore.getState().setSession(admin, { accessToken: "admin-access" })
  const adminMarker = localStorage.getItem("admin-auth")
  configureAuthArea("storefront")
  expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, user: null, accessToken: null, hasSession: false })
  useAuthStore.getState().setSession(customer, { accessToken: "customer-access" })
  expect(localStorage.getItem("admin-auth")).toBe(adminMarker)
  expect(localStorage.getItem("customer-auth")).not.toContain("customer-access")
  clearAuth()
  expect(localStorage.getItem("admin-auth")).toBe(adminMarker)
  configureAuthArea("admin")
  expect(getAuthArea()).toBe("admin")
  expect(useAuthStore.getState()).toMatchObject({ hasSession: true, accessToken: null, user: null })
  authApi.defaults.adapter = async config => {
    expect(config.headers.get("X-Login-Area")).toBe("admin")
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "", data: { data: { accessToken: "restored-admin" } } }
  }
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "", data: { data: admin } })
  await initializeSession()
  expect(useAuthStore.getState()).toMatchObject({ user: { id: "admin" }, accessToken: "restored-admin", isAuthenticated: true })
})

it("customer login/logout HTTP calls never replace the persisted admin identity", async () => {
  useAuthStore.getState().setSession(admin, { accessToken: "admin-access" })
  const adminMarker = localStorage.getItem("admin-auth")
  configureAuthArea("storefront")
  authApi.defaults.adapter = async config => {
    expect(config.url).toBe("/customer-auth/login")
    expect(config.headers.get("X-Login-Area")).toBe("storefront")
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "", data: { data: { user: customer, accessToken: "buyer-access" } } }
  }
  await login({ email: customer.email, password: "Customer123" }, true)
  api.defaults.adapter = async config => {
    expect(config.url).toBe("/customer-auth/logout")
    expect(config.headers.get("X-Login-Area")).toBe("storefront")
    expect(config.headers.get("Authorization")).toBe("Bearer buyer-access")
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {} }
  }
  await logout()
  expect(localStorage.getItem("admin-auth")).toBe(adminMarker)
  expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, hasSession: false })
})

it("does not publish an admin profile returned by a storefront bootstrap", async () => {
  useAuthStore.getState().setSession(admin, { accessToken: "admin-access" })
  const adminMarker = localStorage.getItem("admin-auth")
  configureAuthArea("storefront")
  useAuthStore.setState({ hasSession: true })
  authApi.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "", data: { data: { accessToken: "wrong-area-token" } } })
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "", data: { data: admin } })
  await initializeSession()
  expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, user: null, hasSession: false, accessToken: null })
  expect(localStorage.getItem("admin-auth")).toBe(adminMarker)
})

it("ignores late admin refresh responses after entering the customer area", async () => {
  useAuthStore.getState().setSession(admin, { accessToken: "old-admin" })
  let release!: () => void
  authApi.defaults.adapter = async config => {
    expect(config.headers.get("X-Login-Area")).toBe("admin")
    await new Promise<void>(resolve => { release = resolve })
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "", data: { data: { accessToken: "late-admin" } } }
  }
  const pending = refreshAccessToken()
  await vi.waitFor(() => expect(release).toBeDefined())
  configureAuthArea("storefront")
  useAuthStore.getState().setSession(customer, { accessToken: "customer-access" })
  release()
  await expect(pending).rejects.toThrow("Session changed")
  expect(useAuthStore.getState()).toMatchObject({ user: { id: "customer" }, accessToken: "customer-access" })
})

it("does not reload or replace an admin session when a customer tab changes its marker", () => {
  useAuthStore.getState().setSession(admin, { accessToken: "admin-access" })
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "", data: { data: admin } })
  function Session() { useAuthSession(); return <p>Admin session</p> }
  const reloadError = vi.spyOn(console, "error").mockImplementation(() => {})
  render(<Session />)
  window.dispatchEvent(new StorageEvent("storage", { key: "customer-auth", newValue: JSON.stringify({ state: { hasSession: true } }) }))
  expect(reloadError).not.toHaveBeenCalled()
  expect(useAuthStore.getState().accessToken).toBe("admin-access")
  reloadError.mockRestore()
})

it.each([false, true])("starts with empty login fields and disables autofill (storefront=%s)", storefront => {
  render(<QueryClientProvider client={queryClient}><MemoryRouter>{storefront ? <CustomerAuthForm /> : <LoginForm1 />}</MemoryRouter></QueryClientProvider>)
  for (const label of ["Email", "Mật khẩu"]) {
    const input = screen.getByLabelText(label)
    expect(input).toHaveProperty("value", "")
    expect(input.getAttribute("autocomplete")).toBe("off")
    expect(input).toHaveProperty("readOnly", true)
    expect(input.getAttribute("name")).toBe(`${storefront ? "customer" : "admin"}-sign-in-${label === "Email" ? "email" : "password"}`)
  }
  expect(screen.getByRole("button", { name: "Đăng nhập" }).closest("form")?.getAttribute("autocomplete")).toBe("off")
})

it.each([false, true])("only direct interaction unlocks login fields; tab changes retain the user's draft (storefront=%s)", storefront => {
  render(<QueryClientProvider client={queryClient}><MemoryRouter>{storefront ? <CustomerAuthForm /> : <LoginForm1 />}</MemoryRouter></QueryClientProvider>)
  const email = screen.getByLabelText("Email")
  const password = screen.getByLabelText("Mật khẩu")
  fireEvent.focus(email)
  expect(email).toHaveProperty("readOnly", true)
  fireEvent.pointerDown(email)
  expect(email).toHaveProperty("readOnly", false)
  fireEvent.change(email, { target: { value: "my-draft@example.com" } })
  expect(password).toHaveProperty("readOnly", true)
  fireEvent.keyDown(password, { key: "P" })
  expect(password).toHaveProperty("readOnly", false)
  fireEvent.change(password, { target: { value: "MyDraft123" } })
  fireEvent.blur(window)
  expect(email).toHaveProperty("readOnly", true)
  expect(password).toHaveProperty("readOnly", true)
  expect(email).toHaveProperty("value", "my-draft@example.com")
  expect(password).toHaveProperty("value", "MyDraft123")
})
