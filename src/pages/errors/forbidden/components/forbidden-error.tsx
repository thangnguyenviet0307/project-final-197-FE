import { ShieldX } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { getAuthArea, useAuthStore } from "@/stores/auth.store"

export function ForbiddenError() {
  const user = useAuthStore((state) => state.user)
  const loginPath = getAuthArea() === "admin" ? "/auth/login" : "/thanh-vien?act=login"
  return <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-5 p-6 text-center">
    <ShieldX className="size-16 text-destructive" />
    <h1 className="text-4xl font-bold">403</h1>
    <h2 className="text-xl font-semibold">Truy cập bị từ chối</h2>
    <p className="text-muted-foreground">Tài khoản của bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
    <div className="flex flex-wrap justify-center gap-3">
      {user && user.accountType !== "customer" ? <Button nativeButton={false} render={<Link to="/auth/dashboard" />}>Về bảng điều khiển</Button>
        : !user && <Button nativeButton={false} render={<Link to={loginPath} />}>Đăng nhập</Button>}
      {user && <LogoutButton redirectTo={loginPath} />}
    </div>
  </div>
}
