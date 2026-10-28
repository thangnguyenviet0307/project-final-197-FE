import { useQuery } from "@tanstack/react-query"
import type { ProductsQuery } from "@/features/products/types/products"
import { listStoreProducts } from "@/features/storefront/services/catalog.service"

export function useStoreFilterCount(params: Partial<ProductsQuery>, enabled: boolean) {
  return useQuery({
    queryKey: ["products", "public", "filter-count", params],
    queryFn: async ({ signal }) => (await listStoreProducts({ ...params, page: 1, limit: 1 }, signal)).pagination.total,
    enabled,
    retry: false,
    staleTime: 0,
  })
}
