import { authApi } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { ArticleType, PublicArticle, PublicArticlesResult } from "@/features/storefront/types/article"

export async function listPublicArticles(
  type: ArticleType,
  limit = 3,
  signal?: AbortSignal,
): Promise<PublicArticlesResult> {
  const { data } = await authApi.get<ApiResponse<PublicArticle[]> & Pick<PublicArticlesResult, "pagination">>(
    "/articles/public",
    { params: { type, page: 1, limit, sort: "newest" }, signal },
  )
  return { data: data.data, pagination: data.pagination }
}

export async function getPublicArticle(slug: string, signal?: AbortSignal): Promise<PublicArticle> {
  const { data } = await authApi.get<ApiResponse<PublicArticle>>(
    `/articles/public/${encodeURIComponent(slug)}`,
    { signal },
  )
  return data.data
}
