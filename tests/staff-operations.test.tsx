import type { ReactNode } from "react"
import { afterEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AxiosHeaders } from "axios"
import { api } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"
import { InventoryEditor } from "@/features/products/components/inventory-editor"
import { OrderActions } from "@/features/orders/components/order-actions"
import CreateOrder from "@/pages/admin/orders/create"
import CustomersPage from "@/pages/admin/customers/index"
import BrandsPage from "@/pages/admin/brands/index"
import { OrderNoteEditor } from "@/features/orders/components/order-note-editor"
import type { Order } from "@/features/orders/types/orders"

vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: ReactNode }) => <main>{children}</main> }))
const adapter = api.defaults.adapter
const id = "a".repeat(24)
const customerId = "c".repeat(24)
const clients: QueryClient[] = []
afterEach(() => { api.defaults.adapter = adapter; clients.forEach(client => client.clear()); clients.length = 0; useAuthStore.getState().clearSession() })
function setup(view: ReactNode) {
  useAuthStore.getState().setSession({ id, name: "Staff", firstName: "Staff", lastName: "", email: "staff@example.com", role: "staff", mustChangePassword: false }, { accessToken: "test" })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  clients.push(client)
  return render(<QueryClientProvider client={client}><MemoryRouter>{view}</MemoryRouter></QueryClientProvider>)
}
function mockApi() {
  const writes = vi.fn()
  api.defaults.adapter = async config => {
    if (config.method !== "get") writes(config.method, config.url, JSON.parse(config.data))
    const data = config.url === "/customers" ? [{ _id: customerId, firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "0123456789", address: { street: "Street", city: "City", state: "State" } }]
      : config.url === "/products" ? [{ _id: id, product_name: "Phone", is_active: true, price: 100, stock: 5, variants: [] }]
      : { _id: id }
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data, pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } } }
  }
  return writes
}
it("staff saves stock without including product price or metadata", async () => {
  const writes = mockApi()
  setup(<InventoryEditor product={{ _id: id, __v: 2, product_name: "Phone", category: null, brand: null, model_year: 2026, stock: 5, price: 100 }} />)
  fireEvent.change(screen.getByLabelText("Tồn kho Sản phẩm"), { target: { value: "9" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu tồn kho" }))
  await waitFor(() => expect(writes).toHaveBeenCalledWith("patch", `/products/${id}/inventory`, { expectedVersion: 2, stock: 9 }))
})
it.each([1, 2, 3, 4] as const)("staff only sees status edits for own open orders in status %s", orderStatus => {
  mockApi()
  const order: Order = { _id: id, userId: id, customerId, orderStatus, orderDate: "2026-10-20", street: "Street", city: "City", state: "State", paymentType: 1, totalAmount: 100, orderItems: [] }
  setup(<OrderActions order={order} onDeleted={vi.fn()} />)
  expect(screen.queryByRole("button", { name: /Xóa đơn hàng/ })).toBeNull()
  if (orderStatus === 1 || orderStatus === 2) expect(screen.getByRole("button", { name: /Cập nhật trạng thái/ })).toBeTruthy()
  else expect(screen.queryByRole("button", { name: /Cập nhật trạng thái/ })).toBeNull()
})
it("staff can create a manual order with server-controlled prices", async () => {
  const writes = mockApi()
  setup(<Routes><Route path="/" element={<CreateOrder />} /><Route path="/orders/:id" element={<p>Created order detail</p>} /></Routes>)
  fireEvent.click(await screen.findByRole("button", { name: /Jane Doe/ }))
  fireEvent.click(await screen.findByRole("button", { name: /Phone · 100/ }))
  for (const [label, value] of [["street", "Street"], ["city", "City"], ["state", "State"]]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fireEvent.change(screen.getByLabelText("Order note"), { target: { value: "Gift wrap" } })
  fireEvent.click(screen.getByRole("button", { name: "Create order" }))
  await screen.findByText("Created order detail")
  expect(writes).toHaveBeenCalledWith("post", "/orders", { customerId, street: "Street", city: "City", state: "State", orderNote: "Gift wrap", paymentType: 1, orderItems: [{ productId: id, quantity: 1 }] })
})
it("staff can view brands without add, edit or delete actions", async () => {
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [{ _id: id, name: "Acme", slug: "acme", isActive: true }] } })
  setup(<BrandsPage />)
  await screen.findByText("Acme")
  expect(screen.queryByRole("link", { name: /Thêm thương hiệu/ })).toBeNull()
  expect(screen.queryByRole("button", { name: /Chỉnh sửa|Xóa/ })).toBeNull()
})
it("staff can edit notes on their own open order", async () => {
  const writes = mockApi()
  const order: Order = { _id: id, userId: id, customerId, orderStatus: 2, orderDate: "2026-10-20", street: "Street", city: "City", state: "State", paymentType: 1, totalAmount: 100, orderItems: [] }
  setup(<OrderNoteEditor order={order} />)
  fireEvent.change(screen.getByLabelText("Order note"), { target: { value: "Call before delivery" } })
  fireEvent.click(screen.getByRole("button", { name: "Save note" }))
  await waitFor(() => expect(writes).toHaveBeenCalledWith("patch", `/orders/${id}/note`, { orderNote: "Call before delivery" }))
})
it("staff can add customers and inspect history without edit, delete or export controls", async () => {
  mockApi()
  setup(<CustomersPage />)
  await screen.findByText("jane@example.com")
  expect(screen.getByRole("link", { name: "Lịch sử đơn hàng" }).getAttribute("href")).toBe(`/orders?customerId=${customerId}`)
  expect(screen.queryByRole("button", { name: /Delete Jane/ })).toBeNull()
  expect(screen.queryByRole("button", { name: /Edit/ })).toBeNull()
  expect(screen.queryByRole("button", { name: /Export/ })).toBeNull()
})
