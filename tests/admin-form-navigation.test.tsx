import type { ReactNode } from "react"
import { beforeEach, afterEach, expect, it, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosHeaders } from "axios"
import CategoryCreate from "@/pages/admin/categories/create"
import BrandCreate from "@/pages/admin/brands/create"
import UserCreate from "@/pages/admin/users/create"
import { api } from "@/services/api"
import { queryClient } from "@/services/query-client"

vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: ReactNode }) => <main>{children}</main> }))
const adapter = api.defaults.adapter
beforeEach(() => {
  queryClient.clear()
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], success: true } })
})
afterEach(() => { api.defaults.adapter = adapter; queryClient.clear() })

function setup(resource: "categories" | "brands" | "users") {
  const router = createMemoryRouter([
    { path: "/categories/new", element: <CategoryCreate /> },
    { path: "/brands/new", element: <BrandCreate /> },
    { path: "/users/new", element: <UserCreate /> },
    { path: `/${resource}`, element: <p>Returned to list</p> },
  ], { initialEntries: [`/${resource}/new`] })
  render(<QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider>)
}

it.each([
  ["categories", "Tên danh mục", "Về danh sách danh mục"],
  ["brands", "Tên thương hiệu", "Về danh sách thương hiệu"],
  ["users", "Nhập tên", "Về danh sách người dùng"],
] as const)("protects dirty %s forms during route navigation and Cancel", async (resource, field, back) => {
  setup(resource)
  fireEvent.change(await screen.findByLabelText(field), { target: { value: "Unsaved value" } })
  fireEvent.click(screen.getByText(back))
  expect(await screen.findByRole("dialog", { name: "Bỏ các thay đổi chưa lưu?" })).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục chỉnh sửa" }))
  expect((screen.getByLabelText(field) as HTMLInputElement).value).toBe("Unsaved value")
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Hủy" }))
  fireEvent.click(await screen.findByRole("button", { name: "Bỏ thay đổi" }))
  expect(await screen.findByText("Returned to list")).toBeTruthy()
})

it("saves a Brand with a long existing-compatible description and inactive status without blocking success navigation", async () => {
  const writes = vi.fn()
  api.defaults.adapter = async config => {
    if (config.method === "post") writes(JSON.parse(config.data))
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [] } }
  }
  setup("brands")
  fireEvent.change(screen.getByLabelText("Tên thương hiệu"), { target: { value: "Inactive brand" } })
  fireEvent.change(screen.getByLabelText("Mô tả"), { target: { value: "a".repeat(501) } })
  fireEvent.click(screen.getByLabelText("Thương hiệu đang hoạt động"))
  fireEvent.click(screen.getByRole("button", { name: "Tạo thương hiệu" }))
  expect(await screen.findByText("Returned to list")).toBeTruthy()
  expect(writes).toHaveBeenCalledWith({ name: "Inactive brand", description: "a".repeat(501), logoUrl: "", isActive: false })
  expect(screen.queryByRole("dialog")).toBeNull()
})
