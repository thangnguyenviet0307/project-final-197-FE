import { useMutation, useQueryClient } from "@tanstack/react-query"
import { resetUserPassword } from "@/features/users/services/users.service"
import type { MutationCallbacks } from "@/types/mutation"

export function useResetUserPassword(id: string, options: MutationCallbacks<void, { password: string }> = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: ({ password }: { password: string }) => resetUserPassword({ id, password }),
    meta: { successMessage: "Password reset successfully." },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
      return options.onSuccess?.(...args)
    },
  })
}
