import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { cancelCustomerOrder, listCustomerOrders } from "@/features/orders/services/customer-orders.service"
import { useAuthStore } from "@/stores/auth.store"

export function useCustomerOrders(page: number) {
  const user = useAuthStore(state => state.user)
  return useQuery({ queryKey: ["orders", "customer", user?.id, page], queryFn: ({ signal }) => listCustomerOrders(page, signal), enabled: user?.accountType === "customer" })
}

export function useCancelCustomerOrder() {
  const client = useQueryClient()
  return useMutation({ mutationFn: cancelCustomerOrder, meta: { successMessage: "Đã hủy đơn hàng." },
    onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: ["orders"] }), client.invalidateQueries({ queryKey: ["products"] })]),
    onError: () => { void client.invalidateQueries({ queryKey: ["orders"] }) },
  })
}
