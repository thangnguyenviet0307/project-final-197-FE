import { beforeEach, expect, it, vi } from "vitest"
import { api, authApi } from "@/services/api"
import { createCheckout } from "@/features/checkout/services/checkout.service"
import type { CheckoutRequest } from "@/features/checkout/types/checkout"

vi.mock("@/services/api", () => ({ api: { post: vi.fn() }, authApi: { post: vi.fn() } }))
const input: CheckoutRequest = { requestId: "6cd69eca-bd4e-48bf-ae73-3b31b233f190", recipientName: "Khách", phone: "0901234567", provinceCode: 1, districtCode: 2, wardCode: 3, street: "12 Đường A", note: "", paymentMethod: "cod", items: [{ productId: "a".repeat(24), quantity: 1, expectedUnitPrice: 100 }] }
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.post).mockResolvedValue({ data: { data: { _id: "a".repeat(24), orderCode: "ORD-ABC234", totalAmount: 100, orderStatus: 1 } } })
  vi.mocked(authApi.post).mockResolvedValue({ data: { data: { _id: "a".repeat(24), orderCode: "ORD-ABC234", totalAmount: 100, orderStatus: 1 } } })
})
it("sends guest checkout through the public endpoint without credentials or auth refresh", async () => {
  await createCheckout(input, true)
  expect(authApi.post).toHaveBeenCalledWith("/storefront/checkout", input, { timeout: 45000, withCredentials: false })
  expect(api.post).not.toHaveBeenCalled()
})
it("retains the authenticated customer endpoint", async () => {
  await createCheckout(input)
  expect(api.post).toHaveBeenCalledWith("/customer-auth/orders", input, { timeout: 45000 })
  expect(authApi.post).not.toHaveBeenCalled()
})

it("rejects malformed confirmations for customer and guest checkout", async () => {
  vi.mocked(api.post).mockResolvedValue({ data: { data: { totalAmount: 0 } } })
  vi.mocked(authApi.post).mockResolvedValue({ data: { data: { totalAmount: 0 } } })
  await expect(createCheckout(input)).rejects.toThrow()
  await expect(createCheckout(input, true)).rejects.toThrow()
})
