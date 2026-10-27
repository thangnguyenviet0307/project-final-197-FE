import { FeaturedParts } from "@/features/storefront/components/featured-parts"
import { HomeHeroSlider } from "@/features/storefront/components/home-hero-slider"
import { StorefrontNewsSection } from "@/features/storefront/components/storefront-news-section"

export default function StorefrontHomePage() {
  return (
    <div className="bg-white">
      <HomeHeroSlider />
      <FeaturedParts />
      <StorefrontNewsSection />
    </div>
  )
}
