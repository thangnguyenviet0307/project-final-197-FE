import { useQuery } from "@tanstack/react-query"
import { getProduct } from "@/services/products.service"
export function useProduct(id: string) {
  return useQuery({ queryKey: ["products", "detail", id], queryFn: ({ signal }) => getProduct(id, signal), enabled: /^[a-f\d]{24}$/i.test(id) })
}
