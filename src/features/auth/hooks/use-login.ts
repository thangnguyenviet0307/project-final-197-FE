import { useMutation } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"
import { login } from "@/features/auth/services/auth.service"
import { authRedirect } from "@/features/auth/utils/auth-redirect"

export function useLogin(onError?: (error: Error) => void) {
  const navigate = useNavigate()
  const location = useLocation()
  return useMutation({
    mutationFn: (credentials: Parameters<typeof login>[0]) => login(credentials),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (user) => {
      if (user.mustChangePassword) {
        navigate(authRedirect(user), { replace: true })
        return
      }
      const from = location.state?.from
      const path = typeof from?.pathname === "string" ? from.pathname : ""
      const safePath = /^\/auth\/(dashboard|products|categories|brands|orders|users|customers|settings|faqs)(\/|$)/.test(path)
      const target = safePath ? `${path}${from.search || ""}${from.hash || ""}` : "/auth/dashboard"
      navigate(target, { replace: true })
    },
    onError,
  })
}
