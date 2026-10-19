import { api } from "@/services/api"
import type { ApiResponse } from "@/features/auth/types/auth"
import type { Order, OrdersQuery, OrdersResult, UpdateOrderStatusInput, UpdateOrderDatesInput } from "@/features/orders/types/orders"

export async function listOrders(params: OrdersQuery, signal?: AbortSignal): Promise<OrdersResult> {
  const { data } = await api.get<ApiResponse<Order[]> & Pick<OrdersResult, "pagination">>("/orders", { params, signal })
  return { data: data.data, pagination: data.pagination }
}
export async function getOrder(id: string, signal?: AbortSignal): Promise<Order> {
  const { data } = await api.get<ApiResponse<Order>>(`/orders/${encodeURIComponent(id)}`, { signal })
  return data.data
}
export async function updateOrderStatus({ id, input }: { id: string; input: UpdateOrderStatusInput }): Promise<Order> {
  const { data } = await api.patch<ApiResponse<Order>>(`/orders/${encodeURIComponent(id)}/status`, input)
  return data.data
}
export async function deleteOrder(id: string): Promise<void> { await api.delete(`/orders/${encodeURIComponent(id)}`) }
export async function updateOrderDates({ id, input }: { id: string; input: UpdateOrderDatesInput }): Promise<Order> {
  const { data } = await api.patch<ApiResponse<Order>>(`/orders/${encodeURIComponent(id)}/dates`, input)
  return data.data
}
export async function startOrder({ id, userId }: { id: string; userId?: string }): Promise<Order> {
  const { data } = await api.patch<ApiResponse<Order>>(`/orders/${encodeURIComponent(id)}/start`, userId ? { userId } : {})
  return data.data
}
