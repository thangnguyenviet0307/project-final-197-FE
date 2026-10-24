
import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, Phone, X } from "lucide-react"
import { StoreMegaMenu } from "./store-mega-menu"

const menuItems = [
  { label: "HOME", to: "/landing" },
  { label: "SHOP", to: "/shop" },
  { label: "PAGES", to: "/about" },
  { label: "BLOG", to: "/blog" },
  { label: "CONTACT US", to: "/contact" },
]

export function StoreNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [departmentsOpen, setDepartmentsOpen] = useState(false)

  const navLinkClass =
    "flex h-14 shrink-0 items-center text-sm font-bold tracking-[0.05em] text-white transition-colors duration-200 hover:text-black"

  return (
    <nav className="relative z-40 w-full bg-[#55b000] text-white">
      <div className="mx-auto flex min-h-14 w-full max-w-[1440px] items-center px-5">
        <div className="relative hidden w-[270px] shrink-0 lg:block">
          <button
            type="button"
            onClick={() => setDepartmentsOpen((prev) => !prev)}
            aria-expanded={departmentsOpen}
            className="flex h-14 w-full items-center justify-between bg-black px-5 text-sm font-bold tracking-wider text-white transition hover:bg-gray-900"
          >
            <span>ALL DEPARTMENTS</span>
            <Menu size={22} />
          </button>

          {departmentsOpen && (
            <div className="absolute left-0 top-full z-50 w-full rounded-b-md border border-gray-200 bg-white p-5 text-sm text-gray-800 shadow-xl">
              Danh mục sản phẩm sẽ được tích hợp sau.
            </div>
          )}
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-3 lg:flex xl:gap-6">
          <Link to="/landing" className={navLinkClass}>
            HOME
          </Link>

          <span className="text-white/50">|</span>

          <Link to="/shop" className={navLinkClass}>
            SHOP
          </Link>

          <span className="text-white/50">|</span>

          <StoreMegaMenu />

          <span className="text-white/50">|</span>

          <Link to="/about" className={navLinkClass}>
            PAGES
          </Link>

          <span className="text-white/50">|</span>

          <Link to="/blog" className={navLinkClass}>
            BLOG
          </Link>

          <span className="text-white/50">|</span>

          <Link to="/contact" className={navLinkClass}>
            CONTACT US
          </Link>
        </div>

        <div className="ml-3 hidden shrink-0 items-center gap-2 rounded-full border border-white px-5 py-2.5 text-sm font-bold text-white xl:flex">
          <Phone size={19} />
          <span>HỖ TRỢ KHÁCH HÀNG</span>
        </div>

        <button
          type="button"
          className="flex h-14 items-center gap-2 font-semibold lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          MENU
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/20 bg-[#55b000] px-5 py-3 lg:hidden">
          {menuItems.slice(0, 2).map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm font-semibold"
            >
              {item.label}
            </Link>
          ))}

          <div className="border-t border-white/20 py-3 text-sm font-semibold">
            MEGAMENU
            <p className="mt-1 text-xs font-normal text-white/80">
              Menu nhiều cột hiển thị trên desktop
            </p>
          </div>

          {menuItems.slice(2).map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm font-semibold"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
