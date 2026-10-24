
import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, Phone, X } from "lucide-react"

import { StoreMegaMenu } from "./store-mega-menu"
import { StoreDepartmentsMenu } from "./store-departments-menu"

export function StoreNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobileMenu = () => {
    setMobileOpen(false)
  }

  return (
    <nav
      className="relative z-40 w-full bg-[#55b000]"
      aria-label="Store navigation"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-5">
        <div className="flex min-h-14 items-center gap-5">
          {/* ALL DEPARTMENTS */}
          <div className="hidden shrink-0 lg:block">
            <StoreDepartmentsMenu />
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden h-14 min-w-0 flex-1 items-center gap-5 lg:flex xl:gap-6">
            <Link
              to="/"
              className="flex h-full shrink-0 items-center text-sm font-semibold text-white transition-colors hover:text-black"
            >
              HOME
            </Link>

            <span className="text-sm text-white/40">|</span>

            <span className="flex h-full shrink-0 items-center text-sm font-semibold text-white/90">
              SHOP
            </span>

            <span className="text-sm text-white/40">|</span>

            <div className="flex h-full shrink-0 items-center">
              <StoreMegaMenu />
            </div>

            <span className="text-sm text-white/40">|</span>

            <span className="flex h-full shrink-0 items-center text-sm font-semibold text-white/90">
              PAGES
            </span>

            <span className="text-sm text-white/40">|</span>

            <span className="flex h-full shrink-0 items-center text-sm font-semibold text-white/90">
              BLOG
            </span>

            <span className="text-sm text-white/40">|</span>

            <Link
              to="/contact"
              className="flex h-full shrink-0 items-center text-sm font-semibold text-white transition-colors hover:text-black"
            >
              CONTACT US
            </Link>
          </div>

          {/* PHONE AREA */}
          <div className="ml-auto hidden shrink-0 items-center gap-3 rounded-full bg-white/15 px-4 py-2 text-white xl:flex">
            <Phone size={19} />

            <div className="leading-tight">
              <p className="text-[11px] font-medium">
                Customer Support
              </p>
              <p className="text-xs font-bold">
                Contact Us
              </p>
            </div>
          </div>

          {/* MOBILE NAVBAR */}
          <div className="flex h-14 w-full items-center justify-between lg:hidden">
            <span className="text-sm font-bold tracking-wider text-white">
              DEMO STORE
            </span>

            <button
              type="button"
              onClick={() => setMobileOpen((previous) => !previous)}
              aria-label={
                mobileOpen ? "Close navigation" : "Open navigation"
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
            <div className="space-y-1 py-3">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="block rounded-md px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                HOME
              </Link>

              <div className="px-1 py-2">
                <StoreDepartmentsMenu />
              </div>

              <p className="px-4 py-3 text-sm font-semibold text-white/80">
                SHOP
              </p>

              <p className="px-4 py-3 text-sm font-semibold text-white/80">
                MEGAMENU
              </p>

              <p className="px-4 py-3 text-sm font-semibold text-white/80">
                PAGES
              </p>

              <p className="px-4 py-3 text-sm font-semibold text-white/80">
                BLOG
              </p>

              <Link
                to="/contact"
                onClick={closeMobileMenu}
                className="block rounded-md px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                CONTACT US
              </Link>

              <Link
                to="/account"
                onClick={closeMobileMenu}
                className="block rounded-md px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                MY ACCOUNT
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
