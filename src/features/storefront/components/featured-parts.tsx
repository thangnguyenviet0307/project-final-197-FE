import { useEffect, useState } from "react"
import { Clock3 } from "lucide-react"
import { ProductCard } from "@/features/storefront/components/product-card"
import { storefrontProducts } from "@/features/storefront/data/products"

const tabs = [
  { id: "sale", label: "Sản phẩm ưu đãi" },
  { id: "bestseller", label: "Bán chạy nhất" },
  { id: "top-rated", label: "Đánh giá cao" },
] as const

type FeaturedTab = (typeof tabs)[number]["id"]

function useSaleCountdown() {
  const [remaining, setRemaining] = useState(5 * 60 * 60 + 28 * 60 + 36)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60
  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0"))
}

export function FeaturedParts() {
  const [activeTab, setActiveTab] = useState<FeaturedTab>("sale")
  const countdown = useSaleCountdown()
  const products = [...storefrontProducts]
  const tabProducts = {
    sale: products.filter((product) => product.compareAtPrice).slice(0, 4),
    bestseller: products.sort((left, right) => right.soldCount - left.soldCount).slice(0, 4),
    "top-rated": products.sort((left, right) => right.rating - left.rating).slice(0, 4),
  }[activeTab]

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16" aria-labelledby="featured-parts-title">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#57952b]">Các lựa chọn trong cửa hàng</p>
          <h2 id="featured-parts-title" className="mt-2 text-2xl font-bold uppercase tracking-tight text-gray-950 sm:text-3xl">
            Sản phẩm tuyển chọn
          </h2>
        </div>
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Lọc sản phẩm nổi bật">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`featured-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="featured-tab-panel"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition sm:px-4 ${activeTab === tab.id ? "border-[#57952b] text-[#457d22]" : "border-transparent text-gray-500 hover:text-gray-900"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{tabs.find((tab) => tab.id === activeTab)?.label}</p>
        {activeTab === "sale" && (
          <p className="flex items-center gap-2 text-xs font-semibold text-[#57952b]" aria-label={`Ưu đãi kết thúc sau ${countdown.join(":")}`}>
            <Clock3 size={15} /> Kết thúc sau {countdown.join(" : ")}
          </p>
        )}
      </div>
      <div id="featured-tab-panel" role="tabpanel" aria-labelledby={`featured-tab-${activeTab}`} className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {tabProducts.map((product) => <ProductCard key={`${activeTab}-${product.id}`} product={product} />)}
      </div>
    </section>
  )
}
