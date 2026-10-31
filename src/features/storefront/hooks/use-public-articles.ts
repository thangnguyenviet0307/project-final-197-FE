import { useQuery } from "@tanstack/react-query"
import { getPublicArticle, listPublicArticles, getPublicArticleCategories } from "@/features/storefront/services/articles.service"
import type { ArticleType } from "@/features/storefront/types/article"

export function usePublicArticles(type: ArticleType, limit = 3, featured = false) {
  return useQuery({
    queryKey: ["articles", "public", "list", type, limit, featured],
    queryFn: ({ signal }) => listPublicArticles(type, limit, signal, { featured }),
  })
}

export function usePublicArticle(slug: string) {
  return useQuery({
    queryKey: ["articles", "public", "detail", slug],
    queryFn: ({ signal }) => getPublicArticle(slug, signal),
    enabled: slug.length <= 255 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug),
    retry: false,
  })
}

export function useArticleCatalog(type: ArticleType, page: number, search: string, categoryId: string) {
  return useQuery({ queryKey: ["articles", "public", "catalog", type, page, search, categoryId],
    queryFn: ({ signal }) => listPublicArticles(type, 9, signal, { page, search: search || undefined, categoryId: categoryId || undefined }) })
}

export function usePublicArticleCategories() {
  return useQuery({ queryKey: ["articles", "public", "category-options"], queryFn: ({ signal }) => getPublicArticleCategories(signal) })
}

export function useArticleSidebar(type: ArticleType, sort: "newest" | "popular") {
  const limit = sort === "popular" ? 5 : 3
  return useQuery({ queryKey: ["articles", "public", "sidebar", type, sort],
    queryFn: ({ signal }) => listPublicArticles(type, limit, signal, { sort }) })
}
