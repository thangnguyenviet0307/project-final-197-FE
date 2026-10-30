import { afterEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrderNoteEditor } from "@/features/orders/components/order-note-editor"
import { useAuthStore } from "@/stores/auth.store"
import { api } from "@/services/api"
import type { Order } from "@/features/orders/types/orders"
import { AxiosError, AxiosHeaders } from "axios"

const order: Order = { _id: "a".repeat(24), customerId: null, orderStatus: 1, orderDate: "2026-10-30", street: "Street", city: "City", state: "State", paymentType: 1, totalAmount: 0, orderItems: [], orderNote: "Original" }
afterEach(() => { vi.restoreAllMocks(); useAuthStore.setState({ user: null }) })
function setup() {
  useAuthStore.setState({ user: { id: "admin", role: "admin", name: "Admin", firstName: "Admin", lastName: "", email: "a@example.com", mustChangePassword: false } })
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const view = (value: Order) => <QueryClientProvider client={client}><OrderNoteEditor key={value._id} order={value} /></QueryClientProvider>
  return { ...render(view(order)), view }
}
it("preserves dirty notes and requires a conflict decision before saving", async () => {
  const patch = vi.spyOn(api, "patch").mockResolvedValue({ data: {} })
  const { rerender, view } = setup()
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "My draft" } })
  rerender(view({ ...order, orderNote: "Other admin" }))
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("My draft")
  expect((screen.getByRole("button", { name: "Save note" }) as HTMLButtonElement).disabled).toBe(true)
  expect(patch).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole("button", { name: "Giữ bản nháp của tôi" }))
  fireEvent.click(screen.getByRole("button", { name: "Save note" }))
  await waitFor(() => expect(patch).toHaveBeenCalledWith(`/orders/${order._id}/note`, { orderNote: "My draft", expectedOrderNote: "Other admin" }))
})
it("syncs pristine notes and discards a dirty draft only by explicit choice", () => {
  const { rerender, view } = setup()
  rerender(view({ ...order, orderNote: "New" }))
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("New")
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Draft" } })
  rerender(view({ ...order, orderNote: "Latest" }))
  fireEvent.click(screen.getByRole("button", { name: "Dùng ghi chú mới" }))
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Latest")
  rerender(view({ ...order, _id: "b".repeat(24), orderNote: "Different order" }))
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Different order")
})
it("retains the draft after a failed save", async () => {
  vi.spyOn(api, "patch").mockRejectedValue(new Error("Offline"))
  setup()
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Keep me" } })
  fireEvent.click(screen.getByRole("button", { name: "Save note" }))
  await screen.findByRole("alert")
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Keep me")
})

it("blocks retries after a server conflict until the latest note is reviewed explicitly", async () => {
  const patch = vi.spyOn(api, "patch").mockRejectedValue(new AxiosError("Conflict", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 409, statusText: "Conflict", headers: new AxiosHeaders(), config: { headers: new AxiosHeaders() },
    data: { code: "ORDER_NOTE_CONFLICT", message: "Order note changed; refresh and review before saving" },
  }))
  const { rerender, view } = setup()
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "My draft" } })
  fireEvent.click(screen.getByRole("button", { name: "Save note" }))
  await screen.findByRole("button", { name: "Giữ bản nháp của tôi" })
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("My draft")
  expect((screen.getByRole("button", { name: "Save note" }) as HTMLButtonElement).disabled).toBe(true)
  expect(patch).toHaveBeenCalledWith(`/orders/${order._id}/note`, { orderNote: "My draft", expectedOrderNote: "Original" })
  rerender(view({ ...order, orderNote: "Other admin" }))
  fireEvent.click(screen.getByRole("button", { name: "Giữ bản nháp của tôi" }))
  patch.mockResolvedValue({ data: {} })
  fireEvent.click(screen.getByRole("button", { name: "Save note" }))
  await waitFor(() => expect(patch).toHaveBeenLastCalledWith(`/orders/${order._id}/note`, { orderNote: "My draft", expectedOrderNote: "Other admin" }))
})
