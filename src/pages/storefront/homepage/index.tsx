import { HeroSection } from "./sections/hero-section"
import { ServiceSection, PromotionSection } from "./sections/promotion-section"
import { FeaturedSection, TrendingSection, ProductLists } from "./sections/product-sections"
import { DealSection } from "./sections/deal-section"
import { TestimonialsSection } from "./sections/testimonials-section"
import "./homepage.css"

export default function Homepage() {
  return (
    <div className="am-home">
      <HeroSection />
      <ServiceSection />
      <PromotionSection />
      <FeaturedSection />
      <DealSection />
      <TrendingSection />
      <ProductLists />
      <TestimonialsSection />
    </div>
  )
}
