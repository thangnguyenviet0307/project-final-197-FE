import { useState } from "react"
import { ProductSection } from "@/features/storefront/components/product-section"

export function FeaturedParts() {
  const [selection, setSelection] = useState<"is_home" | "is_new" | "is_hot">("is_home")
  return <ProductSection key={selection} title="Sản phẩm" filters={{ [selection]: true }}>
    <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-gray-200 bg-gray-100/80 p-1.5" aria-label="Lọc sản phẩm trang chủ">{([
      ["is_home", "Trang chủ"], ["is_new", "Mới"], ["is_hot", "Nổi bật"],
    ] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={selection === value} onClick={() => setSelection(value)} className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${selection === value ? "bg-white text-green-800 shadow-sm" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}>{label}</button>)}</div>
  </ProductSection>
}
