import { expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { RouteFallback, isStorefrontRoute } from "@/router/route-fallback"
import { RootFallback } from "@/layout/root-layout"
import { ContentSkeleton } from "@/components/page-skeleton"

it("shows a skeleton during initial route loading and removes it when the page is ready", async () => {
  let finish: (() => void) | undefined
  const router = createMemoryRouter([{ path: "/", HydrateFallback: RootFallback, lazy: async () => {
    await new Promise<void>(resolve => { finish = resolve })
    return { Component: () => <p>Page ready</p> }
  } }])
  render(<RouterProvider router={router} />)
  const status = screen.getByRole("status", { name: "Đang tải trang bán hàng" })
  expect(status.getAttribute("aria-busy")).toBe("true")
  expect(status.querySelector('[data-slot="skeleton"]')).toBeTruthy()
  await act(async () => { finish!() })
  expect(await screen.findByText("Page ready")).toBeTruthy()
  expect(screen.queryByRole("status", { name: "Đang tải trang bán hàng" })).toBeNull()
})
it.each(["table", "form", "profile"] as const)("provides an accessible %s loading skeleton", variant => {
  render(<ContentSkeleton label="Loading data" variant={variant} />)
  expect(screen.getByRole("status", { name: "Loading data" }).querySelector('[data-slot="skeleton"]')).toBeTruthy()
})

it("uses the storefront shell by default before routing/auth initialization", () => {
  const { container } = render(<RootFallback />)
  expect(screen.getByRole("status", { name: "Đang tải trang bán hàng" })).toBeTruthy()
  expect(screen.getByText("DEMO", { exact: false })).toBeTruthy()
  expect(container.querySelector("aside")).toBeNull()
})
it("retains the admin skeleton when explicitly requested by an admin guard", () => {
  const { container } = render(<RootFallback storefront={false} />)
  expect(screen.queryByRole("status", { name: "Đang tải trang bán hàng" })).toBeNull()
  expect(container.querySelector("aside")).toBeTruthy()
})

it.each(["/auth/dashboard", "/auth/dashboard", "/auth/products", "/auth/products/new", "/auth/orders", "/auth/login", "/auth/brands", "/auth/settings/user"])("uses admin loading for initial route %s", pathname => {
  expect(isStorefrontRoute(pathname)).toBe(false)
})
it.each(["/", "/contact", "/landing", "/thanh-vien?act=register", "/thanh-vien?act=login", "/account/profile"])("uses storefront loading for initial route %s", pathname => {
  expect(isStorefrontRoute(pathname)).toBe(true)
})
it("respects deployment basename during auth bootstrap", () => {
  expect(isStorefrontRoute("/store/dashboard", "/store")).toBe(false)
  expect(isStorefrontRoute("/store/account/profile", "/store")).toBe(true)
})
it.each(["/auth/dashboard", "/"])("shows the correct hydration skeleton before lazy page %s resolves", async path => {
  let finish: (() => void) | undefined
  const router = createMemoryRouter([{ path, HydrateFallback: RouteFallback, lazy: async () => {
    await new Promise<void>(resolve => { finish = resolve })
    return { Component: () => <p>Ready</p> }
  } }], { initialEntries: [path] })
  const { container } = render(<RouterProvider router={router} />)
  expect(!!container.querySelector("aside")).toBe(path === "/auth/dashboard")
  expect(!!screen.queryByRole("status", { name: "Đang tải trang bán hàng" })).toBe(path === "/")
  await act(async () => { finish!() })
  expect(await screen.findByText("Ready")).toBeTruthy()
})
