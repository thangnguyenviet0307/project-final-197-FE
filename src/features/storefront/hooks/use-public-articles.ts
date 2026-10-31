import { useQuery } from "@tanstack/react-query"
import { getPublicArticle, listPublicArticles } from "@/features/storefront/services/articles.service"
import type { ArticleType } from "@/features/storefront/types/article"

export function usePublicArticles(type: ArticleType, limit = 3) {
  return useQuery({
    queryKey: ["articles", "public", "list", type, limit],
    queryFn: ({ signal }) => listPublicArticles(type, limit, signal),
  })
}

export function usePublicArticle(slug: string) {
  return useQuery({
    queryKey: ["articles", "public", "detail", slug],
    queryFn: ({ signal }) => getPublicArticle(slug, signal),
    enabled: slug.length >= 1 && slug.length <= 255,
    retry: false,
  })
}
