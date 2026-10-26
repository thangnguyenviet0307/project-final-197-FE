import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { ProductCard } from "@/features/storefront/components/product-card"
import { storefrontCategories, storefrontProducts } from "@/features/storefront/data/products"
import { SectionHeading } from "@/features/storefront/components/section-heading"

export function FeaturedParts() {
  return (
    <section className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:space-y-16 sm:py-16" aria-label="Khám phá sản phẩm theo danh mục">
      <SectionHeading
        eyebrow="Khám phá cửa hàng"
        title="Chọn phụ kiện theo nhu cầu"
        description="Xem nhanh các nhóm sản phẩm, so sánh giá sỉ và giá chuyển khoản tham khảo, rồi mở danh mục để xem đủ sản phẩm."
      />
      {storefrontCategories.map((category) => {
        const products = storefrontProducts.filter((product) => product.category === category.name)
        return (
          <section key={category.name} aria-labelledby={`discovery-${category.name}`}>
            <div className="mb-5 flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#57952b]">{category.caption}</p>
                <h3 id={`discovery-${category.name}`} className="mt-2 text-2xl font-bold tracking-tight text-gray-950">{category.name}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">{category.description}</p>
              </div>
              <Link
                to={`/shop?category=${encodeURIComponent(category.name)}`}
                className="inline-flex w-fit shrink-0 items-center gap-2 text-sm font-semibold text-gray-700 transition hover:gap-3 hover:text-[#4d9210]"
              >
                Xem {products.length} sản phẩm <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )
      })}
    </section>
  )
}
