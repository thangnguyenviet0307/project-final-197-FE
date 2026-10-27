import { useQuery } from "@tanstack/react-query"
import { listCustomerOrders } from "@/features/orders/services/customer-orders.service"
import { useAuthStore } from "@/stores/auth.store"

export function useCustomerOrders(page: number) {
  const user = useAuthStore(state => state.user)
  return useQuery({ queryKey: ["orders", "customer", user?.id, page], queryFn: ({ signal }) => listCustomerOrders(page, signal), enabled: user?.accountType === "customer" })
}
