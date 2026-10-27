import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { login } from "@/features/auth/services/auth.service"

export function useCustomerLogin(onError?: (error: Error) => void) {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (credentials: Parameters<typeof login>[0]) => login(credentials, true),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: user => navigate(user.mustChangePassword ? "/account/change-password" : "/", { replace: true }),
    onError,
  })
}
