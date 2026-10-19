import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteCategory } from "@/features/categories/services/categories.service"
import type { MutationCallbacks } from "@/types/mutation"

export function useDeleteCategory(options: MutationCallbacks<void, string> = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: deleteCategory,
    meta: { successMessage: "Xóa danh mục thành công." },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] })
      return options.onSuccess?.(...args)
    },
  })
}
