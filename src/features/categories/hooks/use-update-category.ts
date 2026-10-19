import { invalidateCatalog } from "@/features/products/utils/invalidate-catalog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateCategory, type UpdateCategoryInput, type Category } from "@/features/categories/services/categories.service"
import type { MutationCallbacks } from "@/types/mutation"

export function useUpdateCategory(
  options: MutationCallbacks<Category, { id: string; input: UpdateCategoryInput }> = {}
) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: updateCategory,
    meta: { successMessage: "Cập nhật danh mục thành công." },
    onSuccess: async (...args) => {
      await invalidateCatalog(queryClient, "categories")
      return options.onSuccess?.(...args)
    },
  })
}
