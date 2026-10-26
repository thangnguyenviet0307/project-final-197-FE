import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { RootFallback } from "@/layout/root-layout"
import type { Role } from "@/features/auth/types/auth"

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { user, isLoading, isAuthenticated } = useAuthStore()
  const location = useLocation()
  if (isLoading) return <RootFallback />
  if (!isAuthenticated || !user) return <Navigate to="/login" state={{ from: location }} replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/403" replace />
  if (user.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />
  }
  return <Outlet />
}

export function PublicOnlyRoute({ storefront = false }: { storefront?: boolean }) {
  const { user, isLoading, isAuthenticated } = useAuthStore()
  if (isLoading) return <RootFallback />
  if (isAuthenticated) return <Navigate to={storefront || user?.role === "customer" ? "/" : user?.mustChangePassword ? "/change-password" : "/admin/dashboard"} replace />
  return <Outlet />
}
