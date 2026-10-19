import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createCategory, type CreateCategoryInput, type Category } from "@/features/categories/services/categories.service"
import type { MutationCallbacks } from "@/types/mutation"

export function useCreateCategory(options: MutationCallbacks<Category, CreateCategoryInput> = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: createCategory,
    meta: { successMessage: "Tạo danh mục thành công." },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] })
      return options.onSuccess?.(...args)
    },
  })
}