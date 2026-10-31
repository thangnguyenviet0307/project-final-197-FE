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
function setup(path = "/auth/users?tab=staff") {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<PublicOnlyRoute />}><Route path="/auth/login" element={<LoginLocation />} /></Route>
    <Route path="/auth/403" element={<p>Không có quyền truy cập</p>} />
    <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
      <Route path="/auth/dashboard" element={<p>Bảng điều khiển</p>} />
      <Route path="/auth/change-password" element={<p>Đổi mật khẩu</p>} />
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}><Route path="/auth/users" element={<p>Người dùng</p>} /></Route>
    </Route>
  </Routes></MemoryRouter>)
}
function session(role: Role | "customer", mustChangePassword = false) {
  useAuthStore.getState().setSession({ id: "a", name: "Test", firstName: "Test", lastName: "", email: "a@b.com", ...(role === "customer" ? { accountType: "customer" as const } : { role }), mustChangePassword }, { accessToken: "a", refreshToken: "r" })
}
beforeEach(() => { useAuthStore.getState().clearSession() })

it("redirects old admin bookmarks and retains search, hash and navigation state", async () => {
  session("admin")
  const router = createMemoryRouter(replacePages(routes), { initialEntries: [{ pathname: "/products", search: "?page=3", hash: "#catalog", state: { returnTo: "/auth/products?page=2" } }] })
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={router} /></QueryClientProvider>)
  expect(await screen.findByText("Trang /auth/products")).toBeTruthy()
  expect(router.state.location).toMatchObject({ pathname: "/auth/products", search: "?page=3", hash: "#catalog", state: { returnTo: "/auth/products?page=2" } })
})

it("requests admin login when a guest opens the canonical dashboard", async () => {
  const router = createMemoryRouter(replacePages(routes), { initialEntries: ["/auth/dashboard"] })
  render(<RouterProvider router={router} />)
  expect(await screen.findByText("Trang /auth/login")).toBeTruthy()
  expect(router.state.location.state.from.pathname).toBe("/auth/dashboard")
})

it("redirects anonymous users and retains the requested location", async () => {
  setup()
  expect(await screen.findByText("Login from /auth/users?tab=staff")).toBeTruthy()
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
  session("staff", true); setup("/auth/dashboard")
  expect(await screen.findByText("Đổi mật khẩu")).toBeTruthy()
})
it("redirects authenticated users away from login", async () => {
  session("admin"); setup("/auth/login")
  expect(await screen.findByText("Bảng điều khiển")).toBeTruthy()
})
it("denies customer access to the staff dashboard", async () => {
  session("customer"); setup("/auth/dashboard")
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
it.each(["/auth/products/new", `/auth/products/${"a".repeat(24)}/edit`])("denies staff access to product write route %s", async path => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} />)
  expect(await screen.findByText("Trang /auth/403")).toBeTruthy()
})
it.each(["/auth/products", `/auth/products/${"a".repeat(24)}`])("allows staff to read product route %s", async path => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} />)
  expect(await screen.findByText(path === "/auth/products" ? "Trang /auth/products" : "Trang /auth/products/:id")).toBeTruthy()
})
it("allows an admin to open the product creation route", async () => {
  session("admin")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/auth/products/new"] })} />)
  expect(await screen.findByText("Trang /auth/products/new")).toBeTruthy()
})

it.each(["/thanh-vien?act=login", "/thanh-vien?act=register"])("opens customer auth route %s for guests", async path => {
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} /></QueryClientProvider>)
  expect(await screen.findByText(`Trang ${path.startsWith("/thanh-vien") ? "/thanh-vien" : path}`)).toBeTruthy()
})

it.each(["/thanh-vien?act=login", "/thanh-vien?act=register"])("returns signed-in customers home from %s", async path => {
  session("customer")
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} /></QueryClientProvider>)
  expect(await screen.findByText("Trang /")).toBeTruthy()
})

it.each([
  ["admin", "/thanh-vien?act=login"], ["admin", "/thanh-vien?act=register"],
  ["staff", "/thanh-vien?act=login"], ["staff", "/thanh-vien?act=register"],
] as const)("keeps %s sessions in storefront and shows an error when opening %s", async (role, path) => {
  session(role)
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} /></QueryClientProvider>)
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Tài khoản không tồn tại !")
})

it("blocks a signed-in customer from the dashboard login page", async () => {
  session("customer")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/auth/login"] })} />)
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Tài khoản không tồn tại !")
})

it.each(["/auth/brands/new", "/auth/categories/new", "/auth/users/new"])("denies staff access to merged admin route %s", async path => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} />)
  expect(await screen.findByText("Trang /auth/403")).toBeTruthy()
})

it.each(["/auth/brands", "/auth/customers", "/auth/brands/new", "/auth/categories/new", "/auth/users/new"])("allows admin access to merged route %s", async path => {
  session("admin")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} />)
  expect(await screen.findByText(`Trang ${path.startsWith("/thanh-vien") ? "/thanh-vien" : path}`)).toBeTruthy()
})

it("allows staff to view customer management", async () => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/auth/customers"] })} />)
  expect(await screen.findByText("Trang /auth/customers")).toBeTruthy()
})

it.each(["/auth/customers", "/auth/orders/new", "/auth/brands"])("allows staff to use operational route %s", async path => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} />)
  expect(await screen.findByText(`Trang ${path.startsWith("/thanh-vien") ? "/thanh-vien" : path}`)).toBeTruthy()
})

it("allows staff to view brands", async () => {
  session("staff")
  render(<RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/auth/brands"] })} />)
  expect(await screen.findByText("Trang /auth/brands")).toBeTruthy()
})
it.each(["/account/profile", "/account/orders", "/account/addresses", "/account/change-password"])("guards customer page %s", async path => {
  const router = createMemoryRouter(replacePages(routes), { initialEntries: [path] })
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={router} /></QueryClientProvider>)
  expect(await screen.findByText("Trang /thanh-vien")).toBeTruthy()
  expect(router.state.location.state.from.pathname).toBe(path)
})
it.each(["super_admin", "admin", "staff"] as const)("denies %s access to customer account", async role => {
  session(role)
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/account/profile"] })} /></QueryClientProvider>)
  expect(await screen.findByText("Trang /403")).toBeTruthy()
})

it.each(["/auth/dashboard", "/auth/users", "/auth/products/new", "/auth/hero-slides"])("allows Super Admin to open %s", async path => {
  session("super_admin")
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: [path] })} /></QueryClientProvider>)
  expect(await screen.findByText(`Trang ${path}`)).toBeTruthy()
})
it("allows customers to open their profile", async () => {
  session("customer")
  render(<QueryClientProvider client={new QueryClient()}><RouterProvider router={createMemoryRouter(replacePages(routes), { initialEntries: ["/account/profile"] })} /></QueryClientProvider>)
  expect(await screen.findByText("Trang profile")).toBeTruthy()
})

for (const path of ["/auth/articles", "/auth/post-categories"]) {
  it(`blocks staff from ${path}`, async () => {
    session("staff")
    const router = createMemoryRouter(replacePages(routes), { initialEntries: [path] })
    render(<RouterProvider router={router} />)
    await waitForRoute()
    function waitForRoute() { return screen.findByText("Trang /auth/403") }
  })
  it(`allows admin into ${path}`, async () => {
    session("admin")
    const router = createMemoryRouter(replacePages(routes), { initialEntries: [path] })
    render(<RouterProvider router={router} />)
    expect(await screen.findByText(`Trang ${path}`)).toBeTruthy()
  })
}
