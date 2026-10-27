import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProductFlags } from "@/features/products/services/products.service"
export function useUpdateProductFlags() {
  const client = useQueryClient()
  return useMutation({ mutationFn: updateProductFlags, onSuccess: () => client.invalidateQueries({ queryKey: ["products"] }), meta: { suppressGlobalErrorToast: true } })
}
