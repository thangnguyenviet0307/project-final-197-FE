import type { ReactNode } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import OrdersPage from "@/pages/admin/orders/index"
import OrderDetail from "@/pages/admin/orders/detail"
import { api, clearAuth } from "@/services/api"
import { queryClient } from "@/services/query-client"
import { useAuthStore } from "@/stores/auth.store"
import { orderItemSubtotal } from "@/features/orders/utils/order-price"
import type { Order } from "@/features/orders/types/orders"
import { orderDateBoundary } from "@/features/orders/utils/order-date"
import { OrderDateFilter } from "@/features/orders/components/order-date-filter"

vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: ReactNode }) => <main>{children}</main> }))
vi.mock("@/features/orders/components/order-statistics", () => ({ OrderStatistics: () => null }))
const original = api.defaults.adapter
const id = "a".repeat(24)
const order: Order = { _id: id, customerId: null, customerSnapshot: { firstName: "Historical", lastName: "Customer", email: "old@example.com" }, orderStatus: 1, orderDate: "2026-10-01T10:00:00Z", street: "123 Street", city: "Tỉnh/thành phố", state: "Bang/khu vực", paymentType: 1, totalAmount: 777, orderItems: [{ _id: "item", productId: null, quantity: 2, price: 100, discount: 10, sku: "OLD-SKU" }] }
beforeEach(() => { queryClient.clear(); clearAuth() })
afterEach(() => { api.defaults.adapter = original; clearAuth() })
function setup(role: "admin" | "staff" = "admin", path = "/auth/orders") {
  useAuthStore.getState().setSession({ id: "b".repeat(24), name: "Quản trị viên", firstName: "Quản trị viên", lastName: "", email: "admin@example.com", role, mustChangePassword: false }, { accessToken: "a", refreshToken: "r" })
  render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[path]}><Routes><Route path="/auth/orders" element={<OrdersPage />} /><Route path="/auth/orders/:id" element={<OrderDetail />} /></Routes></MemoryRouter></QueryClientProvider>)
}
function mockOrder(value: Order = order) {
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: config.url === "/orders" ? [value] : value, pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } })
}
it("staff can view and open details but cannot mutate pending or rejected orders", async () => {
  mockOrder({ ...order, orderStatus: 3 })
  setup("staff")
  await screen.findByText("Historical Customer")
  expect(screen.queryByRole("button", { name: /Xóa đơn hàng/ })).toBeNull()
  expect(screen.queryByRole("button", { name: /Cập nhật trạng thái/ })).toBeNull()
  fireEvent.click(screen.getByRole("link", { name: "Xem" }))
  await screen.findByText("OLD-SKU")
  expect(screen.queryByRole("button", { name: /Xóa đơn hàng/ })).toBeNull()
})
it("details use snapshots and the server total even when a product is deleted", async () => {
  mockOrder()
  setup("staff", `/auth/orders/${id}`)
  await screen.findByText("OLD-SKU")
  expect(screen.getByText("Historical Customer")).toBeTruthy()
  expect(screen.getByText("Sản phẩm không khả dụng")).toBeTruthy()
  expect(screen.getByText("Tổng cộng: 777")).toBeTruthy()
  expect(screen.getByText("180")).toBeTruthy()
  expect(screen.queryByRole("button", { name: /Cập nhật trạng thái/ })).toBeNull()
})
it("admin confirms a valid transition for an assigned order", async () => {
  let current: Order = { ...order, userId: "b".repeat(24) }
  const writes: unknown[] = []
  api.defaults.adapter = async config => {
    if (config.method === "patch") { const input = JSON.parse(config.data); writes.push(input); current = { ...order, orderStatus: input.orderStatus, userId: input.userId } }
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: config.url === "/orders" ? [current] : current, pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } }
  }
  setup()
  fireEvent.click(await screen.findByRole("button", { name: `Cập nhật trạng thái ${id}` }))
  const select = screen.getByLabelText("Trạng thái mới")
  expect(Array.from((select as HTMLSelectElement).options).map(option => option.text)).toEqual(["Chọn trạng thái", "Đang xử lý", "Bị từ chối"])
  fireEvent.change(select, { target: { value: "2" } })
  expect((screen.getByRole("button", { name: "Xác nhận" }) as HTMLButtonElement).disabled).toBe(false)
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }))
  await waitFor(() => expect(writes).toEqual([{ orderStatus: 2 }]))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  await waitFor(() => expect(screen.getAllByText("Đang xử lý")).toHaveLength(2))
})
it("admin deletes rejected orders after confirmation and returns to the list", async () => {
  const deleted: string[] = []
  api.defaults.adapter = async config => {
    if (config.method === "delete") deleted.push(config.url!)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: config.url === "/orders" ? [] : { ...order, orderStatus: 3 }, pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } }
  }
  setup("admin", `/auth/orders/${id}`)
  fireEvent.click(await screen.findByRole("button", { name: `Xóa đơn hàng ${id}` }))
  expect(deleted).toEqual([])
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }))
  await screen.findByText("Không tìm thấy đơn hàng.")
  expect(deleted).toEqual([`/orders/${id}`])
})
it("status filtering resets pagination and sends only supported query parameters", async () => {
  const calls: unknown[] = []
  api.defaults.adapter = async config => { calls.push(config.params); return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } } }
  setup("staff", "/auth/orders?page=3&limit=20&search=ignored")
  await screen.findByText("Không tìm thấy đơn hàng.")
  expect(calls[0]).toEqual({ page: 3, limit: 20, search: "ignored" })
  fireEvent.change(screen.getByLabelText("Trạng thái"), { target: { value: "4" } })
  await waitFor(() => expect(calls.at(-1)).toEqual({ page: 1, limit: 20, orderStatus: 4, search: "ignored" }))
})
it("shows API errors and allows retry", async () => {
  let fail = true
  api.defaults.adapter = async config => {
    if (fail) throw new AxiosError("Không có thông tin", "ERR_BAD_RESPONSE", config, undefined, { config, headers: new AxiosHeaders(), status: 503, statusText: "Không có thông tin", data: { message: "Try later" } })
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } }
  }
  setup()
  await screen.findByText("Try later")
  fail = false
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }))
  await screen.findByText("Không tìm thấy đơn hàng.")
})
it("rejects invalid detail IDs without sending a request", async () => {
  const adapter = vi.fn()
  api.defaults.adapter = adapter
  setup("admin", "/auth/orders/invalid")
  expect(screen.getByText("Mã định danh đơn hàng không hợp lệ.")).toBeTruthy()
  expect(adapter).not.toHaveBeenCalled()
})
it("rounds snapshot subtotals half up per line and rejects invalid money", () => {
  expect(orderItemSubtotal({ price: 1.005, discount: 0, quantity: 1 })).toBe(1.01)
  expect(orderItemSubtotal({ price: 25, discount: 10, quantity: 3 })).toBe(67.5)
  expect(orderItemSubtotal({ price: NaN, discount: 0, quantity: 1 })).toBeNull()
})
it("refreshes after a conflicting transition and prevents another invalid submission", async () => {
  let current: Order = { ...order, userId: "b".repeat(24) }
  let writes = 0
  api.defaults.adapter = async config => {
    if (config.method === "patch") {
      writes++
      current = { ...order, orderStatus: 4 }
      throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { config, headers: new AxiosHeaders(), status: 409, statusText: "Conflict", data: { message: "Order changed; please retry" } })
    }
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: config.url === "/orders" ? [current] : current, pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } }
  }
  setup()
  fireEvent.click(await screen.findByRole("button", { name: `Cập nhật trạng thái ${id}` }))
  fireEvent.change(screen.getByLabelText("Trạng thái mới"), { target: { value: "3" } })
  fireEvent.change(screen.getByLabelText("Lý do hủy"), { target: { value: "Khách yêu cầu hủy" } })
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }))
  await screen.findByText("Order changed; please retry")
  await screen.findByText("Đơn hàng đã thay đổi. Vui lòng chọn trạng thái khả dụng.")
  expect((screen.getByRole("button", { name: "Xác nhận" }) as HTMLButtonElement).disabled).toBe(true)
  expect(writes).toBe(1)
})
it("renders loading while the order request is pending", () => {
  api.defaults.adapter = () => new Promise(() => {})
  setup()
  expect(screen.getByRole("status", { name: "Đang tải đơn hàng" })).toBeTruthy()
})
it("staff claims an unassigned pending order through the restricted start endpoint", async () => {
  let current: Order = { ...order, userId: "b".repeat(24) }
  const writes: { url: string | undefined; body: unknown }[] = []
  api.defaults.adapter = async config => {
    if (config.method === "patch") { writes.push({ url: config.url, body: JSON.parse(config.data) }); current = { ...order, orderStatus: 2, userId: "b".repeat(24) } }
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: config.url === "/orders" ? [current] : current, pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } }
  }
  setup("staff")
  fireEvent.click(await screen.findByRole("button", { name: "Nhận đơn & bắt đầu" }))
  expect(screen.queryByRole("dialog")).toBeNull()
  await waitFor(() => expect(writes).toEqual([{ url: `/orders/${id}/start`, body: {} }]))
  await waitFor(() => expect(screen.queryByRole("button", { name: "Nhận đơn & bắt đầu" })).toBeNull())
  expect(screen.getByRole("button", { name: /Cập nhật trạng thái/ })).toBeTruthy()
})
it("admin selects an active staff handler and starts the order", async () => {
  const handlerId = "c".repeat(24)
  const writes: unknown[] = []
  api.defaults.adapter = async config => {
    if (config.method === "patch") writes.push(JSON.parse(config.data))
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: config.url === "/users" ? [{ _id: handlerId, firstName: "Handler", lastName: "Staff", email: "staff@example.com", active: true, role: "staff" }] : config.url === "/orders" ? [order] : order, pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } }
  }
  setup()
  fireEvent.click(await screen.findByRole("button", { name: "Phân công và bắt đầu" }))
  fireEvent.click(await screen.findByRole("radio", { name: /Handler Staff/ }))
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận bắt đầu" }))
  await waitFor(() => expect(writes).toEqual([{ userId: handlerId }]))
})
it("date filters send full local-day bounds and reset pagination", async () => {
  const requests: unknown[] = []
  api.defaults.adapter = async config => { requests.push(config.params); return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } } }
  setup("staff", "/auth/orders?page=3&dateFrom=2026-10-01&dateTo=2026-10-02")
  await screen.findByText("Không tìm thấy đơn hàng.")
  fireEvent.click(screen.getByRole("button", { name: "Áp dụng khoảng ngày" }))
  await waitFor(() => expect(requests.at(-1)).toEqual({ page: 1, limit: 10, dateFrom: orderDateBoundary("2026-10-01"), dateTo: orderDateBoundary("2026-10-02", true) }))
  fireEvent.click(screen.getByRole("button", { name: "Xóa khoảng ngày" }))
  await waitFor(() => expect(requests.at(-1)).toEqual({ page: 1, limit: 10 }))
})
it("selects dates through the shadcn calendar popover", async () => {
  const apply = vi.fn()
  render(<OrderDateFilter initialFrom="2026-10-01" initialTo="2026-10-03" onApply={apply} />)
  fireEvent.click(screen.getByRole("button", { name: "Ngày đặt hàng từ" }))
  const grid = await screen.findByRole("grid")
  fireEvent.click(within(grid).getByText("2"))
  fireEvent.click(screen.getByRole("button", { name: "Áp dụng khoảng ngày" }))
  expect(apply).toHaveBeenCalledWith("2026-10-02", "2026-10-03")
})

