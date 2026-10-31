import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as service from "@/features/articles/services/articles.service"
import type { ArticleQuery } from "@/features/articles/types/articles"
export function useArticles(params: ArticleQuery) { return useQuery({ queryKey: ["articles", "admin", params], queryFn: ({ signal }) => service.listArticles(params, signal) }) }
export function usePostCategories() { return useQuery({ queryKey: ["articles", "categories", "admin"], queryFn: ({ signal }) => service.listPostCategories(signal) }) }
export function useArticleMutations() {
  const client = useQueryClient()
  const onSuccess = () => Promise.all([client.invalidateQueries({ queryKey: ["articles"] }), client.invalidateQueries({ queryKey: ["products"], predicate: query => query.queryKey.includes("news") })])
  const meta = { suppressGlobalErrorToast: true }
  return {
    create: useMutation({ mutationFn: service.createArticle, onSuccess, meta }),
    update: useMutation({ mutationFn: service.updateArticle, onSuccess, meta }),
    remove: useMutation({ mutationFn: service.deleteArticle, onSuccess, meta }),
    createCategory: useMutation({ mutationFn: service.createPostCategory, onSuccess, meta }),
    updateCategory: useMutation({ mutationFn: service.updatePostCategory, onSuccess, meta }),
    removeCategory: useMutation({ mutationFn: service.deletePostCategory, onSuccess, meta }),
  }
}
