import type { ReactNode } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import { queryClient } from "@/services/query-client"
import { api, clearAuth } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"
import { OrderActions } from "@/features/orders/components/order-actions"
import { InventoryEditor } from "@/features/products/components/inventory-editor"
import { BrandTable } from "@/features/brands/components/data-table"
import type { Order } from "@/features/orders/types/orders"
const adapter = api.defaults.adapter
const id = "a".repeat(24)
beforeEach(() => { clearAuth(); useAuthStore.getState().setSession({ id, name: "Staff", firstName: "Staff", lastName: "Test", email: "staff@example.com", role: "staff", mustChangePassword: false }, { accessToken: "test" }) })
afterEach(() => { api.defaults.adapter = adapter; clearAuth() })
function setup(view: ReactNode) { render(<QueryClientProvider client={queryClient}><MemoryRouter>{view}</MemoryRouter></QueryClientProvider>) }
const order: Order = { _id: id, userId: id, customerId: null, orderStatus: 2, orderDate: "2026-10-20", street: "Street", city: "City", state: "State", paymentType: 1, totalAmount: 100, orderItems: [] }
it("staff can cancel an assigned order only with a reason", async () => {
  const writes = vi.fn()
  api.defaults.adapter = async config => { writes(config.url, JSON.parse(config.data)); return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: { ...order, orderStatus: 3 } } } }
  setup(<OrderActions order={order} onDeleted={vi.fn()} />)
  fireEvent.click(screen.getByRole("button", { name: /Cập nhật trạng thái/ }))
  fireEvent.change(screen.getByLabelText("Trạng thái mới"), { target: { value: "3" } })
  expect(screen.getByRole("button", { name: "Xác nhận" }).hasAttribute("disabled")).toBe(true)
  fireEvent.change(screen.getByLabelText("Lý do hủy"), { target: { value: "  Customer requested  " } })
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }))
  await waitFor(() => expect(writes).toHaveBeenCalledWith(`/orders/${id}/status`, { orderStatus: 3, cancellationReason: "Customer requested" }))
})
it("staff cannot edit another handler's order", () => {
  setup(<OrderActions order={{ ...order, userId: "b".repeat(24) }} onDeleted={vi.fn()} />)
  expect(screen.queryByRole("button", { name: /Cập nhật trạng thái|Xóa đơn hàng/ })).toBeNull()
})
it("staff saves stock with its version without sending catalog or price fields", async () => {
  const writes = vi.fn()
  const product = { _id: id, __v: 2, product_name: "Phone", category: null, brand: null, model_year: 2026, stock: 5, price: 100 }
  api.defaults.adapter = async config => { writes(config.url, JSON.parse(config.data)); return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: { ...product, stock: 9, __v: 3 } } } }
  setup(<InventoryEditor product={product} />)
  fireEvent.change(screen.getByLabelText("Tồn kho Sản phẩm"), { target: { value: "9" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu tồn kho" }))
  await waitFor(() => expect(writes).toHaveBeenCalledWith(`/products/${id}/inventory`, { expectedVersion: 2, stock: 9 }))
})
it("keeps the stock draft after a conflict", async () => {
  api.defaults.adapter = async config => { throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { config, headers: new AxiosHeaders(), status: 409, statusText: "Conflict", data: { message: "Product changed" } }) }
  setup(<InventoryEditor product={{ _id: id, __v: 2, product_name: "Phone", category: null, brand: null, model_year: 2026, variants: [{ _id: "b".repeat(24), sku: "PHONE-1", price: 1, stock: 2 }] }} />)
  fireEvent.change(screen.getByLabelText("Tồn kho PHONE-1"), { target: { value: "8" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu tồn kho" }))
  await screen.findByRole("alert")
  expect(screen.getByLabelText("Tồn kho PHONE-1")).toHaveProperty("value", "8")
})
it("staff sees brands without mutation controls", () => {
  setup(<BrandTable brands={[{ _id: id, name: "Acme", slug: "acme", isActive: true, isDeleted: false }]} searchQuery="" onSearch={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
  expect(screen.getByText("Acme")).toBeTruthy()
  expect(screen.queryByRole("link", { name: /Thêm thương hiệu/ })).toBeNull()
  expect(screen.queryByRole("button", { name: /Chỉnh sửa|Xóa/ })).toBeNull()
})
