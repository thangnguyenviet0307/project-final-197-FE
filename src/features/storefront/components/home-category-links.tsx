import { Headphones, Smartphone, Watch } from "lucide-react"
import { Link } from "react-router-dom"

const categories = [
  { label: "Tai nghe", category: "Âm thanh", Icon: Headphones },
  { label: "Điện thoại", category: "Điện thoại", Icon: Smartphone },
  { label: "Đồng hồ", category: "Đồng hồ", Icon: Watch },
]

export function HomeCategoryLinks() {
  return (
    <nav aria-label="Danh mục nhanh" className="mx-auto max-w-7xl px-4 pt-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {categories.map(({ label, category, Icon }) => (
          <Link
            key={category}
            to={`/shop?category=${encodeURIComponent(category)}`}
            className="group flex flex-col items-center gap-2 border border-gray-100 bg-white px-2 py-4 text-center transition hover:border-[#57952b] hover:bg-[#f7faf3] sm:flex-row sm:gap-3 sm:px-4 sm:py-5 sm:text-left"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-[#f2f5ef] text-[#57952b] transition group-hover:bg-[#57952b] group-hover:text-white">
              <Icon size={19} />
            </span>
            <span className="text-sm font-semibold text-gray-800">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