it("shows the readable code while retaining MongoDB IDs for links and requests", async () => {
  mockOrder({ ...order, orderCode: "ORD-A7K9M2" })
  setup("staff")
  const link = await screen.findByRole("link", { name: "ORD-A7K9M2" })
  expect(link.getAttribute("href")).toBe(`/auth/orders/${id}`)
  fireEvent.click(link)
  await screen.findByRole("heading", { name: "Đơn hàng ORD-A7K9M2" })
})
it("searches by code or phone, resets page and preserves other filters", async () => {
  const requests: unknown[] = []
  api.defaults.adapter = async config => { requests.push(config.params); return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } } }
  setup("staff", "/auth/orders?page=3&orderStatus=1")
  await screen.findByText("Không tìm thấy đơn hàng.")
  fireEvent.change(screen.getByLabelText("Mã đơn hàng hoặc số điện thoại khách hàng"), { target: { value: " ORD-A7K9M2 " } })
  fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }))
  await waitFor(() => expect(requests.at(-1)).toEqual({ page: 1, limit: 10, orderStatus: 1, search: "ORD-A7K9M2" }))
  fireEvent.change(screen.getByLabelText("Mã đơn hàng hoặc số điện thoại khách hàng"), { target: { value: "0901234567" } })
  fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }))
  await waitFor(() => expect(requests.at(-1)).toEqual({ page: 1, limit: 10, orderStatus: 1, search: "0901234567" }))
  fireEvent.click(screen.getByRole("button", { name: "Xóa tìm kiếm" }))
  await waitFor(() => expect(requests.at(-1)).toEqual({ page: 1, limit: 10, orderStatus: 1 }))
})
it("assigned staff can update scheduling without changing order status or snapshots", async () => {
  let current: Order = { ...order, orderStatus: 2, userId: "b".repeat(24), requireDate: "2026-10-25T10:00:00Z", plannedShippingDate: "2026-10-24T10:00:00Z" }
  const writes: { url?: string; input: unknown }[] = []
  api.defaults.adapter = async config => {
    if (config.method === "patch") { writes.push({ url: config.url, input: JSON.parse(config.data) }); current = { ...current, requireDate: undefined } }
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: current } }
  }
  setup("staff", `/auth/orders/${id}`)
  fireEvent.click(await screen.findByRole("button", { name: "Chỉnh sửa ngày" }))
  fireEvent.click(screen.getByRole("button", { name: "Xóa ngày yêu cầu" }))
  fireEvent.click(screen.getByRole("button", { name: "Lưu ngày" }))
  await waitFor(() => expect(writes).toEqual([{ url: `/orders/${id}/dates`, input: { requireDate: null, plannedShippingDate: orderDateBoundary("2026-10-24", true) } }]))
})
it("unassigned staff cannot edit order dates", async () => {
  mockOrder()
  setup("staff", `/auth/orders/${id}`)
  await screen.findByText("OLD-SKU")
  expect(screen.queryByRole("button", { name: "Chỉnh sửa ngày" })).toBeNull()
})

