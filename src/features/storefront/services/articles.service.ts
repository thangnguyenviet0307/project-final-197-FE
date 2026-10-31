import { authApi } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { ArticleType, PublicArticle, PublicArticlesResult, PublicArticleCategory } from "@/features/storefront/types/article"

export async function listPublicArticles(
  type: ArticleType,
  limit = 3,
  signal?: AbortSignal,
  options: { page?: number; categoryId?: string; search?: string; featured?: boolean; sort?: "newest" | "popular" } = {},
): Promise<PublicArticlesResult> {
  const { data } = await authApi.get<ApiResponse<PublicArticlesResult["data"]> & Pick<PublicArticlesResult, "pagination">>(
    "/articles/public",
    { params: { summary: true, type, page: options.page ?? 1, limit, categoryId: options.categoryId, search: options.search, isFeatured: options.featured ? true : undefined, sort: options.featured ? "display" : options.sort ?? "newest" }, signal },
  )
  return { data: data.data, pagination: data.pagination }
}

export async function getPublicArticleCategories(signal?: AbortSignal): Promise<PublicArticleCategory[]> {
  const { data } = await authApi.get<ApiResponse<PublicArticleCategory[]>>("/articles/public/category-options", { signal })
  return data.data
}

export async function getPublicArticle(slug: string, signal?: AbortSignal): Promise<PublicArticle> {
  const { data } = await authApi.get<ApiResponse<PublicArticle>>(
    `/articles/public/${encodeURIComponent(slug)}`,
    { signal },
  )
  return data.data
}

export async function recordArticleView(slug: string): Promise<void> {
  await authApi.post(`/articles/public/${encodeURIComponent(slug)}/views`, {})
}
