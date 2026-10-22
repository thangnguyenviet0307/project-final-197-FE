import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, Menu, Phone, X } from "lucide-react"

const menuItems = [
  { label: "TRANG CHỦ", to: "/landing" },
  { label: "SẢN PHẨM", to: "/shop" },
  { label: "THƯƠNG HIỆU", to: "/brands" },
  { label: "GIỚI THIỆU", to: "/about" },
  { label: "LIÊN HỆ", to: "/contact" },
]

export function StoreNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [departmentsOpen, setDepartmentsOpen] = useState(false)

  return (
    <nav className="bg-[#55b000] text-white">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center px-4">
        <div className="relative hidden w-64 shrink-0 lg:block">
          <button
            type="button"
            onClick={() => setDepartmentsOpen(!departmentsOpen)}
            aria-expanded={departmentsOpen}
            className="flex min-h-14 w-full items-center justify-between bg-black px-5 font-semibold"
          >
            TẤT CẢ DANH MỤC
            <ChevronDown size={18} />
          </button>

          {departmentsOpen && (
            <div className="absolute left-0 top-full z-50 w-full border bg-white p-5 text-sm text-gray-800 shadow-lg">
              Danh mục sẽ được lấy từ API Categories.
            </div>
          )}
        </div>

        <div className="hidden flex-1 items-center justify-center gap-7 lg:flex">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-xs font-bold tracking-wider transition hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-2 text-sm font-semibold lg:flex">
          <Phone size={19} />
          <span>HỖ TRỢ KHÁCH HÀNG</span>
        </div>

        <button
          type="button"
          className="flex min-h-14 items-center gap-2 font-semibold lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          MENU
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/20 px-4 py-3 lg:hidden">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}