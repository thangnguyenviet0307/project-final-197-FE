import { api } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { ProductMetrics, ProductReview, ProductReviewInput, ProductReviewsResult } from "@/features/products/types/products"

const productPath = (id: string) => `/products/${encodeURIComponent(id)}`
export async function getProductMetrics(id: string, signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<ProductMetrics>>(`${productPath(id)}/metrics`, { signal })
  return data.data
}
export async function listProductReviews(id: string, page: number, signal?: AbortSignal): Promise<ProductReviewsResult> {
  const { data } = await api.get<ApiResponse<ProductReview[]> & Pick<ProductReviewsResult, "pagination">>(`${productPath(id)}/reviews`, { params: { page, limit: 5 }, signal })
  return { data: data.data, pagination: data.pagination }
}
export async function createProductReview({ id, input }: { id: string; input: ProductReviewInput }) {
  const { data } = await api.post<ApiResponse<ProductReview>>(`${productPath(id)}/reviews`, input)
  return data.data
}
export async function deleteProductReview({ id, reviewId }: { id: string; reviewId: string }) {
  await api.delete(`${productPath(id)}/reviews/${encodeURIComponent(reviewId)}`)
}
