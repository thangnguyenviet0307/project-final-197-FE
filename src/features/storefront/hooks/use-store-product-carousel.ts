import { useInfiniteQuery } from "@tanstack/react-query"
import { listStoreProducts } from "@/features/storefront/services/catalog.service"
import type { ProductsQuery } from "@/features/products/types/products"

export function useStoreProductCarousel(filters: Partial<ProductsQuery>) {
  return useInfiniteQuery({
    queryKey: ["products", "public", "list", "carousel", filters],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => listStoreProducts({ ...filters, page: pageParam, limit: 8 }, signal),
    getNextPageParam: last => last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  })
}
