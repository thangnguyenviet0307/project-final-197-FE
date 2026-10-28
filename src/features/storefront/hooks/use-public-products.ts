import { useQuery } from "@tanstack/react-query"
import type { ProductsQuery } from "@/features/products/types/products"
import { getStoreProduct, listStoreProducts } from "@/features/storefront/services/catalog.service"

export function usePublicProducts(params: Partial<ProductsQuery>) {
  return useQuery({
    queryKey: ["storefront", "products", params],
    queryFn: ({ signal }) => listStoreProducts(params, signal),
  })
}

export function usePublicProduct(slug: string, enabled = true) {
  return useQuery({
    queryKey: ["storefront", "product", slug],
    queryFn: ({ signal }) => getStoreProduct(slug, signal),
    enabled: enabled && Boolean(slug),
  })
}
