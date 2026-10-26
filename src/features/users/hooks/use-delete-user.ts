import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteUser } from "@/features/users/services/users.service"
import type { MutationCallbacks } from "@/types/mutation"

export function useDeleteUser(id: string, options: MutationCallbacks<void, void> = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: () => deleteUser(id),
    meta: { successMessage: "Đã xóa tài khoản." },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
      return options.onSuccess?.(...args)
    },
  })
}
