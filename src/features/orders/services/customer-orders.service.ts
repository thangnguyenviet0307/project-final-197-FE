import { api } from "@/services/api"
import type { CustomerOrdersResult } from "@/features/orders/types/customer-orders"
import type { ApiResponse } from "@/types/api"
import type { CancelCustomerOrderInput } from "@/features/orders/schemas/customer-order-cancel-schema"

export async function listCustomerOrders(page: number, signal?: AbortSignal): Promise<CustomerOrdersResult> {
  const { data } = await api.get<CustomerOrdersResult>("/customer-auth/orders", { params: { page, limit: 10 }, signal })
  return data
}

export async function cancelCustomerOrder({ id, ...input }: CancelCustomerOrderInput & { id: string }) {
  const { data } = await api.patch<ApiResponse<{ _id: string; orderStatus: 3; cancelledByCustomer: true }>>(`/customer-auth/orders/${encodeURIComponent(id)}/cancel`, input)
  return data.data
}
