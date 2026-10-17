import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { LoginForm1 } from "@/app/auth/sign-in/components/login-form-1"
import { ForgotPasswordForm1 } from "@/app/auth/forgot-password/components/forgot-password-form-1"
import { ProtectedRoute, PublicOnlyRoute } from "@/components/router/protected-route"
import { queryClient } from "@/lib/query-client"
import { authApi, clearAuth } from "@/services/api"

const originalAdapter = authApi.defaults.adapter
beforeEach(clearAuth)
afterEach(() => { authApi.defaults.adapter = originalAdapter; clearAuth() })

function Destination() {
  const location = useLocation()
  return <p>Destination {location.pathname}{location.search}</p>
}
function setup() {
  render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[{
    pathname: "/login", state: { from: { pathname: "/users", search: "?tab=all", hash: "" } },
  }]}><Routes>
    <Route element={<PublicOnlyRoute />}>
      <Route path="/login" element={<LoginForm1 />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm1 />} />
    </Route>
    <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
      <Route path="/users" element={<Destination />} />
      <Route path="/admin/dashboard" element={<Destination />} />
      <Route path="/change-password" element={<Destination />} />
    </Route>
  </Routes></MemoryRouter></QueryClientProvider>)
}
function submit(email = " TEST@example.com ", password = "Password123") {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } })
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } })
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
}

it("validates invalid email/password without sending an API request", async () => {
  authApi.defaults.adapter = vi.fn()
  setup(); submit("invalid", "123")
  expect(await screen.findByText("Invalid email address.")).toBeTruthy()
  expect(screen.getByText("Password must contain at least 6 characters.")).toBeTruthy()
  expect(authApi.defaults.adapter).not.toHaveBeenCalled()
})

it.each([
  ["", ""],
  ["invalid-email", "123"],
  ["random@example.com", "random-password"],
])("opens password recovery without submitting login for inputs %s", async (email, password) => {
  authApi.defaults.adapter = vi.fn()
  setup()
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } })
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } })
  const link = screen.getByRole("link", { name: "Forgot password?" })
  expect(link.closest("form")).toBeNull()
  const submitEvent = vi.fn()
  const form = screen.getByRole("button", { name: "Sign in" }).closest("form")!
  form.addEventListener("submit", submitEvent)
  fireEvent.click(link)
  expect(await screen.findByText("Your account is managed by an administrator.")).toBeTruthy()
  expect(submitEvent).not.toHaveBeenCalled()
  expect(authApi.defaults.adapter).not.toHaveBeenCalled()
  expect(screen.queryByRole("alert")).toBeNull()
})

it("shows login errors and offers admin password recovery without public registration", async () => {
  authApi.defaults.adapter = async (config) => { throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, {
    status: 401, statusText: "", headers: new AxiosHeaders(), config, data: { message: "Invalid email or password" },
  }) }
  setup(); submit()
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Invalid email or password")
  expect(screen.getByRole("link", { name: "Forgot password?" }).getAttribute("href")).toBe("/forgot-password")
  expect(screen.queryByRole("link", { name: /sign up/i })).toBeNull()
})

it("normalizes email and returns to the originally requested admin page after login", async () => {
  authApi.defaults.adapter = async (config) => {
    expect(JSON.parse(config.data)).toEqual({ email: "test@example.com", password: "Password123" })
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "", data: { data: {
      user: { id: "a", email: "test@example.com", firstName: "Test", lastName: "Admin", role: "admin", mustChangePassword: false },
      accessToken: "access", refreshToken: "refresh",
    } } }
  }
  setup(); submit()
  await waitFor(() => expect(screen.getByText("Destination /users?tab=all")).toBeTruthy())
})

it("requires a password change before visiting the saved destination", async () => {
  authApi.defaults.adapter = async (config) => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "", data: { data: {
    user: { id: "a", email: "test@example.com", firstName: "Test", lastName: "Staff", role: "staff", mustChangePassword: true },
    accessToken: "access", refreshToken: "refresh",
  } } })
  setup(); submit()
  expect(await screen.findByText("Destination /change-password")).toBeTruthy()
})
