import { afterEach, expect, it, vi } from "vitest"
import { readPendingCheckout, savePendingCheckout, clearPendingCheckout } from "@/features/checkout/utils/pending-checkout"
import type { CheckoutRequest } from "@/features/checkout/types/checkout"

afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear() })
const request = (): CheckoutRequest => ({
  requestId: crypto.randomUUID(), recipientName: "Fixture", phone: "0901234567",
  provinceCode: 1, districtCode: 2, wardCode: 3, street: "Fixture street", note: "", paymentMethod: "cod",
  items: [{ productId: "a".repeat(24), quantity: 1, expectedUnitPrice: 100 }],
})

it("distinguishes unreadable storage and refuses to replace an unresolved request after recovery", () => {
  const original = request()
  savePendingCheckout("guest", original)
  const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => { throw new DOMException("Unavailable", "SecurityError") })
  expect(readPendingCheckout("guest")).toEqual({ status: "unavailable" })
  spy.mockRestore()
  const replacement = request()
  expect(() => savePendingCheckout("guest", replacement)).toThrow()
  expect(readPendingCheckout("guest")).toEqual({ status: "pending", request: original })
  savePendingCheckout("guest", original)
})

it("preserves malformed pending data rather than replacing it", () => {
  sessionStorage.setItem("storefront-pending-checkout-v1:guest", '{"requestId":"unresolved",')
  expect(readPendingCheckout("guest")).toEqual({ status: "invalid" })
  const replacement = request()
  expect(() => savePendingCheckout("guest", replacement)).toThrow()
  expect(sessionStorage.getItem("storefront-pending-checkout-v1:guest")).toBe('{"requestId":"unresolved",')
})

it("clears only the matching confirmed request and isolates identities", () => {
  const original = request()
  savePendingCheckout("guest", original)
  savePendingCheckout("customer", request())
  clearPendingCheckout("guest", crypto.randomUUID())
  expect(readPendingCheckout("guest")).toEqual({ status: "pending", request: original })
  clearPendingCheckout("guest", original.requestId)
  expect(readPendingCheckout("guest")).toEqual({ status: "empty" })
  expect(readPendingCheckout("customer").status).toBe("pending")
})
