import { useMutation, useQueryClient } from "@tanstack/react-query"
import { transferOwnership } from "@/features/users/services/users.service"
import { clearAuth } from "@/services/api"

export function useTransferOwnership() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: transferOwnership,
    onSuccess: () => { clearAuth(); client.clear() },
  })
}
