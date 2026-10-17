import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { changePassword } from "@/services/auth.service"
import type { ChangePasswordInput } from "@/types/auth"

export function useChangePassword(onError?: (error: Error) => void) {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordInput) => changePassword({ currentPassword, newPassword }),
    meta: { successMessage: "Password changed. Please sign in again." },
    onSuccess: () => navigate("/login", { replace: true, state: { message: "Password changed. Please sign in again." } }),
    onError,
  })
}
