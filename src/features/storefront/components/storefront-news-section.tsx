import { ArrowRight, Newspaper } from "lucide-react"
import { Link } from "react-router-dom"
import { storefrontArticles } from "@/features/storefront/data/articles"
import { SectionHeading } from "@/features/storefront/components/section-heading"

export function StorefrontNewsSection() {
  return (
    <section id="tin-tuc" aria-label="Tin tức và cẩm nang phụ kiện" className="bg-[#f5f6f4] py-12 sm:py-16">
      <div className="store-container ">
        <SectionHeading
          eyebrow="Tin tức & cẩm nang"
          title="Thông tin hữu ích cho phụ kiện bạn chọn"
          description="Mẹo chọn mua và sử dụng phụ kiện, giúp bạn tìm hiểu kỹ hơn trước khi khám phá sản phẩm."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {storefrontArticles.map((article) => (
            <article key={article.title} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <Link
                to={`/shop?category=${encodeURIComponent(article.category)}`}
                aria-label={`Xem sản phẩm ${article.category}`}
                className="block overflow-hidden bg-gray-100"
              >
                <img
                  src={article.image}
                  alt={article.category}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="p-5 sm:p-6">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#57952b]">
                  <Newspaper size={14} />
                  {article.label}
                </p>
                <h3 className="mt-3 text-lg font-bold leading-7 text-gray-950">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {article.description}
                </p>
                <Link
                  to={`/shop?category=${encodeURIComponent(article.category)}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4d9210] transition hover:gap-3"
                >
                  Khám phá {article.category}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
