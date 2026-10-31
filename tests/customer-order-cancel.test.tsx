import { beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { AxiosError, AxiosHeaders } from "axios"
import OrdersPage from "@/pages/storefront/account/orders"
import { listCustomerOrders, cancelCustomerOrder } from "@/features/orders/services/customer-orders.service"
import { useAuthStore } from "@/stores/auth.store"
import type { CustomerOrder } from "@/features/orders/types/customer-orders"

vi.mock("@/features/orders/services/customer-orders.service", () => ({ listCustomerOrders: vi.fn(), cancelCustomerOrder: vi.fn() }))
const order: CustomerOrder = { _id: "a".repeat(24), orderCode: "ORD-ABC234", orderStatus: 1, orderDate: "2026-10-30T01:00:00Z", totalAmount: 180000, street: "12 Đường A", city: "Phường B", state: "Tỉnh C", orderItems: [{ productName: "Sản phẩm A", variantName: "Đen", quantity: 2, price: 100000, discount: 10 }] }
beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: { id: "customer", firstName: "An", lastName: "Nguyễn", name: "Nguyễn An", email: "test@example.com", accountType: "customer", mustChangePassword: false } })
  vi.mocked(listCustomerOrders).mockResolvedValue({ data: [order], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } })
})
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const invalidation = vi.spyOn(client, "invalidateQueries")
  render(<QueryClientProvider client={client}><MemoryRouter><OrdersPage /></MemoryRouter></QueryClientProvider>)
  return invalidation
}
it("uses distinct status colors and displays discounted item prices and server order total", async () => {
  vi.mocked(listCustomerOrders).mockResolvedValue({ data: [order, { ...order, _id: "b", orderStatus: 2 }, { ...order, _id: "c", orderStatus: 3, cancelledByCustomer: true }, { ...order, _id: "d", orderStatus: 4 }], pagination: { page: 1, limit: 10, total: 4, totalPages: 1 } })
  mount()
  await screen.findByText("Chờ xử lý")
  expect(screen.getByText("Chờ xử lý").className).toContain("amber")
  expect(screen.getByText("Đang xử lý").className).toContain("blue")
  expect(screen.getByText("Đã hủy").className).toContain("red")
  expect(screen.getByText("Hoàn tất").className).toContain("emerald")
  expect(screen.getAllByRole("button", { name: "Hủy đơn hàng" })).toHaveLength(1)
  expect(screen.getAllByText(/Đơn giá: 90.000 ₫/)).toHaveLength(4)
})
it("requires confirmation/reason, cancels once and refreshes orders/products", async () => {
  vi.mocked(cancelCustomerOrder).mockImplementation(async () => {
    vi.mocked(listCustomerOrders).mockResolvedValue({ data: [{ ...order, orderStatus: 3, cancelledByCustomer: true, cancellationReason: "Đổi địa chỉ" }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } })
    return { _id: order._id, orderStatus: 3, cancelledByCustomer: true }
  })
  const invalidation = mount()
  fireEvent.click(await screen.findByRole("button", { name: "Hủy đơn hàng" }))
  expect(cancelCustomerOrder).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận hủy" }))
  await screen.findByText("Vui lòng nhập lý do hủy đơn.")
  expect(cancelCustomerOrder).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText("Lý do hủy đơn"), { target: { value: " Đổi địa chỉ " } })
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận hủy" }))
  await screen.findByText("Đã hủy")
  expect(vi.mocked(cancelCustomerOrder).mock.calls[0][0]).toEqual({ id: order._id, cancellationReason: "Đổi địa chỉ" })
  expect(invalidation).toHaveBeenCalledWith({ queryKey: ["orders"] })
  expect(invalidation).toHaveBeenCalledWith({ queryKey: ["products"] })
})
it("keeping the order sends no request and failed cancellation preserves the reason", async () => {
  const config = { headers: new AxiosHeaders() }
  vi.mocked(cancelCustomerOrder).mockRejectedValue(new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { status: 409, statusText: "Conflict", headers: {}, config, data: { message: "Đơn hàng đã được xử lý. Vui lòng cập nhật lại." } }))
  mount()
  fireEvent.click(await screen.findByRole("button", { name: "Hủy đơn hàng" }))
  fireEvent.click(screen.getByRole("button", { name: "Giữ đơn hàng" }))
  expect(cancelCustomerOrder).not.toHaveBeenCalled()
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Hủy đơn hàng" }))
  fireEvent.change(screen.getByLabelText("Lý do hủy đơn"), { target: { value: "Không còn nhu cầu" } })
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận hủy" }))
  await screen.findByText("Đơn hàng đã được xử lý. Vui lòng cập nhật lại.")
  expect((screen.getByLabelText("Lý do hủy đơn") as HTMLTextAreaElement).value).toBe("Không còn nhu cầu")
})
