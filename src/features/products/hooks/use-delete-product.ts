import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteProduct } from "@/features/products/services/products.service"
export function useDeleteProduct() {
  const client = useQueryClient()
  return useMutation({ mutationFn: deleteProduct, meta: { successMessage: "Xóa sản phẩm thành công." }, onSuccess: (_data, id) => {
    client.removeQueries({ queryKey: ["products", "detail", id] })
    return client.invalidateQueries({ queryKey: ["products"] })
  } })
}
