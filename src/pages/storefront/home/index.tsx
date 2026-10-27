import { Image, PackageCheck, Search, Shapes } from "lucide-react"
import { CollectionGallery } from "@/features/storefront/components/collection-gallery"
import { FeaturedParts } from "@/features/storefront/components/featured-parts"
import { HomeCategoryLinks } from "@/features/storefront/components/home-category-links"
import { HomeHeroSlider } from "@/features/storefront/components/home-hero-slider"
import { StorefrontBuyingGuide } from "@/features/storefront/components/storefront-buying-guide"
import { StorefrontNewsSection } from "@/features/storefront/components/storefront-news-section"

const storeBenefits = [
  { Icon: Search, title: "Tìm theo nhu cầu", description: "Khám phá từng nhóm phụ kiện" },
  { Icon: Image, title: "Xem hình sản phẩm", description: "Tham khảo hình ảnh trực quan" },
  { Icon: Shapes, title: "Nhiều danh mục", description: "Từ cáp sạc đến phụ kiện máy tính" },
  { Icon: PackageCheck, title: "Chi tiết sản phẩm", description: "Xem thông tin trước khi chọn mua" },
]

export default function StorefrontHomePage() {
  return (
    <div className="bg-white">
      <HomeHeroSlider />
      <HomeCategoryLinks />

      <section aria-label="Khám phá cửa hàng" className="store-container pt-8 sm:pt-10">
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
      <StorefrontBuyingGuide />
      <StorefrontNewsSection />
    </div>
  )
}
