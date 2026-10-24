
import { NavLink, Outlet } from "react-router-dom"
import {
  UserRound,
  Package,
  MapPin,
  LockKeyhole,
  ChevronRight,
} from "lucide-react"

const accountMenus = [
  {
    label: "My Profile",
    path: "/account/profile",
    icon: UserRound,
  },
  {
    label: "My Orders",
    path: "/account/orders",
    icon: Package,
  },
  {
    label: "My Addresses",
    path: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Change Password",
    path: "/account/change-password",
    icon: LockKeyhole,
  },
]

export function AccountLayout() {
  return (
    <div className="min-h-[65vh] bg-[#fafafa]">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:py-12">
        <div className="mb-8">
          <p className="text-xs text-gray-500">
            Home / My Account
          </p>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            MY ACCOUNT
          </h1>
          <div className="mt-4 h-1 w-14 bg-[#55b000]" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="self-start overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="bg-[#253529] px-6 py-7 text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#55b000]">
                <UserRound size={28} />
              </div>
              <h2 className="mt-4 text-lg font-bold">
                My Account
              </h2>
              <p className="mt-1 text-xs text-gray-300">
                Customer area preview
              </p>
            </div>

            <nav aria-label="Account navigation" className="p-3">
              {accountMenus.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `mb-1 flex items-center gap-3 rounded-md px-4 py-3.5 text-sm transition-colors ${
                        isActive
                          ? "bg-[#55b000]/10 font-bold text-[#459000]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#55b000]"
                      }`
                    }
                  >
                    <Icon size={19} />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight size={16} />
                  </NavLink>
                )
              })}
            </nav>
          </aside>

          <main className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
