import { useMutation } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"
import { login } from "@/features/auth/services/auth.service"
import { authRedirect } from "@/features/auth/utils/auth-redirect"

export function useLogin(onError?: (error: Error) => void, storefront = false) {
  const navigate = useNavigate()
  const location = useLocation()
  return useMutation({
    mutationFn: login,
    meta: { successMessage: "Đăng nhập thành công.", suppressGlobalErrorToast: true },
    onSuccess: (user) => {
      if (storefront || user.role === "customer" || user.mustChangePassword) {
        navigate(authRedirect(user), { replace: true })
        return
      }
      const from = location.state?.from
      const path = typeof from?.pathname === "string" ? from.pathname : ""
      const safePath = path.startsWith("/") && !path.startsWith("//") &&
        !/^\/(login|auth|register|forgot-password|403)(\/|$)/.test(path)
      const target = safePath ? `${path}${from.search || ""}${from.hash || ""}` : "/admin/dashboard"
      navigate(target, { replace: true })
    },
    onError,
  })
}
