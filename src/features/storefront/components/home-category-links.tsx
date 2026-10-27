import { Link } from "react-router-dom"
import { storefrontCategories } from "@/features/storefront/data/products"

export function HomeCategoryLinks() {
  return (
    <nav aria-label="Danh mục nhanh" className="mx-auto max-w-7xl px-4 pt-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {storefrontCategories.map(({ name, image, caption }) => (
          <Link
            key={name}
            to={`/shop?category=${encodeURIComponent(name)}`}
            className="group flex min-w-0 items-center gap-3 border border-gray-100 bg-white p-2 text-left transition hover:border-[#57952b] hover:bg-[#f7faf3] sm:p-3"
          >
            <span className="size-12 shrink-0 overflow-hidden bg-gray-100 sm:size-14">
              <img src={image} alt="" loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-800">{name}</span>
              <span className="mt-1 hidden text-xs text-gray-500 sm:block">{caption}</span>
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
