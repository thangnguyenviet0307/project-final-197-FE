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
export function readPendingCheckout(customerId?: string): CheckoutRequest | null {
  if (!customerId) return null
  try {
    const raw = sessionStorage.getItem(key(customerId))
    if (!raw) return null
    return requestSchema.parse(JSON.parse(raw))
  } catch { return null }
}
export function savePendingCheckout(customerId: string, request: CheckoutRequest) {
  try { sessionStorage.setItem(key(customerId), JSON.stringify(requestSchema.parse(request))) }
  catch { throw new Error("Không thể lưu yêu cầu đặt hàng để khôi phục khi mất kết nối. Vui lòng bật bộ nhớ phiên của trình duyệt rồi thử lại.") }
}
export function clearPendingCheckout(customerId: string) {
  try { sessionStorage.removeItem(key(customerId)) } catch { /* A replay remains safe on the backend. */ }
}