it("shows purchase names and options independently of current product names", async () => {
  mockOrder({ ...order, orderItems: [{ ...order.orderItems[0], productName: "Purchased name", variantName: "Purchased variant", selectedOptions: { color: "Black" }, productId: { _id: id, product_name: "Renamed now" } }] })
  setup("staff", `/auth/orders/${id}`)
  expect(await screen.findByText("Purchased name")).toBeTruthy()
  expect(screen.getByText("Purchased variant")).toBeTruthy()
  expect(screen.getByText("color: Black")).toBeTruthy()
  expect(screen.getByText("Tên hiện tại: Renamed now")).toBeTruthy()
})

it("reassigns a Processing order without changing its status", async () => {
  const nextHandler = "c".repeat(24)
  const writes = vi.fn()
  let current: Order = { ...order, orderStatus: 2, userId: "d".repeat(24) }
  api.defaults.adapter = async config => {
    if (config.method === "patch") { writes(config.url, JSON.parse(config.data)); current = { ...current, userId: nextHandler } }
    const data = config.url === "/users" ? [{ _id: nextHandler, firstName: "New", lastName: "Handler", email: "handler@example.com", active: true, role: "staff" }] : current
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data, pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } }
  }
  setup("admin", `/auth/orders/${id}`)
  fireEvent.click(await screen.findByRole("button", { name: "Đổi người xử lý" }))
  fireEvent.click(await screen.findByRole("radio", { name: "New Handler (handler@example.com)" }))
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận đổi nhân viên" }))
  await waitFor(() => expect(writes).toHaveBeenCalledWith(`/orders/${id}/assignee`, { userId: nextHandler }))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(current.orderStatus).toBe(2)
  expect(current.totalAmount).toBe(order.totalAmount)
})
