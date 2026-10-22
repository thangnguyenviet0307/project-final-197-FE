
import { NavLink, Outlet } from "react-router-dom"
import {
  UserRound,
  MapPin,
  Package,
  LockKeyhole,
  ChevronRight,
} from "lucide-react"

const accountMenus = [
  {
    label: "Thông tin tài khoản",
    path: "/account/profile",
    icon: UserRound,
  },
  {
    label: "Địa chỉ giao hàng",
    path: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Đơn hàng của tôi",
    path: "/account/orders",
    icon: Package,
  },
  {
    label: "Đổi mật khẩu",
    path: "/account/change-password",
    icon: LockKeyhole,
  },
]

export function AccountLayout() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">

        {/* Account Sidebar */}
        <aside className="h-fit overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Tài khoản của tôi
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý tài khoản
            </p>
          </div>

          <nav
            aria-label="Điều hướng tài khoản"
            className="flex flex-col p-2"
          >
            {accountMenus.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-md px-4 py-3 text-sm transition-colors",
                      isActive
                        ? "bg-[#55b000]/10 font-semibold text-[#438d00]"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")
                  }
                >
                  <Icon size={19} />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight size={15} />
                </NavLink>
              )
            })}
          </nav>
        </aside>

        {/* Account Page Content */}
        <section
          aria-label="Nội dung tài khoản"
          className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 sm:p-7"
        >
          <Outlet />
        </section>

      </div>
    </div>
  )
}
