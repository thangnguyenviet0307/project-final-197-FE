
import { Link } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { UserRoundPlus } from "lucide-react"

export function StoreTopBar() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex items-center gap-3 text-gray-800">
      <UserRoundPlus size={30} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
      <div className="flex flex-col items-start gap-1 whitespace-nowrap text-base font-semibold">
        <Link
          to={user?.role === "customer" ? "/account/profile" : user ? "/" : "/register"}
          className="transition-colors hover:text-[#55b000]"
        >
          {user ? user.name : "Đăng ký"}
        </Link>
        {user ? <LogoutButton redirectTo="/account/login" /> : (
          <Link to="/account/login" className="transition-colors hover:text-[#55b000]">
            Đăng nhập
          </Link>
        )}
      </div>
    </div>
  )
}
