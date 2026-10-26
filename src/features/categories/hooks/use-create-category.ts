import { invalidateCatalog } from "@/features/products/utils/invalidate-catalog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createCategory } from "@/features/categories/services/categories.service"
import type { CreateCategoryInput, Category } from "@/features/categories/types/categories"
import type { MutationCallbacks } from "@/types/mutation"

export function useCreateCategory(options: MutationCallbacks<Category, CreateCategoryInput> = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: createCategory,
    meta: { successMessage: "Tạo danh mục thành công." },
    onSuccess: async (...args) => {
      await invalidateCatalog(queryClient, "categories")
      return options.onSuccess?.(...args)
    },
  })
}
