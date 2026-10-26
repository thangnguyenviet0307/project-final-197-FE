import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { RootFallback } from "@/layout/root-layout"
import { authRedirect } from "@/features/auth/utils/auth-redirect"

export function PublicOnlyRoute({ storefront = false }: { storefront?: boolean }) {
  const { user, isLoading, isAuthenticated } = useAuthStore()
  if (isLoading) return <RootFallback storefront={storefront} />
  if (storefront && isAuthenticated && user && user.role !== "customer") {
    return <p role="alert" className="p-6 text-center">Tài khoản này không dùng để đăng nhập cửa hàng. Vui lòng sử dụng tài khoản khách hàng.</p>
  }
  if (isAuthenticated && user) return <Navigate to={authRedirect(user)} replace />
  return <Outlet />
}
