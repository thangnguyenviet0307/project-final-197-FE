import { BaseLayout } from "@/layout/admin/base-layout"
import { PricingPlans } from "@/components/pricing-plans"
import { FeaturesGrid } from "@/pages/template/pricing/components/features-grid"
import { FAQSection } from "@/pages/template/pricing/components/faq-section"

// Import data
import { features as featuresData } from "@/pages/template/pricing/data/features"
import faqsData from "@/pages/template/pricing/data/faqs.json"

export default function PricingPage() {
  return (
    <BaseLayout
      title="Pricing Plans"
      description="Choose the perfect plan for your team"
    >
      <div className="px-4 lg:px-6">
        {/* Pricing Cards */}
        <section className="pb-12" id="pricing">
          <PricingPlans mode="pricing" />
        </section>

        {/* Features Section */}
        <FeaturesGrid features={featuresData} />

        {/* FAQ Section */}
        <FAQSection faqs={faqsData} />
      </div>
    </BaseLayout>
  )
}
