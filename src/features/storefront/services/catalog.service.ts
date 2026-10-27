import { authApi } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { Product, ProductsQuery, ProductsResult } from "@/features/products/types/products"
import type { ProductMetrics, ProductReview } from "@/features/products/types/products"
import type { StoreReviewInput } from "@/features/storefront/schemas/store-review-schema"
export type StoreReview = Pick<ProductReview, "rating" | "comment" | "reviewerName" | "date" | "source">
export interface StoreReviewsResult { data: StoreReview[]; pagination: ProductsResult["pagination"] }
export async function listStoreProducts(params: Partial<ProductsQuery>, signal?: AbortSignal): Promise<ProductsResult> {
  const { data } = await authApi.get<ApiResponse<Product[]> & Pick<ProductsResult, "pagination">>("/products/public", { params, signal })
  return { data: data.data, pagination: data.pagination }
}
export async function getStoreProduct(slug: string, signal?: AbortSignal): Promise<Product> {
  const { data } = await authApi.get<ApiResponse<Product>>(`/products/public/${encodeURIComponent(slug)}`, { signal })
  return data.data
}

export async function getStoreMetrics(slug: string, signal?: AbortSignal): Promise<ProductMetrics> {
  const { data } = await authApi.get<ApiResponse<ProductMetrics>>(`/products/public/${encodeURIComponent(slug)}/metrics`, { signal })
  return data.data
}
export async function getStoreReviews(slug: string, page: number, signal?: AbortSignal): Promise<StoreReviewsResult> {
  const { data } = await authApi.get<StoreReviewsResult>(`/products/public/${encodeURIComponent(slug)}/reviews`, { params: { page, limit: 5 }, signal })
  return data
}
export async function getRelatedProducts(slug: string, signal?: AbortSignal): Promise<Product[]> {
  const { data } = await authApi.get<ApiResponse<Product[]>>(`/products/public/${encodeURIComponent(slug)}/related`, { signal })
  return data.data
}
export async function createStoreReview({ slug, input }: { slug: string; input: StoreReviewInput }): Promise<StoreReview> {
  const { data } = await authApi.post<ApiResponse<StoreReview>>(`/products/public/${encodeURIComponent(slug)}/reviews`, input)
  return data.data
}
