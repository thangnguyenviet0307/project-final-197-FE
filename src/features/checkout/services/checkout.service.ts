import { api } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { CheckoutProvince, CheckoutRequest, CheckoutResult } from "@/features/checkout/types/checkout"
export async function getCheckoutLocations(signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<CheckoutProvince[]>>("/customer-auth/checkout-locations", { signal, timeout: 25000 })
  return data.data
}
export async function createCheckout(input: CheckoutRequest) {
  const { data } = await api.post<ApiResponse<CheckoutResult>>("/customer-auth/orders", input, { timeout: 45000 })
  return data.data
}
