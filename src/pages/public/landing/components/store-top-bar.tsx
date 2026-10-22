import { Link } from "react-router-dom"

export function StoreTopBar() {
  return (
    <div className="border-b border-gray-200 bg-white text-xs text-gray-500">
      <div className="mx-auto flex min-h-10 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <span>🇻🇳 Tiếng Việt</span>
          <span className="text-gray-300">|</span>
          <span>VND</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">
            Chào mừng đến với 197 Store
          </span>
          <Link to="/login" className="hover:text-green-600">
            Đăng nhập
          </Link>
          <Link to="/register" className="hover:text-green-600">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}