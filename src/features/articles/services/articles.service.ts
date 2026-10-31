import { api } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { AdminArticle, ArticleQuery, ArticlesResult, PostCategory, CategoryInput } from "@/features/articles/types/articles"
import type { ArticleInput } from "@/features/articles/schemas/article-schema"
export async function listArticles(params: ArticleQuery, signal?: AbortSignal) { const { data } = await api.get<ArticlesResult>("/articles", { params, signal }); return data }
export async function getArticle(id: string, signal?: AbortSignal) { const { data } = await api.get<ApiResponse<AdminArticle>>(`/articles/${encodeURIComponent(id)}`, { signal }); return data.data }
export async function createArticle(input: ArticleInput) { const { data } = await api.post<ApiResponse<AdminArticle>>("/articles", input); return data.data }
export async function updateArticle({ id, input }: { id: string; input: Partial<ArticleInput> & { expectedVersion: number } }) { const { data } = await api.patch<ApiResponse<AdminArticle>>(`/articles/${encodeURIComponent(id)}`, input); return data.data }
export async function deleteArticle({ id, expectedVersion }: { id: string; expectedVersion: number }) { await api.delete(`/articles/${encodeURIComponent(id)}`, { data: { expectedVersion } }) }
export async function listPostCategories(signal?: AbortSignal) { const { data } = await api.get<ApiResponse<PostCategory[]>>("/articles/category-options", { signal }); return data.data }
export async function createPostCategory(input: CategoryInput) { const { data } = await api.post<ApiResponse<PostCategory>>("/articles/category-options", input); return data.data }
export async function updatePostCategory({ id, input }: { id: string; input: Partial<CategoryInput> & { expectedVersion: number } }) { const { data } = await api.patch<ApiResponse<PostCategory>>(`/articles/category-options/${encodeURIComponent(id)}`, input); return data.data }
export async function deletePostCategory({ id, expectedVersion }: { id: string; expectedVersion: number }) { await api.delete(`/articles/category-options/${encodeURIComponent(id)}`, { data: { expectedVersion } }) }
