import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { changePassword } from "@/features/auth/services/auth.service"
import type { ChangePasswordInput } from "@/features/auth/types/auth"

export function useChangePassword(onError?: (error: Error) => void, redirectTo = "/auth/login") {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordInput) => changePassword({ currentPassword, newPassword }),
    meta: { successMessage: "Đã đổi mật khẩu. Vui lòng đăng nhập lại." },
    onSuccess: () => navigate(redirectTo, { replace: true, state: { message: "Đã đổi mật khẩu. Vui lòng đăng nhập lại." } }),
    onError,
  })
}
