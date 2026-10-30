import { afterEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CancelCustomerOrder } from "@/features/orders/components/cancel-customer-order"
import { cancelCustomerOrder } from "@/features/orders/services/customer-orders.service"
import { personName } from "@/features/orders/utils/order-status"

vi.mock("@/features/orders/services/customer-orders.service", () => ({ cancelCustomerOrder: vi.fn(), listCustomerOrders: vi.fn() }))
afterEach(() => vi.resetAllMocks())

it("requires a reason, submits selected and custom reasons, and refreshes orders and stock", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const invalidate = vi.spyOn(client, "invalidateQueries")
  vi.mocked(cancelCustomerOrder).mockResolvedValue(undefined)
  render(<QueryClientProvider client={client}><CancelCustomerOrder id="order" /></QueryClientProvider>)
  fireEvent.click(screen.getByRole("button", { name: "Hủy đơn hàng" }))
  const confirm = screen.getByRole("button", { name: "Xác nhận hủy đơn" })
  expect((confirm as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByLabelText("Đổi ý, không còn nhu cầu"))
  fireEvent.change(screen.getByLabelText("Lý do khác"), { target: { value: " Thêm lý do " } })
  fireEvent.click(confirm)
  await waitFor(() => expect(cancelCustomerOrder).toHaveBeenCalledWith({ id: "order", cancellationReason: "Đổi ý, không còn nhu cầu; Thêm lý do" }, expect.anything()))
  await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["products"] }))
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ["orders"] })
  client.clear()
})

it("never prints undefined for a missing person name", () => {
  expect(personName({ firstName: undefined, lastName: undefined } as unknown as Parameters<typeof personName>[0])).not.toContain("undefined")
})
