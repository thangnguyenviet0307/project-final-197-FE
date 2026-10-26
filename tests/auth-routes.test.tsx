import { beforeEach, expect, it } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { createMemoryRouter, MemoryRouter, Route, RouterProvider, Routes, useLocation, type RouteObject } from "react-router-dom"
import { routes } from "@/router/routes"
import { ProtectedRoute } from "@/router/protected-route"
import { PublicOnlyRoute } from "@/router/public-only-route"
import { useAuthStore } from "@/stores/auth.store"
import type { Role } from "@/features/auth/types/auth"

function LoginLocation() {
  const location = useLocation()
  return <p>Login from {location.state?.from?.pathname}{location.state?.from?.search}</p>
}
function setup(path = "/users?tab=staff") {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<PublicOnlyRoute />}><Route path="/login" element={<LoginLocation />} /></Route>
    <Route path="/403" element={<p>Không có quyền truy cập</p>} />
    <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
      <Route path="/admin/dashboard" element={<p>Bảng điều khiển</p>} />
      <Route path="/change-password" element={<p>Đổi mật khẩu</p>} />
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}><Route path="/users" element={<p>Người dùng</p>} /></Route>
    </Route>
  </Routes></MemoryRouter>)
}
function session(role: Role, mustChangePassword = false) {
  useAuthStore.getState().setSession({ id: "a", name: "Test", firstName: "Test", lastName: "", email: "a@b.com", role, mustChangePassword }, { accessToken: "a", refreshToken: "r" })
}
beforeEach(() => { useAuthStore.getState().clearSession() })

it("redirects anonymous users and retains the requested location", async () => {
  setup()
  expect(await screen.findByText("Login from /users?tab=staff")).toBeTruthy()
})
it("denies staff access to user administration", async () => {
  session("staff"); setup()
  expect(await screen.findByText("Không có quyền truy cập")).toBeTruthy()
})
it("allows admin access to user administration", async () => {
  session("admin"); setup()
  expect(await screen.findByText("Người dùng")).toBeTruthy()
})
it("blocks dashboard access until the temporary password is changed", async () => {
  session("staff", true); setup("/admin/dashboard")
  expect(await screen.findByText("Đổi mật khẩu")).toBeTruthy()
})
it("redirects authenticated users away from login", async () => {
  session("admin"); setup("/login")
  expect(await screen.findByText("Bảng điều khiển")).toBeTruthy()
})
it("denies customer access to the staff dashboard", async () => {
  session("customer"); setup("/admin/dashboard")
  expect(await screen.findByText("Không có quyền truy cập")).toBeTruthy()
})
it("waits for session initialization before redirecting", () => {
  useAuthStore.setState({ isLoading: true }); setup()
  expect(screen.queryByText(/Login from/)).toBeNull()
  expect(screen.queryByText("Người dùng")).toBeNull()
})

// Keep the real route hierarchy and guards; replace page imports with small render targets.
function replacePages(items: RouteObject[]): RouteObject[] {
  return items.map(route => ({ ...route, lazy: route.lazy ? async () => ({ Component: () => <p>Trang {route.path}</p> }) : undefined,
    children: route.children ? replacePages(route.children) : undefined,
  }) as RouteObject)
}
it.each(["/products/new", `/products/${"a".repeat(24)}/edit`])("denies staff access to product write route %s", async path => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} />)
  expect(await screen.findByText("Trang /403")).toBeTruthy()
})
it.each(["/products", `/products/${"a".repeat(24)}`])("allows staff to read product route %s", async path => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} />)
  expect(await screen.findByText(path === "/products" ? "Trang /products" : "Trang /products/:id")).toBeTruthy()
})
it("allows an admin to open the product creation route", async () => {
  session("admin")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/products/new"] })} />)
  expect(await screen.findByText("Trang /products/new")).toBeTruthy()
})

it.each(["/account/login", "/register"])("opens customer auth route %s for guests", async path => {
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} /></QueryClientProvider>)
  expect(await screen.findByText(`Trang ${path}`)).toBeTruthy()
})

it.each(["/account/login", "/register", "/login"])("returns signed-in customers home from %s", async path => {
  session("customer")
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} /></QueryClientProvider>)
  expect(await screen.findByText("Trang /")).toBeTruthy()
})

it.each([
  ["admin", "/account/login"], ["admin", "/register"],
  ["staff", "/account/login"], ["staff", "/register"],
] as const)("keeps %s sessions in storefront and shows an error when opening %s", async (role, path) => {
  session(role)
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} /></QueryClientProvider>)
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Tài khoản này không dùng để đăng nhập cửa hàng. Vui lòng sử dụng tài khoản khách hàng.")
})

it.each(["/brands/new", "/categories/new", "/users/new"])("denies staff access to merged admin route %s", async path => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} />)
  expect(await screen.findByText("Trang /403")).toBeTruthy()
})

it.each(["/brands", "/customers", "/brands/new", "/categories/new", "/users/new"])("allows admin access to merged route %s", async path => {
  session("admin")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} />)
  expect(await screen.findByText(`Trang ${path}`)).toBeTruthy()
})

it("allows staff to view customer management", async () => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/customers"] })} />)
  expect(await screen.findByText("Trang /customers")).toBeTruthy()
})

it.each(["/customers", "/orders/new", "/brands"])("allows staff to use operational route %s", async path => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} />)
  expect(await screen.findByText(`Trang ${path}`)).toBeTruthy()
})

it("allows staff to view brands", async () => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/brands"] })} />)
  expect(await screen.findByText("Trang /brands")).toBeTruthy()
})
it.each(["/account/profile", "/account/orders", "/account/addresses", "/account/change-password"])("guards customer page %s", async path => {
  const router = createMemoryRouter(replacePages(routes), { initialEntries: [path] })
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={router} /></QueryClientProvider>)
  expect(await screen.findByText("Trang /account/login")).toBeTruthy()
  expect(router.state.location.state.from.pathname).toBe(path)
})
it.each(["admin", "staff"] as const)("denies %s access to customer account", async role => {
  session(role)
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/account/profile"] })} /></QueryClientProvider>)
  expect(await screen.findByText("Trang /403")).toBeTruthy()
})
it("allows customers to open their profile", async () => {
  session("customer")
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/account/profile"] })} /></QueryClientProvider>)
  expect(await screen.findByText("Trang profile")).toBeTruthy()
})
