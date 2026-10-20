import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProduct } from "@/features/products/services/products.service"
export function useUpdateProduct() {
  const client = useQueryClient()
  return useMutation({ mutationFn: updateProduct, meta: { successMessage: "Product updated successfully." }, onSuccess: () => Promise.all([
    client.invalidateQueries({ queryKey: ["products"] }),
    client.invalidateQueries({ queryKey: ["orders"] }),
  ]) })
}
