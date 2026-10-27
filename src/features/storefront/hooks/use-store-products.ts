import { useRecordProductView } from "@/features/storefront/hooks/use-record-product-view"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getStoreProduct, listStoreProducts, getStoreMetrics, getStoreReviews, getRelatedProducts, createStoreReview } from "@/features/storefront/services/catalog.service"
import type { ProductsQuery } from "@/features/products/types/products"
export function useStoreProducts(params: Partial<ProductsQuery> = {}) {
  return useQuery({ queryKey: ["products", "public", "list", params], queryFn: ({ signal }) => listStoreProducts(params, signal) })
}
export function useStoreProduct(slug: string, visitKey = slug) {
  const query = useQuery({ queryKey: ["products", "public", "detail", slug], queryFn: ({ signal }) => getStoreProduct(slug, signal), enabled: slug.length >= 3 && slug.length <= 255, retry: false })
  useRecordProductView(slug, query.isSuccess, visitKey)
  return query
}
export function useStoreMetrics(slug: string) {
  return useQuery({ queryKey: ["products", "public", "metrics", slug], queryFn: ({ signal }) => getStoreMetrics(slug, signal) })
}
export function useStoreReviews(slug: string, page: number) {
  return useQuery({ queryKey: ["products", "public", "reviews", slug, page], queryFn: ({ signal }) => getStoreReviews(slug, page, signal) })
}
export function useRelatedProducts(slug: string) {
  return useQuery({ queryKey: ["products", "public", "related", slug], queryFn: ({ signal }) => getRelatedProducts(slug, signal) })
}
export function useCreateStoreReview() {
  const client = useQueryClient()
  return useMutation({ mutationFn: createStoreReview, onSuccess: () => client.invalidateQueries({ queryKey: ["products"] }), meta: { suppressGlobalErrorToast: true } })
}
