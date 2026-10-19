import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { logout } from "@/features/auth/services/auth.service"

export function useLogout() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: logout,
    meta: { successMessage: "Signed out successfully." },
    onSettled: () => navigate("/login", { replace: true }),
  })
}
