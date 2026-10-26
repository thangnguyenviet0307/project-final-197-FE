import { afterEach, beforeEach, expect, it } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosHeaders } from "axios"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import ProfilePage from "@/pages/storefront/account/profile"
import ChangePasswordPage from "@/pages/storefront/account/change-password"
import { ProtectedRoute } from "@/router/protected-route"
import { queryClient } from "@/services/query-client"
import { api, clearAuth } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"
const adapter = api.defaults.adapter
const user = { id: "buyer", name: "An Nguyen", firstName: "An", lastName: "Nguyen", email: "buyer@example.com", role: "customer" as const, mustChangePassword: false, personalEmail: "", phone: "", location: "", bio: "" }
beforeEach(() => { clearAuth(); useAuthStore.getState().setSession(user, { accessToken: "token" }) })
afterEach(() => { api.defaults.adapter = adapter; clearAuth() })
it("loads and saves customer profile with the account email kept read-only", async () => {
  let payload: FormData | undefined
  api.defaults.adapter = async config => {
    let data = user
    if (config.method === "patch") {
      payload = config.data as FormData
      data = { ...user, firstName: String(payload.get("firstName")), phone: String(payload.get("phone")) }
    }
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter><ProfilePage /></MemoryRouter></QueryClientProvider>)
  await screen.findByDisplayValue("An")
  expect(screen.getByLabelText("Email đăng nhập").hasAttribute("readonly")).toBe(true)
  fireEvent.change(screen.getByLabelText("Tên"), { target: { value: "Linh" } })
  fireEvent.change(screen.getByLabelText("Số điện thoại"), { target: { value: "0901234567" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await screen.findByText("Đã lưu hồ sơ.")
  expect(payload?.get("firstName")).toBe("Linh")
  expect(payload?.has("email")).toBe(false)
  expect(payload?.has("role")).toBe(false)
  expect(useAuthStore.getState().user?.firstName).toBe("Linh")
})
it("changes customer password, clears session and returns to storefront login", async () => {
  let payload: unknown
  api.defaults.adapter = async config => {
    expect(config.url).toBe("/auth/change-password")
    payload = JSON.parse(config.data)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: null } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={["/account/change-password"]}><Routes>
    <Route element={<ProtectedRoute storefront allowedRoles={["customer"]} />}><Route path="/account/change-password" element={<ChangePasswordPage />} /></Route>
    <Route path="/account/login" element={<p>Customer login</p>} />
  </Routes></MemoryRouter></QueryClientProvider>)
  fireEvent.change(screen.getByLabelText("Mật khẩu hiện tại"), { target: { value: "Customer123" } })
  fireEvent.change(screen.getByLabelText("Mật khẩu mới"), { target: { value: "New123!" } })
  fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), { target: { value: "New123!" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu mật khẩu mới" }))
  await screen.findByText("Customer login")
  expect(payload).toEqual({ currentPassword: "Customer123", newPassword: "New123!" })
  await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false))
})
