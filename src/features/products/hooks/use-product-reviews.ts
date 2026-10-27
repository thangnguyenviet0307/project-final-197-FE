import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createProductReview, deleteProductReview, getProductMetrics, listProductReviews } from "@/features/products/services/product-reviews.service"

export function useProductReviews(id: string, page: number) {
  const client = useQueryClient()
  const enabled = /^[a-f\d]{24}$/i.test(id)
  const metrics = useQuery({ queryKey: ["products", "metrics", id], queryFn: ({ signal }) => getProductMetrics(id, signal), enabled })
  const reviews = useQuery({ queryKey: ["products", "reviews", id, page], queryFn: ({ signal }) => listProductReviews(id, page, signal), enabled })
  const invalidate = () => Promise.all([
    client.invalidateQueries({ queryKey: ["products", "metrics", id] }),
    client.invalidateQueries({ queryKey: ["products", "reviews", id] }),
    client.invalidateQueries({ queryKey: ["products", "public"] }),
  ])
  const create = useMutation({ mutationFn: createProductReview, onSuccess: invalidate, meta: { successMessage: "Đã thêm đánh giá.", suppressGlobalErrorToast: true } })
  const remove = useMutation({ mutationFn: deleteProductReview, onSuccess: invalidate, meta: { successMessage: "Đã xóa đánh giá.", suppressGlobalErrorToast: true } })
  return { metrics, reviews, create, remove }
}
