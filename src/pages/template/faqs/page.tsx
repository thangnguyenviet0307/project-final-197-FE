import { BaseLayout } from "@/layout/admin/base-layout"
import { FAQList } from "@/pages/template/faqs/components/faq-list"
import { FeaturesGrid } from "@/pages/template/faqs/components/features-grid"

// Import data
import categoriesData from "@/pages/template/faqs/data/categories.json"
import faqsData from "@/pages/template/faqs/data/faqs.json"
import { features as featuresData } from "@/pages/template/faqs/data/features"

export default function FAQsPage() {
  return (
    <BaseLayout
      title="Frequently Asked Questions"
      description="Everything you need to know about our different services."
    >
      <div className="px-4 lg:px-6">
        <FAQList faqs={faqsData} categories={categoriesData} />
        <FeaturesGrid features={featuresData} />
      </div>
    </BaseLayout>
  )
}
