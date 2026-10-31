import type { PublicArticle } from "@/features/storefront/types/article"
import type { Pagination } from "@/types/api"
export type ArticleStatus = "draft" | "scheduled" | "published" | "archived"
export interface AdminArticle extends PublicArticle { status: ArticleStatus; publishAt: string | null; __v: number; categoryId?: string | null; sortOrder: number }
export interface PostCategory { _id: string; name: string; slug: string; description: string; isActive: boolean; __v: number }
export interface ArticleQuery { page: number; limit: number; search?: string; type?: "news" | "blog"; status?: ArticleStatus; categoryId?: string; isFeatured?: boolean }
export interface ArticlesResult { data: AdminArticle[]; pagination: Pagination }
export interface CategoryInput { name: string; slug: string; description: string; isActive: boolean }
