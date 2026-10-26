import { useEffect, useId, useRef, useState } from "react"
import {
  BatteryCharging,
  Cable,
  ChevronRight,
  Headphones,
  Menu,
  Monitor,
  Shield,
  Speaker,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router-dom"
import { storefrontCategories, storefrontProducts } from "@/features/storefront/data/products"

const categoryIcons: Record<string, LucideIcon> = {
  "Dây cáp sạc": Cable,
  "Tai nghe": Headphones,
  "Pin sạc dự phòng": BatteryCharging,
  "Phụ kiện máy tính": Monitor,
  "Loa Bluetooth": Speaker,
  "Kính cường lực": Shield,
}

export function StoreDepartmentsMenu() {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setActiveCategory(null)
        setShowAllProducts(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        setActiveCategory(null)
        setShowAllProducts(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  function closeMenu() {
    setOpen(false)
    setActiveCategory(null)
    setShowAllProducts(false)
  }

  return (
    <div ref={containerRef} className="relative z-50 w-full lg:w-[280px] xl:w-[320px]">
      <button
        type="button"
        onClick={() => {
          setOpen((previous) => !previous)
          setActiveCategory(null)
          setShowAllProducts(false)
        }}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-14 w-full items-center justify-between rounded-t-lg bg-black px-5 text-white transition-colors hover:bg-[#171717]"
      >
        <span className="text-sm font-bold uppercase tracking-wider">TẤT CẢ DANH MỤC</span>
        <Menu size={23} />
      </button>

      {open && (
        <div id={panelId} className="absolute left-0 top-full z-50 w-full border border-gray-100 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#57952b]">Khám phá sản phẩm</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">Chọn danh mục để khám phá các sản phẩm.</p>
          </div>

          <button
            type="button"
            aria-expanded={showAllProducts}
            aria-controls={`${panelId}-all-products`}
            onClick={() => {
              setShowAllProducts((previous) => !previous)
              setActiveCategory(null)
            }}
            className="flex min-h-[52px] w-full items-center justify-between border-b border-gray-100 px-5 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-[#edf6e4] hover:text-[#438d17]"
          >
            <span>Tất cả sản phẩm ({storefrontProducts.length})</span>
            <ChevronRight size={16} className={`transition-transform ${showAllProducts ? "rotate-90" : ""}`} />
          </button>

          {showAllProducts && (
            <section
              id={`${panelId}-all-products`}
              aria-label="Tất cả sản phẩm"
              className="border-b border-gray-100 bg-gray-50 p-3 lg:absolute lg:left-full lg:top-0 lg:z-20 lg:w-[min(720px,calc(100vw-340px))] lg:border lg:bg-white lg:p-4 lg:shadow-xl"
            >
              <div className="max-h-[65vh] overflow-y-auto pr-1">
                <div className="grid gap-2 sm:grid-cols-2">
                  {storefrontProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/shop/${product.slug}`}
                      onClick={closeMenu}
                      className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-100 bg-white p-2 transition hover:border-[#b9d9a0] hover:bg-[#f8fbf5]"
                    >
                      <img src={product.image} alt="" loading="lazy" className="size-12 shrink-0 rounded-md object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-medium text-[#57952b]">{product.category}</span>
                        <span className="mt-0.5 block truncate text-xs font-semibold text-gray-800">{product.name}</span>
                      </span>
                      <ChevronRight size={14} className="shrink-0 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {storefrontCategories.map((category) => {
            const Icon = categoryIcons[category.name]
            const products = storefrontProducts.filter((product) => product.category === category.name)
            const expanded = activeCategory === category.name

            return (
              <div
                key={category.name}
                className="relative"
                onMouseEnter={() => {
                  if (!showAllProducts && window.matchMedia("(min-width: 1024px)").matches) {
                    setActiveCategory(category.name)
                  }
                }}
                onMouseLeave={() => {
                  if (!showAllProducts && window.matchMedia("(min-width: 1024px)").matches) {
                    setActiveCategory(null)
                  }
                }}
              >
                <div className={`flex min-h-[54px] items-center border-b border-gray-100 transition-colors ${expanded ? "bg-[#f1f8e9]" : "hover:bg-[#f8fbf5]"}`}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`${panelId}-${category.name}`}
                    onClick={() => {
                      setShowAllProducts(false)
                      setActiveCategory(expanded ? null : category.name)
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left"
                  >
                    <img src={category.image} alt="" loading="lazy" className="size-9 shrink-0 rounded-md object-cover" />
                    {Icon && <Icon size={16} className="hidden shrink-0 text-[#57952b] sm:block" />}
                    <span className={`min-w-0 flex-1 text-sm font-medium ${expanded ? "text-[#3f8118]" : "text-gray-700"}`}>
                      {category.name}
                      <span className="mt-0.5 block text-[11px] font-normal text-gray-400">{products.length} sản phẩm</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`${expanded ? "Thu gọn" : "Mở"} danh mục ${category.name}`}
                    aria-expanded={expanded}
                    onClick={() => {
                      setShowAllProducts(false)
                      setActiveCategory(expanded ? null : category.name)
                    }}
                    className="flex h-[54px] w-10 shrink-0 items-center justify-center text-gray-400 hover:text-[#57952b]"
                  >
                    <ChevronRight size={16} className={`transition-transform ${expanded ? "rotate-90 lg:rotate-0" : ""}`} />
                  </button>
                </div>

                {expanded && (
                  <div
                    id={`${panelId}-${category.name}`}
                    className="border-b border-gray-100 bg-gray-50 p-4 lg:absolute lg:left-full lg:top-0 lg:z-10 lg:w-[440px] lg:border lg:bg-white lg:p-5 lg:shadow-xl"
                  >
                    <div className="flex gap-3">
                      <img src={category.image} alt="" loading="lazy" className="size-14 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <Link
                          to={`/shop?category=${encodeURIComponent(category.name)}`}
                          onClick={closeMenu}
                          className="font-bold text-gray-950 hover:text-[#4d9210]"
                        >
                          {category.name}
                        </Link>
                        <p className="mt-1 text-xs leading-5 text-gray-500">{category.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                      {products.slice(0, 4).map((product) => (
                        <Link
                          key={product.id}
                          to={`/shop/${product.slug}`}
                          onClick={closeMenu}
                          className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-100 bg-white p-2 transition hover:border-[#b9d9a0] hover:bg-[#f8fbf5]"
                        >
                          <img src={product.image} alt="" loading="lazy" className="size-11 shrink-0 rounded-md object-cover" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-gray-800">{product.name}</span>
                          </span>
                          <ChevronRight size={14} className="shrink-0 text-gray-400" />
                        </Link>
                      ))}
                    </div>

                    <Link
                      to={`/shop?category=${encodeURIComponent(category.name)}`}
                      onClick={closeMenu}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#4d9210] hover:underline"
                    >
                      Xem tất cả {products.length} sản phẩm <ChevronRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}

        </div>
      )}
    </div>
  )
}
