import type { ReactNode } from "react"
import { afterEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AxiosHeaders } from "axios"
import CreateOrderPage from "@/pages/admin/orders/create"
import { adminOrderAddressSchema } from "@/features/orders/schemas/admin-order-schema"
import { api } from "@/services/api"

vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: ReactNode }) => <main>{children}</main> }))
vi.mock("@/features/customers/services/customers.service", () => ({ customersService: { getCustomers: async () => ({ data: [{ _id: "a".repeat(24), first_name: "An", last_name: "Nguyen", phone: "0901234567" }], pagination: { totalPages: 1 } }) } }))
vi.mock("@/features/products/hooks/use-products", () => ({ useProducts: () => ({ data: { data: [{ _id: "b".repeat(24), product_name: "Cable", price: 100, stock: 3, is_active: true }], pagination: { totalPages: 1 } } }) }))
const original = api.defaults.adapter
afterEach(() => { api.defaults.adapter = original })

it.each([["street", 255], ["city", 50], ["state", 50]] as const)("validates the backend boundary for %s", (field, limit) => {
  const address = { street: "Street", city: "City", state: "State" }
  expect(adminOrderAddressSchema.safeParse({ ...address, [field]: "x".repeat(limit) }).success).toBe(true)
  expect(adminOrderAddressSchema.safeParse({ ...address, [field]: "x".repeat(limit + 1) }).success).toBe(false)
})

it("blocks an overlong address before HTTP, keeps the draft and submits corrected values", async () => {
  const writes: unknown[] = []
  api.defaults.adapter = async config => {
    writes.push(JSON.parse(config.data))
    return { config, status: 200, statusText: "OK", headers: new AxiosHeaders(), data: { data: { _id: "c".repeat(24) } } }
  }
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const view = render(<QueryClientProvider client={client}><MemoryRouter initialEntries={["/auth/orders/new"]}><Routes>
    <Route path="/auth/orders/new" element={<CreateOrderPage />} />
    <Route path="/auth/orders/:id" element={<p>Saved order</p>} />
  </Routes></MemoryRouter></QueryClientProvider>)
  fireEvent.click(await screen.findByRole("button", { name: /^An Nguyen/ }))
  fireEvent.click(screen.getByRole("button", { name: /^Cable/ }))
  expect(screen.getByLabelText("street").getAttribute("maxlength")).toBe("255")
  expect(screen.getByLabelText("city").getAttribute("maxlength")).toBe("50")
  expect(screen.getByLabelText("state").getAttribute("maxlength")).toBe("50")
  fireEvent.change(screen.getByLabelText("street"), { target: { value: "Street" } })
  fireEvent.change(screen.getByLabelText("state"), { target: { value: "State" } })
  fireEvent.change(screen.getByLabelText("city"), { target: { value: "x".repeat(51) } })
  fireEvent.submit(screen.getByRole("button", { name: "Create order" }).closest("form")!)
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Thành phố tối đa 50 ký tự.")
  expect(writes).toHaveLength(0)
  expect((screen.getByLabelText("city") as HTMLInputElement).value).toHaveLength(51)
  fireEvent.change(screen.getByLabelText("city"), { target: { value: "x".repeat(50) } })
  fireEvent.submit(screen.getByRole("button", { name: "Create order" }).closest("form")!)
  await waitFor(() => expect(screen.getByText("Saved order")).toBeTruthy())
  expect(writes).toHaveLength(1)
  view.unmount(); client.clear()
})
