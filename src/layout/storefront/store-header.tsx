
import { useAuthStore } from "@/stores/auth.store"
import { Link } from "react-router-dom"
import { Phone, ShoppingCart, UserRound } from "lucide-react"

import { StoreSearch } from "./store-search"
import { StoreTopBar } from "./store-top-bar"

export function StoreHeader() {
  const customer = useAuthStore(state => state.user?.role === "customer")
  return (
    <header className="w-full bg-white">

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto] lg:gap-x-6 lg:py-5 xl:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto]">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            aria-label="DEMO STORE - Trang chủ"
            className="inline-flex items-center text-[24px] font-black tracking-[-1.5px] text-gray-950 transition-opacity hover:opacity-80 sm:text-[30px]"
          >
            DEMO
            <span className="text-[#55b000]">STORE</span>
          </Link>

          <Link
            to={customer ? "/account/profile" : "/account/login"}
            aria-label="Tài khoản"
            className="flex items-center justify-center rounded-full border border-gray-200 p-3 text-gray-800 transition-colors hover:border-[#55b000] hover:text-[#55b000] lg:hidden"
          >
            <UserRound size={20} />
          </Link>
        </div>

        <div className="col-span-2 row-start-2 w-full min-w-0 lg:col-span-1 lg:row-start-auto">
          <StoreSearch />
        </div>

        <Link to="/contact" className="hidden items-center gap-3 text-gray-800 transition-colors hover:text-[#55b000] xl:flex">
          <Phone size={23} className="shrink-0" />
          <div className="whitespace-nowrap leading-tight">
            <p className="text-xs font-medium">Hỗ trợ khách hàng</p>
            <p className="mt-1 text-sm font-semibold">Liên hệ</p>
          </div>
        </Link>

        <div className="hidden min-w-0 lg:block"><StoreTopBar /></div>

        <div className="col-start-2 row-start-1 flex items-center justify-end lg:col-start-auto lg:row-start-auto">
          <div className="flex items-center gap-3 text-gray-800">
            <div
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={23} strokeWidth={1.8} />

              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#55b000] px-1 text-[11px] font-bold text-white">
                0
              </span>
            </div>

            <div className="hidden flex-col justify-center xl:flex">
              <span className="text-xs font-medium text-gray-500">
                Giỏ hàng
              </span>
              <span className="text-sm font-semibold text-gray-800">
                0 ₫
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
