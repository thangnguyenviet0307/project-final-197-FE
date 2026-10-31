import { api, authApi } from "@/services/api"
import { checkoutResultSchema } from "@/features/checkout/schemas/checkout-schema"
import type { ApiResponse } from "@/types/api"
import type { CheckoutProvince, CheckoutRequest, CheckoutResult } from "@/features/checkout/types/checkout"
export async function getCheckoutLocations(signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<CheckoutProvince[]>>("/customer-auth/checkout-locations", { signal, timeout: 25000 })
  return data.data
}
export async function createCheckout(input: CheckoutRequest, guest = false) {
  const { data } = guest
    ? await authApi.post<ApiResponse<CheckoutResult>>("/storefront/checkout", input, { timeout: 45000, withCredentials: false })
    : await api.post<ApiResponse<CheckoutResult>>("/customer-auth/orders", input, { timeout: 45000 })
  return checkoutResultSchema.parse(data.data)
}
