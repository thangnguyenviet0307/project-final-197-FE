import type { Pagination } from "@/types/api"

export type ArticleType = "news" | "blog"

export interface PublicArticle {
  _id: string
  type: ArticleType
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  imageUrl: string | null
  tags: string[]
  authorName: string
  publishedAt: string | null
  isFeatured: boolean
  viewCount: number
  seo: {
    title?: string
    description?: string
    keywords?: string[]
    canonicalUrl?: string | null
  }
}

export type PublicArticleSummary = Omit<PublicArticle, "content">
export interface PublicArticleCategory { _id: string; name: string; slug: string; description: string }
export interface PublicArticlesResult {
  data: PublicArticleSummary[]
  pagination: Pagination
}
