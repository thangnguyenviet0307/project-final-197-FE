import { api } from "@/services/api"
import type { CustomerOrdersResult } from "@/features/orders/types/customer-orders"

export async function listCustomerOrders(page: number, signal?: AbortSignal): Promise<CustomerOrdersResult> {
  const { data } = await api.get<CustomerOrdersResult>("/customer-auth/orders", { params: { page, limit: 10 }, signal })
  return data
}

export async function cancelCustomerOrder({ id, cancellationReason }: { id: string; cancellationReason: string }) {
  await api.patch(`/customer-auth/orders/${encodeURIComponent(id)}/cancel`, { cancellationReason })
}
