import { ArrowRight, Newspaper } from "lucide-react"
import { Link } from "react-router-dom"
import { storefrontArticles } from "@/features/storefront/data/articles"
import { SectionHeading } from "@/features/storefront/components/section-heading"

export function StorefrontNewsSection() {
  return (
    <section id="tin-tuc" aria-label="Tin tức và cẩm nang phụ kiện" className="bg-white py-12 sm:py-16">
      <div className="store-container">
        <SectionHeading
          eyebrow="Góc chia sẻ"
          title="Tin tức và mẹo sử dụng phụ kiện"
          description="Cập nhật hướng dẫn chọn mua, sử dụng phụ kiện và những thông tin hữu ích dành cho thiết bị của bạn."
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {storefrontArticles.map((article) => (
            <article key={article.title} className="group min-w-0 overflow-hidden border border-gray-200 bg-white transition-shadow hover:shadow-lg">
              <Link
                to={`/shop?category=${encodeURIComponent(article.category)}`}
                aria-label={`Xem danh mục ${article.category}`}
                className="block overflow-hidden bg-[#f3f4f1]"
              >
                <img
                  src={article.image}
                  alt={article.category}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="p-5 sm:p-6">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#57952b]">
                  <Newspaper size={14} />
                  {article.label}
                </p>
                <h3 className="mt-3 min-h-14 text-lg font-bold leading-7 text-gray-950">
                  {article.title}
                </h3>
                <p className="mt-2 min-h-20 text-sm leading-6 text-gray-600">
                  {article.description}
                </p>
                <Link
                  to={`/shop?category=${encodeURIComponent(article.category)}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4d9210] transition hover:gap-3"
                >
                  Xem danh mục {article.category}
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
