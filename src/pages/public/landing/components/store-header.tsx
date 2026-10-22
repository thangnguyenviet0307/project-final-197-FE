import { Link } from "react-router-dom"
import { ShoppingCart, UserRound } from "lucide-react"
import { StoreSearch } from "./store-search"
import { StoreTopBar } from "./store-top-bar"

export function StoreHeader() {
  return (
    <header className="bg-white">
      <StoreTopBar />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-5 px-4 py-7 md:grid-cols-[200px_1fr_auto] md:gap-8">
        <div className="flex items-center justify-between">
          <Link
            to="/landing"
            className="text-3xl font-black tracking-tight text-gray-950"
          >
            197<span className="text-green-600">STORE</span>
          </Link>

          <Link
            to="/login"
            aria-label="Tài khoản"
            className="md:hidden"
          >
            <UserRound size={23} />
          </Link>
        </div>

        <StoreSearch />

        <div className="flex items-center justify-end gap-5">
          <Link
            to="/login"
            className="hidden items-center gap-2 text-sm text-gray-700 md:flex"
          >
            <UserRound size={22} />
            Tài khoản
          </Link>

          <div className="flex items-center gap-3">
            <ShoppingCart size={26} />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Giỏ hàng
              </p>
              <p className="text-xs text-gray-500">
                0 sản phẩm
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}