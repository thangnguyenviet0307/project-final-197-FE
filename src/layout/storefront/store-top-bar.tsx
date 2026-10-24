
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { ChevronDown, LogIn, UserRound } from "lucide-react"

export function StoreTopBar() {
  const user = useAuthStore((state) => state.user)
  const [language, setLanguage] = useState("English")
  const [currency, setCurrency] = useState("USD")

  return (
    <div className="w-full border-b border-gray-100 bg-white text-gray-500">
      <div className="mx-auto flex min-h-10 w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-2 text-xs lg:py-0">
        <div className="flex shrink-0 items-center gap-4">
          <div className="relative flex items-center gap-2">
            <span aria-hidden="true" className="text-sm">
              {language === "English" ? "🇬🇧" : "🇻🇳"}
            </span>

            <select
              aria-label="Select language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="cursor-pointer appearance-none bg-transparent pr-4 text-xs text-gray-500 outline-none hover:text-[#55b000]"
            >
              <option value="English">English</option>
              <option value="Tiếng Việt">Tiếng Việt</option>
            </select>

            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-0 text-gray-400"
            />
          </div>

          <span className="h-4 w-px bg-gray-200" aria-hidden="true" />

          <div className="relative flex items-center">
            <select
              aria-label="Select currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="cursor-pointer appearance-none bg-transparent pr-4 text-xs text-gray-500 outline-none hover:text-[#55b000]"
            >
              <option value="USD">USD</option>
              <option value="VND">VND</option>
            </select>

            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-0 text-gray-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-y-2 text-xs text-gray-500">
          <span className="px-3">Store Direction</span>

          <span
            className="hidden h-4 w-px bg-gray-200 sm:block"
            aria-hidden="true"
          />

          <span className="px-3">Track Your Order</span>

          <span
            className="hidden h-4 w-px bg-gray-200 sm:block"
            aria-hidden="true"
          />

          <Link to={user ? user.role === "customer" ? "/" : "/dashboard" : "/register"} className="inline-flex items-center gap-1 px-3 hover:text-[#55b000]">
            <UserRound size={13} />
            {user ? user.name : "Đăng ký"}
          </Link>

          <span
            className="hidden h-4 w-px bg-gray-200 sm:block"
            aria-hidden="true"
          />

          {user ? <LogoutButton /> : <Link to="/account/login" className="inline-flex items-center gap-1 px-3 hover:text-[#55b000]">
            <LogIn size={13} />
            Đăng nhập
          </Link>}
        </div>
      </div>
    </div>
  )
}
