
import { useAuthStore } from "@/stores/auth.store"
import { Link } from "react-router-dom"
import { Phone, ShoppingCart, UserRound } from "lucide-react"

import { StoreSearch } from "./store-search"
import { StoreTopBar } from "./store-top-bar"

export function StoreHeader() {
  const customer = useAuthStore(state => state.user?.role === "customer")
  return (
    <header className="w-full bg-white">

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-6 px-5 py-5 md:min-h-[120px] md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-8 xl:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] xl:gap-x-10 2xl:gap-x-12">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            aria-label="DEMO STORE - Trang chủ"
            className="inline-flex items-center text-[30px] font-black tracking-[-1.5px] text-gray-950 transition-opacity hover:opacity-80 sm:text-[34px]"
          >
            DEMO
            <span className="text-[#55b000]">STORE</span>
          </Link>

          <Link
            to={customer ? "/account/profile" : "/account/login"}
            aria-label="Tài khoản"
            className="flex items-center justify-center rounded-full border border-gray-200 p-2 text-gray-800 transition-colors hover:border-[#55b000] hover:text-[#55b000] md:hidden"
          >
            <UserRound size={20} />
          </Link>
        </div>

        <div className="w-full min-w-0">
          <StoreSearch />
        </div>

        <Link to="/contact" className="flex items-center gap-3 text-gray-800 transition-colors hover:text-[#55b000]">
          <Phone size={23} className="shrink-0" />
          <div className="whitespace-nowrap leading-tight">
            <p className="text-xs font-medium">Hỗ trợ khách hàng</p>
            <p className="mt-1 text-sm font-semibold">Liên hệ</p>
          </div>
        </Link>

        <StoreTopBar />

        <div className="flex items-center md:justify-end">
          <div className="flex items-center gap-3 text-gray-800">
            <div
              className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={23} strokeWidth={1.8} />

              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#55b000] px-1 text-[11px] font-bold text-white">
                0
              </span>
            </div>

            <div className="flex flex-col justify-center">
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
