import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as service from "@/features/products/services/product-news.service"

export function useProductNews(id: string) {
  return useQuery({ queryKey: ["products", "news", "admin", id], queryFn: ({ signal }) => service.getProductNews(id, signal) })
}
export function usePublicProductNews(slug: string) {
  return useQuery({ queryKey: ["products", "public", "news", slug], queryFn: ({ signal }) => service.getPublicProductNews(slug, signal), enabled: !!slug })
}
export function useUpdateProductNews() {
  const client = useQueryClient()
  return useMutation({ mutationFn: service.updateProductNews, retry: false, meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["products"] }) },
  })
}
