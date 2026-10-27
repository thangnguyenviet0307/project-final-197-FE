import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateShippingAddress } from "@/features/auth/services/auth.service"
import { useAuthStore } from "@/stores/auth.store"
import type { MutationCallbacks } from "@/types/mutation"

export function useShippingAddress(options: MutationCallbacks<Awaited<ReturnType<typeof updateShippingAddress>>, Parameters<typeof updateShippingAddress>[0]> = {}) {
  const client = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: updateShippingAddress,
    meta: { successMessage: "Đã lưu địa chỉ giao hàng." },
    onSuccess: async (...args) => {
      client.setQueryData(["auth", "me", useAuthStore.getState().sessionVersion], args[0])
      await client.invalidateQueries({ queryKey: ["customers"] })
      await options.onSuccess?.(...args)
    },
  })
}
