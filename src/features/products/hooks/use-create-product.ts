import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProduct } from "@/features/products/services/products.service"
export function useCreateProduct() {
  const client = useQueryClient()
  return useMutation({ mutationFn: createProduct, meta: { successMessage: "Product created successfully." }, onSuccess: () => client.invalidateQueries({ queryKey: ["products"] }) })
}
