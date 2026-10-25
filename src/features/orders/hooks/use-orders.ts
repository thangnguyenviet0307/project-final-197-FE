import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteOrder, getOrder, listOrders, updateOrderStatus, startOrder, updateOrderDates, reassignOrder } from "@/features/orders/services/orders.service"
import type { OrdersQuery } from "@/features/orders/types/orders"

export const orderKeys = { all: ["orders"] as const, list: (params: OrdersQuery) => ["orders", "list", params] as const, detail: (id: string) => ["orders", "detail", id] as const }
export function useOrders(params: OrdersQuery) {
  return useQuery({ queryKey: orderKeys.list(params), queryFn: ({ signal }) => listOrders(params, signal), placeholderData: keepPreviousData })
}
export function useOrder(id: string) {
  return useQuery({ queryKey: orderKeys.detail(id), queryFn: ({ signal }) => getOrder(id, signal), enabled: /^[a-f\d]{24}$/i.test(id) })
}
export function useStartOrder() {
  const client = useQueryClient()
  return useMutation({ mutationFn: startOrder, meta: { successMessage: "Đã phân công và bắt đầu xử lý đơn hàng." },
    onSuccess: () => client.invalidateQueries({ queryKey: orderKeys.all }),
    onError: () => { void client.invalidateQueries({ queryKey: orderKeys.all }) },
  })
}
export function useUpdateOrderDates() {
  const client = useQueryClient()
  return useMutation({ mutationFn: updateOrderDates, meta: { successMessage: "Đã cập nhật ngày của đơn hàng." },
    onSuccess: () => client.invalidateQueries({ queryKey: orderKeys.all }),
    onError: () => { void client.invalidateQueries({ queryKey: orderKeys.all }) },
  })
}
export function useUpdateOrderStatus() {
  const client = useQueryClient()
  return useMutation({ mutationFn: updateOrderStatus, meta: { successMessage: "Đã cập nhật trạng thái đơn hàng." },
    onSuccess: async (_order, { input }) => {
      await Promise.all([client.invalidateQueries({ queryKey: orderKeys.all }), ...(input.orderStatus === 3 ? [client.invalidateQueries({ queryKey: ["products"] })] : [])])
    },
    onError: () => { void client.invalidateQueries({ queryKey: orderKeys.all }) },
  })
}
export function useDeleteOrder() {
  const client = useQueryClient()
  return useMutation({ mutationFn: deleteOrder, meta: { successMessage: "Đã xóa đơn hàng." }, onSuccess: async (_data, id) => {
    client.removeQueries({ queryKey: orderKeys.detail(id), exact: true })
    await client.invalidateQueries({ queryKey: orderKeys.all })
  }, onError: () => { void client.invalidateQueries({ queryKey: orderKeys.all }) } })
}

export function useReassignOrder() {
  const client = useQueryClient()
  return useMutation({ mutationFn: reassignOrder, meta: { successMessage: "Đã đổi nhân viên xử lý đơn hàng." },
    onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: orderKeys.all }), client.invalidateQueries({ queryKey: ["users"] })]),
    onError: () => { void client.invalidateQueries({ queryKey: orderKeys.all }) },
  })
}
