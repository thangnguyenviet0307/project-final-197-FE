import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cancelCustomerOrder } from "@/features/orders/services/customer-orders.service"
import { getApiError } from "@/services/api"

export function useCancelCustomerOrder() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: cancelCustomerOrder,
    retry: false,
    meta: { suppressGlobalErrorToast: true, successMessage: "Đã hủy đơn hàng." },
    onSuccess: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: ["orders"] }), client.invalidateQueries({ queryKey: ["products"] })])
    },
    onError: error => {
      if (getApiError(error).statusCode === 409) void client.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
