import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "@/features/auth/services/auth.service"
import { useAuthStore } from "@/stores/auth.store"
import type { MutationCallbacks } from "@/types/mutation"

export function useUpdateProfile(options: MutationCallbacks<Awaited<ReturnType<typeof updateProfile>>, Parameters<typeof updateProfile>[0]> = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: updateProfile,
    meta: { successMessage: "Profile updated." },
    onSuccess: async (...args) => {
      const version = useAuthStore.getState().sessionVersion
      queryClient.setQueryData(["auth", "me", version], args[0])
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ])
      await options.onSuccess?.(...args)
    },
  })
}
