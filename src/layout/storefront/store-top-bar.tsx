
import { Link } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { UserRoundPlus } from "lucide-react"

export function StoreTopBar() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex items-center gap-3 text-gray-800">
      <UserRoundPlus size={30} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
      <div className="flex flex-col items-start gap-1 min-w-0 text-sm font-semibold">
        <Link
          to={user?.accountType === "customer" ? "/account/profile" : user ? "/" : "/thanh-vien?act=register"}
          className="max-w-40 truncate transition-colors hover:text-[#55b000]"
        >
          {user ? user.name : "Đăng ký"}
        </Link>
        {user ? <LogoutButton redirectTo="/thanh-vien?act=login" /> : (
          <Link to="/thanh-vien?act=login" className="max-w-40 truncate transition-colors hover:text-[#55b000]">
            Đăng nhập
          </Link>
        )}
      </div>
    </div>
  )
}
