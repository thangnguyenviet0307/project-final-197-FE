import type { ReactNode } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import ProductsPage from "@/pages/admin/products/index"
import { api, clearAuth } from "@/services/api"
import { queryClient } from "@/services/query-client"
import { useAuthStore } from "@/stores/auth.store"
vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: ReactNode }) => <main>{children}</main> }))
vi.mock("@/features/products/hooks/use-product-statistics", () => ({ useProductStatistics: () => ({ data: { total: 25, active: 18, outOfStock: 4, stockUnits: 120 }, isFetching: false }) }))
vi.mock("@/features/categories/hooks/use-categories", () => ({ useCategories: () => ({ data: [{ _id: "a".repeat(24), name: "Cases" }] }) }))
vi.mock("@/features/brands/hooks/use-brands", () => ({ useBrands: () => ({ data: [{ _id: "b".repeat(24), name: "Thương hiệu" }] }) }))
const original = api.defaults.adapter
const product = { _id: "a".repeat(24), product_name: "Phone case", price: 100, stock: 4, category: { name: "Cases" }, brand: { name: "Thương hiệu" }, is_active: true }
beforeEach(() => { queryClient.clear(); clearAuth() })
afterEach(() => { api.defaults.adapter = original; clearAuth() })
function LocationDebug() { const location = useLocation(); return <output data-testid="product-location">{location.search}</output> }
function setup(role: "admin" | "staff" = "admin", path = "/products") {
  useAuthStore.getState().setSession({ id: "self", name: "Quản trị viên", firstName: "Quản trị viên", lastName: "", email: "admin@example.com", role, mustChangePassword: false }, { accessToken: "a", refreshToken: "r" })
  render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[path]}><ProductsPage /><LocationDebug /></MemoryRouter></QueryClientProvider>)
}
it("debounces server filters, resets the page, and persists page size and reset in the URL", async () => {
  const requests: Record<string, unknown>[] = []
  api.defaults.adapter = async config => {
    requests.push(config.params)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [product], pagination: { total: 60, totalPages: 3 } } }
  }
  setup("admin", "/products?page=3&limit=20")
  await screen.findByText("Phone case")
  expect(requests[0]).toMatchObject({ page: 3, limit: 20 })
  fireEvent.change(screen.getByLabelText("Tên sản phẩm"), { target: { value: "Case" } })
  fireEvent.change(screen.getByLabelText("Danh mục"), { target: { value: "a".repeat(24) } })
  expect(requests).toHaveLength(1)
  await waitFor(() => expect(requests).toHaveLength(2))
  expect(requests[1]).toMatchObject({ page: 1, limit: 20, search: "Case", category: "a".repeat(24) })
  expect(screen.getByTestId("product-location").textContent).toContain("search=Case")
  expect(screen.queryByLabelText("Products per page")).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: "Đặt lại bộ lọc" }))
  await waitFor(() => expect(requests.at(-1)).toMatchObject({ page: 1, limit: 20, search: undefined, category: undefined, brand: undefined }))
  expect((screen.getByLabelText("Tên sản phẩm") as HTMLInputElement).value).toBe("")
})
it("keeps only name and catalog filters visible and ignores old advanced URL filters", async () => {
  const requests: Record<string, unknown>[] = []
  api.defaults.adapter = async config => { requests.push(config.params); return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { total: 0, totalPages: 0 } } } }
  setup("staff", "/products?page=-2&limit=999&search=Case&brand=" + "b".repeat(24) + "&color=red&size=XL&minPrice=100&sortBy=price")
  await screen.findByText("Không tìm thấy sản phẩm.")
  expect(requests[0]).toEqual({ page: 1, limit: 10, search: "Case", category: undefined, brand: "b".repeat(24) })
  for (const label of ["SKU (exact match)", "Màu sắc", "Kích thước", "Minimum price", "Maximum price", "Sort by", "Sort order"]) expect(screen.queryByLabelText(label)).toBeNull()
  expect((screen.getByLabelText("Tên sản phẩm") as HTMLInputElement).value).toBe("Case")
})
it("shows the discounted price and treats a missing discount as zero", async () => {
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: {
    data: [{ ...product, discount: 25 }, { ...product, _id: "b".repeat(24), product_name: "No discount" }], pagination: { total: 2, totalPages: 1 },
  } })
  setup()
  await screen.findByText("Phone case")
  const headings = screen.getAllByRole("columnheader").map(heading => heading.textContent)
  const index = headings.indexOf("Giá sau giảm")
  expect(index).toBeGreaterThan(-1)
  expect(within(screen.getByText("Phone case").closest("tr")!).getAllByRole("cell")[index].textContent).toBe("75")
  expect(within(screen.getByText("No discount").closest("tr")!).getAllByRole("cell")[index].textContent).toBe("100")
})
it("filters stock on the server, resets pagination and clears stock on reset", async () => {
  const requests: Record<string, unknown>[] = []
  api.defaults.adapter = async config => { requests.push(config.params); return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { total: 0, totalPages: 0 } } } }
  setup("admin", "/products?page=3&search=Case")
  await screen.findByText("Không tìm thấy sản phẩm.")
  fireEvent.change(screen.getByLabelText("Tồn kho"), { target: { value: "out_of_stock" } })
  await waitFor(() => expect(requests.at(-1)).toMatchObject({ page: 1, search: "Case", stockStatus: "out_of_stock" }))
  expect(screen.getByTestId("product-location").textContent).toContain("stockStatus=out_of_stock")
  fireEvent.change(screen.getByLabelText("Tồn kho"), { target: { value: "low_stock" } })
  await waitFor(() => expect(requests.at(-1)).toMatchObject({ stockStatus: "low_stock" }))
  fireEvent.click(screen.getByRole("button", { name: "Đặt lại bộ lọc" }))
  await waitFor(() => expect(requests.at(-1)).toMatchObject({ page: 1, stockStatus: undefined, search: undefined }))
})

