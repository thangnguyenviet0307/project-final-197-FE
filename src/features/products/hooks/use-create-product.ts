import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProduct } from "@/features/products/services/products.service"
export function useCreateProduct() {
  const client = useQueryClient()
  return useMutation({ mutationFn: createProduct, meta: { successMessage: "Tạo sản phẩm thành công." }, onSuccess: () => client.invalidateQueries({ queryKey: ["products"] }) })
}
