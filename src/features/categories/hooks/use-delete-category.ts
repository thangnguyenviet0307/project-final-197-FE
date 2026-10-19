import { invalidateCatalog } from "@/features/products/utils/invalidate-catalog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteCategory } from "@/features/categories/services/categories.service"
import type { MutationCallbacks } from "@/types/mutation"

export function useDeleteCategory(options: MutationCallbacks<void, string> = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: deleteCategory,
    meta: { successMessage: "Xóa danh mục thành công." },
    onSuccess: async (...args) => {
      await invalidateCatalog(queryClient, "categories")
      return options.onSuccess?.(...args)
    },
  })
}
