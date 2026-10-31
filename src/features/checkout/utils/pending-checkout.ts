import { z } from "zod"
import { checkoutRecipientSchema } from "@/features/checkout/schemas/checkout-schema"
import type { CheckoutRequest } from "@/features/checkout/types/checkout"

const requestSchema = checkoutRecipientSchema.omit({ provinceCode: true, districtCode: true, wardCode: true }).extend({
  provinceCode: z.number().int().positive(), districtCode: z.number().int().positive(), wardCode: z.number().int().positive(),
  requestId: z.uuid(), paymentMethod: z.literal("cod"),
  items: z.array(z.object({ productId: z.string().min(1), variantId: z.string().min(1).optional(), quantity: z.number().int().positive().safe(), expectedUnitPrice: z.number().finite().nonnegative() })).min(1).max(100),
})
const key = (customerId: string) => `storefront-pending-checkout-v1:${customerId}`

// Session storage survives reload/navigation in this tab. No credentials are saved.
// Never discard an unresolved attempt just because it is old: it may have committed.
export type PendingCheckoutState = { status: "empty" } | { status: "pending"; request: CheckoutRequest } | { status: "unavailable" | "invalid" }
export function readPendingCheckout(customerId: string): PendingCheckoutState {
  let raw: string | null
  try { raw = sessionStorage.getItem(key(customerId)) }
  catch { return { status: "unavailable" } }
  if (raw === null) return { status: "empty" }
  try {
    return { status: "pending", request: requestSchema.parse(JSON.parse(raw)) }
  } catch { return { status: "invalid" } }
}
export function savePendingCheckout(customerId: string, request: CheckoutRequest) {
  const value = JSON.stringify(requestSchema.parse(request))
  const existing = readPendingCheckout(customerId)
  if (existing.status === "unavailable" || existing.status === "invalid") throw new Error("Chưa đọc được yêu cầu đặt hàng cũ. Vui lòng kiểm tra lại bộ nhớ phiên trước khi gửi.")
  if (existing.status === "pending" && JSON.stringify(existing.request) !== value) throw new Error("Có yêu cầu đặt hàng chưa được xác nhận. Vui lòng khôi phục yêu cầu đó trước.")
  try { sessionStorage.setItem(key(customerId), value) }
  catch { throw new Error("Không thể lưu yêu cầu đặt hàng để khôi phục khi mất kết nối. Vui lòng bật bộ nhớ phiên của trình duyệt rồi thử lại.") }
}
export function clearPendingCheckout(customerId: string, requestId: string) {
  const existing = readPendingCheckout(customerId)
  if (existing.status !== "pending" || existing.request.requestId !== requestId) return
  try { sessionStorage.removeItem(key(customerId)) } catch { /* A replay remains safe on the backend. */ }
}
