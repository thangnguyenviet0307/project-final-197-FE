import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createUser } from "@/features/users/services/users.service"
import type { CreateUserInput } from "@/features/users/types/users"
import type { MutationCallbacks } from "@/types/mutation"

export function useCreateUser(options: MutationCallbacks<void, CreateUserInput> = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: createUser,
    meta: { successMessage: "Account created successfully." },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] })
      return options.onSuccess?.(...args)
    },
  })
}
