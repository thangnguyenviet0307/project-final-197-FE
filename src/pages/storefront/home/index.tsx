import { Globe2, MapPin, RotateCcw, Truck } from "lucide-react"
import { CollectionGallery } from "@/features/storefront/components/collection-gallery"
import { CustomerStories } from "@/features/storefront/components/customer-stories"
import { FeaturedParts } from "@/features/storefront/components/featured-parts"
import { HomeCategoryLinks } from "@/features/storefront/components/home-category-links"
import { HomeHeroSlider } from "@/features/storefront/components/home-hero-slider"
import { ProductCard } from "@/features/storefront/components/product-card"
import { SectionHeading } from "@/features/storefront/components/section-heading"
import { storefrontProducts } from "@/features/storefront/data/products"

const storeBenefits = [
  { Icon: Truck, title: "Giao hàng nhanh", description: "Thông tin giao hàng rõ ràng" },
  { Icon: MapPin, title: "Nhận hàng linh hoạt", description: "Tư vấn điểm nhận phù hợp" },
  { Icon: Globe2, title: "Hỗ trợ nhiều khu vực", description: "Liên hệ để biết chính sách giao hàng" },
  { Icon: RotateCcw, title: "Chính sách đổi trả", description: "Mua sắm với thông tin minh bạch" },
]

export default function StorefrontHomePage() {
  const featuredProducts = storefrontProducts.slice(0, 3)
  const topRatedProducts = [...storefrontProducts]
    .sort((left, right) => right.rating - left.rating || right.reviewCount - left.reviewCount)
    .slice(0, 3)
  const bestSellers = [...storefrontProducts]
    .sort((left, right) => right.soldCount - left.soldCount)
    .slice(0, 3)

  return (
    <div className="bg-white">
      <HomeHeroSlider />
      <HomeCategoryLinks />

      <section aria-label="Cam kết cửa hàng" className="mx-auto max-w-7xl px-4 pt-8 sm:pt-10">
        <div className="grid divide-y divide-gray-100 border-y border-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {storeBenefits.map(({ Icon, title, description }) => (
            <div key={title} className="flex items-center gap-4 px-4 py-5 sm:px-5 sm:py-6">
              <span className="flex size-10 shrink-0 items-center justify-center text-[#57952b]">
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <span>
                <span className="block text-sm font-bold text-gray-900">{title}</span>
                <span className="mt-1 block text-xs text-gray-500">{description}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <CollectionGallery />
      <FeaturedParts />

      <section id="san-pham-noi-bat" className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <SectionHeading
          eyebrow="Khám phá thêm"
          title="Sản phẩm nổi bật"
          to="/shop"
          linkLabel="Xem tất cả"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <SectionHeading
          eyebrow="Khách hàng lựa chọn"
          title="Sản phẩm được đánh giá cao"
          to="/shop?sort=popular"
          linkLabel="Xem thêm"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {topRatedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <SectionHeading eyebrow="Bán chạy" title="Sản phẩm bán chạy" to="/shop?sort=popular" linkLabel="Xem tất cả" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {bestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <CustomerStories />
    </div>
  )
}
