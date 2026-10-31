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

export interface PublicArticlesResult {
  data: Omit<PublicArticle, "content">[]
  pagination: Pagination
}
