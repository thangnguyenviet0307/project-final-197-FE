
import { Link } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { LogIn, UserRound } from "lucide-react"

export function StoreTopBar() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="w-full border-b border-gray-100 bg-white text-gray-500">
      <div className="mx-auto flex min-h-10 w-full max-w-[1440px] flex-wrap items-center justify-end gap-x-6 gap-y-2 px-5 py-2 text-xs lg:py-0">
        <div className="flex flex-wrap items-center gap-y-2 text-xs text-gray-500">
          <span className="px-3">Theo dõi đơn hàng</span>

          <span
            className="hidden h-4 w-px bg-gray-200 sm:block"
            aria-hidden="true"
          />

          <Link to={user?.role === "customer" ? "/account/profile" : user ? "/" : "/register"} className="inline-flex items-center gap-1 px-3 hover:text-[#55b000]">
            <UserRound size={13} />
            {user ? user.name : "Đăng ký"}
          </Link>

          <span
            className="hidden h-4 w-px bg-gray-200 sm:block"
            aria-hidden="true"
          />

          {user ? <LogoutButton redirectTo="/account/login" /> : <Link to="/account/login" className="inline-flex items-center gap-1 px-3 hover:text-[#55b000]">
            <LogIn size={13} />
            Đăng nhập
          </Link>}
        </div>
      </div>
    </div>
  )
}
