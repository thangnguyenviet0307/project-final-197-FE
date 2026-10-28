
import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"

import { StoreDepartmentsMenu } from "./store-departments-menu"
import { StoreTopBar } from "./store-top-bar"

export function StoreNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobileMenu = () => {
    setMobileOpen(false)
  }

  return (
    <nav
      className="relative z-40 w-full bg-[#55b000]"
      aria-label="Điều hướng cửa hàng"
    >
      <div className="store-container ">
        <div className="flex min-h-14 items-center">
          {/* ALL DEPARTMENTS */}
          <div className="hidden shrink-0 lg:block">
            <StoreDepartmentsMenu />
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden h-14 min-w-0 flex-1 grid-cols-[1fr_1px_1fr_1px_1fr_1px_1fr] items-center lg:grid">
            <Link
              to="/"
              className="flex h-full flex-1 items-center justify-center text-center text-sm font-semibold text-white transition-colors hover:text-black"
            >
              TRANG CHỦ
            </Link>

            <span aria-hidden="true" className="h-4 w-px bg-white/40" />

            <Link to="/shop" className="flex h-full min-w-0 items-center justify-center text-center text-sm font-semibold text-white/90 hover:text-black">
              KHÁM PHÁ
            </Link>

            <span aria-hidden="true" className="h-4 w-px bg-white/40" />

            <Link to="/#tin-tuc" className="flex h-full min-w-0 items-center justify-center text-center text-sm font-semibold text-white/90 hover:text-black">
              TIN TỨC
            </Link>

            <span aria-hidden="true" className="h-4 w-px bg-white/40" />

            <Link
              to="/contact"
              className="flex h-full flex-1 items-center justify-center text-center text-sm font-semibold text-white transition-colors hover:text-black"
            >
              LIÊN HỆ
            </Link>
          </div>

          {/* MOBILE NAVBAR */}
          <div className="flex h-14 w-full items-center justify-between lg:hidden">
            <span className="text-sm font-bold tracking-wider text-white">
              DemoStore
            </span>

            <button
              type="button"
              onClick={() => setMobileOpen((previous) => !previous)}
              aria-label={
                mobileOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"
              }
              aria-expanded={mobileOpen}
              className="rounded-md p-2 text-white hover:bg-white/15"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="border-t border-white/20 pb-4 lg:hidden">
            <div className="mt-3 rounded-lg bg-white p-4">
              <StoreTopBar />
            </div>
            <div className="space-y-1 py-3">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="block rounded-md px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/15"
              >
                TRANG CHỦ
              </Link>

              <div className="px-1 py-2">
                <StoreDepartmentsMenu />
              </div>

              <Link to="/shop" onClick={closeMobileMenu} className="block rounded-md px-4 py-3 text-center text-sm font-semibold text-white/80 hover:bg-white/15">
                KHÁM PHÁ
              </Link>

              <Link to="/#tin-tuc" onClick={closeMobileMenu} className="block rounded-md px-4 py-3 text-center text-sm font-semibold text-white/80 hover:bg-white/15">
                TIN TỨC
              </Link>

              <Link
                to="/contact"
                onClick={closeMobileMenu}
                className="block rounded-md px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/15"
              >
                LIÊN HỆ
              </Link>

              <Link
                to="/account"
                onClick={closeMobileMenu}
                className="block rounded-md px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/15"
              >
                TÀI KHOẢN CỦA TÔI
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
