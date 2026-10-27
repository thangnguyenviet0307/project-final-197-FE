import { afterEach, beforeEach, expect, it } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import { MemoryRouter, Route, Routes, createMemoryRouter, RouterProvider } from "react-router-dom"
import ProfilePage from "@/pages/storefront/account/profile"
import ChangePasswordPage from "@/pages/storefront/account/change-password"
import AddressesPage from "@/pages/storefront/account/addresses"
import OrdersPage from "@/pages/storefront/account/orders"
import { ProtectedRoute } from "@/router/protected-route"
import { queryClient } from "@/services/query-client"
import { api, clearAuth } from "@/services/api"
import { configureAuthArea, useAuthStore } from "@/stores/auth.store"
const adapter = api.defaults.adapter
const user = { id: "buyer", name: "An Nguyen", firstName: "An", lastName: "Nguyen", email: "buyer@example.com", accountType: "customer" as const, role: undefined, mustChangePassword: false, personalEmail: "", phone: "", location: "", bio: "" }
beforeEach(() => { configureAuthArea("storefront"); clearAuth(); useAuthStore.getState().setSession(user, { accessToken: "token" }) })
afterEach(() => { api.defaults.adapter = adapter; clearAuth(); configureAuthArea("admin") })
it("loads and saves customer profile with the account email kept read-only", async () => {
  let payload: Record<string, string> | undefined
  api.defaults.adapter = async config => {
    let data = user
    if (config.method === "patch") {
      payload = JSON.parse(config.data)
      data = { ...user, firstName: String(payload?.firstName), phone: String(payload?.phone) }
    }
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter><ProfilePage /></MemoryRouter></QueryClientProvider>)
  await screen.findByDisplayValue("An")
  expect(screen.getByLabelText("Email").hasAttribute("readonly")).toBe(true)
  expect(screen.queryByLabelText("Email liên hệ")).toBeNull()
  fireEvent.change(screen.getByLabelText("Tên"), { target: { value: "Linh" } })
  fireEvent.change(screen.getByLabelText("Số điện thoại"), { target: { value: "0901234567" } })
  fireEvent.change(screen.getByLabelText("Ngày sinh"), { target: { value: "2000-02-29" } })
  fireEvent.change(screen.getByLabelText("Giới tính"), { target: { value: "female" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await screen.findByText("Đã lưu hồ sơ.")
  expect(payload?.firstName).toBe("Linh")
  expect(payload?.birthDate).toBe("2000-02-29")
  expect(payload?.gender).toBe("female")
  expect(payload).not.toHaveProperty("email")
  expect(payload).not.toHaveProperty("role")
  expect(useAuthStore.getState().user?.firstName).toBe("Linh")
})

it("keeps the customer draft when profile save fails", async () => {
  api.defaults.adapter = async config => {
    if (config.method === "patch") throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { config, status: 409, statusText: "Conflict", headers: new AxiosHeaders(), data: { message: "Conflict" } })
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: user } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter><ProfilePage /></MemoryRouter></QueryClientProvider>)
  await screen.findByDisplayValue("An")
  fireEvent.change(screen.getByLabelText("Tên"), { target: { value: "Draft" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await screen.findByRole("alert")
  expect(screen.getByLabelText("Tên")).toHaveProperty("value", "Draft")
})

it("saves the separate shipping address without phone or identity fields", async () => {
  let payload: Record<string, string> | undefined
  api.defaults.adapter = async config => {
    if (config.method === "patch") {
      expect(config.url).toBe("/customer-auth/shipping-address")
      payload = JSON.parse(config.data)
    }
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: { ...user, ...(payload ? { shippingAddress: payload } : {}) } } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter><AddressesPage /></MemoryRouter></QueryClientProvider>)
  await screen.findByDisplayValue("buyer@example.com")
  expect(screen.queryByLabelText(/Số điện thoại/)).toBeNull()
  expect(screen.queryByLabelText(/CCCD/)).toBeNull()
  fireEvent.change(screen.getByLabelText(/Tỉnh \/ Thành phố/), { target: { value: "Hồ Chí Minh" } })
  fireEvent.change(screen.getByLabelText(/Phường \/ Xã/), { target: { value: "Bến Thành" } })
  fireEvent.change(screen.getByLabelText(/Địa chỉ chi tiết/), { target: { value: "123 Đường A" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu địa chỉ" }))
  await screen.findByText("Đã lưu địa chỉ giao hàng.")
  expect(payload).toMatchObject({ province: "Hồ Chí Minh", ward: "Bến Thành", street: "123 Đường A", email: user.email })
  expect(payload).not.toHaveProperty("phone")
})

it("loads customer orders with no customer identity in request parameters", async () => {
  api.defaults.adapter = async config => {
    expect(config.url).toBe("/customer-auth/orders")
    expect(config.params).toEqual({ page: 1, limit: 10 })
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [{ _id: "o1", orderCode: "ORD-ABC234", orderDate: "2026-01-01", orderStatus: 1, totalAmount: 100000, street: "A", city: "B", state: "C", orderItems: [{ productName: "Tên khi mua", quantity: 1, price: 100000, discount: 0 }] }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter><OrdersPage /></MemoryRouter></QueryClientProvider>)
  expect(await screen.findByText("ORD-ABC234")).toBeTruthy()
  expect(screen.getByText("Tên khi mua")).toBeTruthy()
  expect(screen.getByText("Chờ xử lý")).toBeTruthy()
})

it.each(["/unknown-store-page", "/auth/unknown-admin-page"])("renders the correct 404 for %s", async path => {
  const { routes } = await import("@/router/routes")
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider>)
  expect(await screen.findByRole("heading", { name: path.startsWith("/auth/") ? "Không tìm thấy trang quản trị" : "Không tìm thấy trang" })).toBeTruthy()
  expect(screen.getByRole("link", { name: path.startsWith("/auth/") ? "Về bảng điều khiển" : "Về trang chủ" }).getAttribute("href")).toBe(path.startsWith("/auth/") ? "/auth/dashboard" : "/")
})
it("changes customer password, clears session and returns to storefront login", async () => {
  let payload: unknown
  api.defaults.adapter = async config => {
    expect(config.url).toBe("/customer-auth/change-password")
    payload = JSON.parse(config.data)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: null } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={["/account/change-password"]}><Routes>
    <Route element={<ProtectedRoute storefront />}><Route path="/account/change-password" element={<ChangePasswordPage />} /></Route>
    <Route path="/thanh-vien" element={<p>Customer login</p>} />
  </Routes></MemoryRouter></QueryClientProvider>)
  fireEvent.change(screen.getByLabelText("Mật khẩu hiện tại"), { target: { value: "Customer123" } })
  fireEvent.change(screen.getByLabelText("Mật khẩu mới"), { target: { value: "New123!" } })
  fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), { target: { value: "New123!" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu mật khẩu mới" }))
  await screen.findByText("Customer login")
  expect(payload).toEqual({ currentPassword: "Customer123", newPassword: "New123!" })
  await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false))
})
