
import { useAuthStore } from "@/stores/auth.store"
import { useCartStore } from "@/stores/cart.store"
import { Link } from "react-router-dom"
import { Phone, ShoppingCart, UserRound } from "lucide-react"

import { StoreSearch } from "./store-search"
import { StoreTopBar } from "./store-top-bar"

export function StoreHeader() {
  const items = useCartStore(state => state.items)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const customer = useAuthStore(state => state.user?.accountType === "customer")
  return (
    <header className="w-full bg-white">

      <div className="store-container grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto] lg:gap-x-6 lg:py-5 xl:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto]">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            aria-label="DemoStore - Trang chủ"
            className="inline-flex items-center text-[30px] font-black tracking-[-1.5px] text-gray-950 transition-opacity hover:opacity-80 sm:text-[34px]"
          >
            Demo<span className="text-[#55b000]">Store</span>
          </Link>

          <Link
            to={customer ? "/account/profile" : "/thanh-vien?act=login"}
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
          <Link to="/cart" aria-label="Giỏ hàng" className="flex items-center gap-3 text-gray-800">
            <div
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200"
            >
              <ShoppingCart size={23} strokeWidth={1.8} />

              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#55b000] px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            </div>

            <div className="hidden flex-col justify-center xl:flex">
              <span className="text-xs font-medium text-gray-500">
                Giỏ hàng
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
