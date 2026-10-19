import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUser } from "@/features/users/services/users.service"
export function useUpdateUser() {
  const client = useQueryClient()
  return useMutation({ mutationFn: updateUser, onSuccess: () => client.invalidateQueries({ queryKey: ["users"] }) })
}
