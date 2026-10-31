export interface ProductNewsArticle {
  _id: string
  title: string
  slug: string
  excerpt: string
  imageUrl: string | null
  publishedAt: string | null
  status?: string
}
export interface ProductNewsSelection {
  articleIds: string[]
  expectedVersion: number
  articles: ProductNewsArticle[]
}
