import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { listProducts } from "@/features/products/services/products.service"
import type { ProductsQuery } from "@/features/products/types/products"
export function useProducts(params: ProductsQuery) {
  return useQuery({ queryKey: ["products", "list", params], queryFn: ({ signal }) => listProducts(params, signal), placeholderData: keepPreviousData })
}
