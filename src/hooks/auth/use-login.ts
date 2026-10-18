import { useMutation } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"
import { login } from "@/services/auth.service"

export function useLogin(onError?: (error: Error) => void) {
  const navigate = useNavigate()
  const location = useLocation()
  return useMutation({
    mutationFn: login,
    meta: { successMessage: "Signed in successfully.", suppressGlobalErrorToast: true },
    onSuccess: (user) => {
      const from = location.state?.from
      const path = typeof from?.pathname === "string" ? from.pathname : ""
      const safePath = path.startsWith("/") && !path.startsWith("//") &&
        !/^\/(login|auth|register|forgot-password|403)(\/|$)/.test(path)
      const target = safePath ? `${path}${from.search || ""}${from.hash || ""}` : "/admin/dashboard"
      navigate(user.mustChangePassword ? "/change-password" : user.role === "customer" ? "/403" : target, { replace: true })
    },
    onError,
  })
}