it("shows global catalog statistics independently of the current page", async () => {
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: {
    data: [product, { ...product, _id: "b".repeat(24), product_name: "Empty case", stock: 0, is_active: false }],
    pagination: { total: 25, totalPages: 3 },
  } })
  setup()
  await screen.findByText("Phone case")
  const stats = screen.getByRole("region", { name: "Thống kê sản phẩm" })
  for (const [label, value] of [["Tổng sản phẩm", "25"], ["Sản phẩm đang hoạt động", "18"], ["Hết hàng", "4"], ["Số lượng tồn kho", "120"]]) {
    const card = within(stats).getByText(label).closest('[data-slot="card"]')!
    expect(within(card as HTMLElement).getByText(value)).toBeTruthy()
  }
  expect(within(stats).getAllByText("Toàn bộ danh mục")).toHaveLength(4)
})
it("paginates on the server and keeps the previous page visible during refetch", async () => {
  const pages: number[] = []
  let resolveNext: (() => void) | undefined
  api.defaults.adapter = async config => {
    pages.push(config.params.page)
    if (config.params.page === 2) await new Promise<void>(resolve => { resolveNext = resolve })
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [{ ...product, product_name: config.params.page === 2 ? "Second case" : "Phone case" }], pagination: { total: 11, totalPages: 2 } } }
  }
  setup()
  await screen.findByText("Phone case")
  fireEvent.click(screen.getByRole("button", { name: "Tiếp" }))
  await waitFor(() => expect(pages).toEqual([1, 2]))
  expect(screen.getByText("Phone case")).toBeTruthy()
  expect(screen.getByText("Đang cập nhật sản phẩm…")).toBeTruthy()
  resolveNext!()
  expect(await screen.findByText("Second case")).toBeTruthy()
})
it("shows initial loading skeletons until products arrive", async () => {
  let finish: (() => void) | undefined
  api.defaults.adapter = async config => {
    await new Promise<void>(resolve => { finish = resolve })
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [product], pagination: { total: 1, totalPages: 1 } } }
  }
  setup()
  expect(screen.getByRole("status", { name: "Đang tải sản phẩm" }).querySelector('[data-slot="skeleton"]')).toBeTruthy()
  await waitFor(() => expect(finish).toBeTypeOf("function"))
  finish!()
  await screen.findByText("Phone case")
  expect(screen.queryByRole("status", { name: "Đang tải sản phẩm" })).toBeNull()
})
it("supports Users-style numbered, first and last page navigation", async () => {
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [product], pagination: { total: 100, totalPages: 10 } } })
  setup()
  await screen.findByText("Phone case")
  const pagination = screen.getByRole("navigation", { name: "Phân trang sản phẩm" })
  expect(within(pagination).getByRole("button", { name: "Trang 1" }).getAttribute("aria-current")).toBe("page")
  expect(within(pagination).getByRole("button", { name: "Trang đầu" }).hasAttribute("disabled")).toBe(true)
  fireEvent.click(within(pagination).getByRole("button", { name: "Trang cuối" }))
  await waitFor(() => expect(within(pagination).getByRole("button", { name: "Trang 10" }).getAttribute("aria-current")).toBe("page"))
  await waitFor(() => expect(within(pagination).getByRole("button", { name: "Trang đầu" }).hasAttribute("disabled")).toBe(false))
  expect(within(pagination).getByRole("button", { name: "Trang cuối" }).hasAttribute("disabled")).toBe(true)
  fireEvent.click(within(pagination).getByRole("button", { name: "Trang 9" }))
  await waitFor(() => expect(within(pagination).getByRole("button", { name: "Trang 9" }).getAttribute("aria-current")).toBe("page"))
  await waitFor(() => expect(within(pagination).getByRole("button", { name: "Trang đầu" }).hasAttribute("disabled")).toBe(false))
  fireEvent.click(within(pagination).getByRole("button", { name: "Trang đầu" }))
  await waitFor(() => expect(within(pagination).getByRole("button", { name: "Trang 1" }).getAttribute("aria-current")).toBe("page"))
})
it("shows staff read-only actions", async () => {
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [product], pagination: { total: 1, totalPages: 1 } } })
  setup("staff")
  await screen.findByText("Phone case")
  expect(screen.queryByText("Thêm sản phẩm")).toBeNull()
  expect(screen.queryByLabelText("Delete Phone case")).toBeNull()
  expect(screen.getByLabelText("View Phone case")).toBeTruthy()
})
it("shows an API error and supports retry", async () => {
  let fail = true
  api.defaults.adapter = async config => {
    if (fail) throw new AxiosError("Network error", "ERR_NETWORK", config)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { total: 0, totalPages: 0 } } }
  }
  setup()
  expect(await screen.findByRole("alert")).toBeTruthy()
  fail = false
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }))
  expect(await screen.findByText("Không tìm thấy sản phẩm.")).toBeTruthy()
})
it("requires confirmation and keeps the product after the API rejects deletion", async () => {
  const writes = vi.fn()
  api.defaults.adapter = async config => {
    if (config.method === "delete") {
      writes()
      throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { config, headers: new AxiosHeaders(), status: 409, statusText: "Conflict", data: { message: "Cannot delete products referenced by orders" } })
    }
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [product], pagination: { total: 1, totalPages: 1 } } }
  }
  setup()
  fireEvent.click(await screen.findByLabelText("Delete Phone case"))
  expect(writes).not.toHaveBeenCalled()
  fireEvent.click(await screen.findByRole("button", { name: "Xác nhận xóa" }))
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Cannot delete products referenced by orders")
  expect(screen.getByText("Phone case")).toBeTruthy()
})
it("refreshes the list only after deletion succeeds", async () => {
  let deleted = false
  let finishDelete: (() => void) | undefined
  api.defaults.adapter = async config => {
    if (config.method === "delete") {
      await new Promise<void>(resolve => { finishDelete = resolve })
      deleted = true
    }
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: deleted ? [] : [product], pagination: { total: deleted ? 0 : 1, totalPages: deleted ? 0 : 1 } } }
  }
  setup()
  fireEvent.click(await screen.findByLabelText("Delete Phone case"))
  fireEvent.click(await screen.findByRole("button", { name: "Xác nhận xóa" }))
  await waitFor(() => expect(finishDelete).toBeTypeOf("function"))
  expect(screen.getByText("Phone case")).toBeTruthy()
  expect(screen.getByRole("button", { name: "Xác nhận xóa" }).hasAttribute("disabled")).toBe(true)
  finishDelete!()
  expect(await screen.findByText("Không tìm thấy sản phẩm.")).toBeTruthy()
  expect(screen.queryByRole("dialog")).toBeNull()
})
