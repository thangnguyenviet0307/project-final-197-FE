import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { RootFallback } from "@/layout/root-layout"
import { authRedirect } from "@/features/auth/utils/auth-redirect"

export function PublicOnlyRoute({ storefront = false }: { storefront?: boolean }) {
  const { user, isLoading, isAuthenticated } = useAuthStore()
  if (isLoading) return <RootFallback storefront={storefront} />
  if (isAuthenticated && user && (storefront ? user.role !== "customer" : user.role === "customer")) {
    return <p role="alert" className="p-6 text-center">Tài khoản không tồn tại !</p>
  }
  if (isAuthenticated && user) return <Navigate to={authRedirect(user)} replace />
  return <Outlet />
}
