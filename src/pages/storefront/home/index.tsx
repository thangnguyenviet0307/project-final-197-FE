import { ProductSection } from "@/features/storefront/components/product-section"
import { FeaturedParts } from "@/features/storefront/components/featured-parts"
import { HomeHeroSlider } from "@/features/storefront/components/home-hero-slider"
import { StorefrontBuyingGuide } from "@/features/storefront/components/storefront-buying-guide"
import { StorefrontNewsSection } from "@/features/storefront/components/storefront-news-section"

export default function StorefrontHomePage() {
  return (
    <div className="bg-white">
      <HomeHeroSlider />
      <div className="store-home-sections">
      <div id="san-pham"><FeaturedParts /></div>
      <div><ProductSection title="Best Seller" filters={{ is_best_seller: true }} /></div>
      <div><StorefrontBuyingGuide /></div>
      <div><StorefrontNewsSection /></div>
      </div>
    </div>
  )
}
