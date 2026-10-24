import { useMutation } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"
import { login } from "@/features/auth/services/auth.service"

export function useLogin(onError?: (error: Error) => void, storefront = false) {
  const navigate = useNavigate()
  const location = useLocation()
  return useMutation({
    mutationFn: login,
    meta: { successMessage: "Signed in successfully.", suppressGlobalErrorToast: true },
    onSuccess: (user) => {
      if (storefront) {
        navigate("/", { replace: true })
        return
      }
      const from = location.state?.from
      const path = typeof from?.pathname === "string" ? from.pathname : ""
      const safePath = path.startsWith("/") && !path.startsWith("//") &&
        !/^\/(login|auth|register|forgot-password|403)(\/|$)/.test(path)
      const target = safePath ? `${path}${from.search || ""}${from.hash || ""}` : "/admin/dashboard"
      navigate(user.role === "customer" ? "/" : user.mustChangePassword ? "/change-password" : target, { replace: true })
    },
    onError,
  })
}
