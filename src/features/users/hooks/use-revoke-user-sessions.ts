import { useMutation } from "@tanstack/react-query"
import { revokeUserSessions } from "@/features/users/services/users.service"

export function useRevokeUserSessions() {
  return useMutation({ mutationFn: revokeUserSessions, meta: { successMessage: "Đã thu hồi các phiên đăng nhập." } })
}
