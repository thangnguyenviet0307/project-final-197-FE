import { Globe2, MapPin, RotateCcw, Truck } from "lucide-react"
import { CollectionGallery } from "@/features/storefront/components/collection-gallery"
import { FeaturedParts } from "@/features/storefront/components/featured-parts"
import { HomeCategoryLinks } from "@/features/storefront/components/home-category-links"
import { HomeHeroSlider } from "@/features/storefront/components/home-hero-slider"
import { StorefrontBuyingGuide } from "@/features/storefront/components/storefront-buying-guide"
import { StorefrontNewsSection } from "@/features/storefront/components/storefront-news-section"

const storeBenefits = [
  { Icon: Truck, title: "Giao hàng nhanh", description: "Thông tin giao hàng rõ ràng" },
  { Icon: MapPin, title: "Nhận hàng linh hoạt", description: "Tư vấn điểm nhận phù hợp" },
  { Icon: Globe2, title: "Hỗ trợ nhiều khu vực", description: "Liên hệ để biết chính sách giao hàng" },
  { Icon: RotateCcw, title: "Chính sách đổi trả", description: "Mua sắm với thông tin minh bạch" },
]

export default function StorefrontHomePage() {
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
      <StorefrontBuyingGuide />
      <StorefrontNewsSection />
    </div>
  )
}
