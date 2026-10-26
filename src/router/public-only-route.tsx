import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { RootFallback } from "@/layout/root-layout"

export function PublicOnlyRoute({ storefront = false }: { storefront?: boolean }) {
  const { user, isLoading, isAuthenticated } = useAuthStore()
  if (isLoading) return <RootFallback storefront={storefront} />
  if (isAuthenticated) return <Navigate to={storefront || user?.role === "customer" ? "/" : user?.mustChangePassword ? "/change-password" : "/admin/dashboard"} replace />
  return <Outlet />
}
