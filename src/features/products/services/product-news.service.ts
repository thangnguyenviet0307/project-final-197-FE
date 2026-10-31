import { api, authApi } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { ProductNewsArticle, ProductNewsSelection } from "@/features/products/types/product-news"

export async function getProductNews(id: string, signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<ProductNewsSelection>>(`/products/${encodeURIComponent(id)}/news`, { signal })
  return data.data
}
export async function updateProductNews({ id, input }: { id: string; input: Pick<ProductNewsSelection, "articleIds" | "expectedVersion"> }) {
  const { data } = await api.patch<ApiResponse<Pick<ProductNewsSelection, "articleIds" | "expectedVersion">>>(`/products/${encodeURIComponent(id)}/news`, input)
  return data.data
}
export async function getPublicProductNews(slug: string, signal?: AbortSignal) {
  const { data } = await authApi.get<ApiResponse<ProductNewsArticle[]>>(`/products/public/${encodeURIComponent(slug)}/news`, { signal })
  return data.data
}
