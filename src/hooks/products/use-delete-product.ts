import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteProduct } from "@/services/products.service"
export function useDeleteProduct() {
  const client = useQueryClient()
  return useMutation({ mutationFn: deleteProduct, meta: { successMessage: "Product deleted successfully." }, onSuccess: (_data, id) => {
    client.removeQueries({ queryKey: ["products", "detail", id] })
    return client.invalidateQueries({ queryKey: ["products"] })
  } })
}
