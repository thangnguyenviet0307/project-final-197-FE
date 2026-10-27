import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { RootFallback } from "@/layout/root-layout"
import type { Role } from "@/features/auth/types/auth"

export function ProtectedRoute({ allowedRoles, storefront = false }: { allowedRoles?: Role[]; storefront?: boolean }) {
  const { user, isLoading, isAuthenticated } = useAuthStore()
  const location = useLocation()
  if (isLoading) return <RootFallback storefront={storefront} />
  if (!isAuthenticated || !user) return <Navigate to={storefront ? "/thanh-vien?act=login" : "/auth/login"} state={{ from: location }} replace />
  if ((storefront && user.accountType !== "customer") || (!storefront && user.accountType === "customer") || (allowedRoles && (!user.role || !allowedRoles.includes(user.role)))) return <Navigate to={storefront ? "/403" : "/auth/403"} replace />
  const passwordPath = storefront ? "/account/change-password" : "/auth/change-password"
  if (user.mustChangePassword && location.pathname !== passwordPath) {
    return <Navigate to={passwordPath} replace />
  }
  return <Outlet />
}
