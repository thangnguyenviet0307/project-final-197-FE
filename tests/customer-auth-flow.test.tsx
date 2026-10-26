import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders, type AxiosAdapter } from "axios"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { CustomerAuthForm } from "@/features/auth/components/customer-auth-form"
import { PublicOnlyRoute } from "@/router/protected-route"
import { queryClient } from "@/services/query-client"
import { authApi, clearAuth } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"

const originalAdapter = authApi.defaults.adapter
beforeEach(clearAuth)
afterEach(() => { authApi.defaults.adapter = originalAdapter; clearAuth() })

function setup() {
  render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={["/register"]}><Routes>
    <Route element={<PublicOnlyRoute storefront />}>
      <Route path="/register" element={<CustomerAuthForm key="register" registration />} />
      <Route path="/account/login" element={<CustomerAuthForm key="login" />} />
    </Route>
    <Route path="/" element={<p>Store homepage</p>} />
  </Routes></MemoryRouter></QueryClientProvider>)
}

function submitRegistration(confirmPassword = "Customer123") {
  for (const [label, value] of [
    ["Họ", " Nguyễn "], ["Tên", " An "], ["Email", " BUYER@example.com "],
    ["Mật khẩu", "Customer123"], ["Xác nhận mật khẩu", confirmPassword],
  ]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fireEvent.click(screen.getByRole("button", { name: "Đăng ký" }))
}

it("registers, asks the customer to sign in, then opens the storefront homepage", async () => {
  const requests: string[] = []
  authApi.defaults.adapter = async config => {
    requests.push(config.url ?? "")
    if (config.url === "/auth/register") {
      expect(JSON.parse(config.data)).toEqual({ email: "buyer@example.com", password: "Customer123", firstName: "An", lastName: "Nguyễn" })
      return { config, headers: new AxiosHeaders(), status: 201, statusText: "", data: { success: true, data: { role: "customer" } } }
    }
    expect(config.url).toBe("/auth/login")
    expect(JSON.parse(config.data)).toEqual({ email: "buyer@example.com", password: "Customer123" })
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "", data: { data: {
      user: { id: "buyer", email: "buyer@example.com", firstName: "An", lastName: "Nguyễn", role: "customer" }, accessToken: "access",
    } } }
  }
  setup(); submitRegistration()
  expect(await screen.findByRole("status")).toHaveProperty("textContent", "Đăng ký thành công. Vui lòng đăng nhập để tiếp tục mua sắm.")
  expect(requests).toEqual(["/auth/register"])
  expect(useAuthStore.getState().isAuthenticated).toBe(false)
  expect(screen.getByLabelText("Mật khẩu")).toHaveProperty("value", "")
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "buyer@example.com" } })
  fireEvent.change(screen.getByLabelText("Mật khẩu"), { target: { value: "Customer123" } })
  fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }))
  expect(await screen.findByText("Store homepage")).toBeTruthy()
  expect(requests).toEqual(["/auth/register", "/auth/login"])
})

it("rejects mismatched confirmation without calling the API", async () => {
  authApi.defaults.adapter = vi.fn<AxiosAdapter>()
  setup(); submitRegistration("Different123")
  expect(await screen.findByText("Mật khẩu xác nhận không khớp.")).toBeTruthy()
  expect(authApi.defaults.adapter).not.toHaveBeenCalled()
})

it("toggles each registration password independently and describes the requirements", () => {
  authApi.defaults.adapter = vi.fn<AxiosAdapter>()
  setup()
  const password = screen.getByLabelText("Mật khẩu")
  const confirmation = screen.getByLabelText("Xác nhận mật khẩu")
  expect(password.getAttribute("aria-describedby")).toBe("customer-password-hint")
  expect(screen.getByText("Mật khẩu phải có ít nhất 6 ký tự và không vượt quá 1024 ký tự.")).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Hiện mật khẩu" }))
  expect(password).toHaveProperty("type", "text")
  expect(confirmation).toHaveProperty("type", "password")
  fireEvent.click(screen.getByRole("button", { name: "Hiện mật khẩu xác nhận" }))
  expect(confirmation).toHaveProperty("type", "text")
  fireEvent.click(screen.getByRole("button", { name: "Ẩn mật khẩu" }))
  expect(password).toHaveProperty("type", "password")
  expect(confirmation).toHaveProperty("type", "text")
  fireEvent.click(screen.getByRole("button", { name: "Ẩn mật khẩu xác nhận" }))
  expect(confirmation).toHaveProperty("type", "password")
  expect(authApi.defaults.adapter).not.toHaveBeenCalled()
})

it("keeps the registration form and displays duplicate-email errors", async () => {
  authApi.defaults.adapter = async config => { throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, {
    status: 409, statusText: "", headers: new AxiosHeaders(), config, data: { message: "Email already exists" },
  }) }
  setup(); submitRegistration()
  expect(await screen.findByRole("alert")).toBeTruthy()
  expect(screen.getByRole("button", { name: "Đăng ký" })).toHaveProperty("disabled", false)
  expect(screen.queryByText("Store homepage")).toBeNull()
  expect(useAuthStore.getState().isAuthenticated).toBe(false)
})
