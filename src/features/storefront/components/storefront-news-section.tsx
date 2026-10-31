import { ArrowRight, Newspaper } from "lucide-react"
import { Link } from "react-router-dom"
import { SectionHeading } from "@/features/storefront/components/section-heading"
import { usePublicArticles } from "@/features/storefront/hooks/use-public-articles"
import { getApiError } from "@/services/api"

export function StorefrontNewsSection() {
  const articles = usePublicArticles("news")

  return (
    <section id="tin-tuc" aria-label="Tin tức và cẩm nang phụ kiện" className="bg-[#f5f6f4] py-12 sm:py-16">
      <div className="store-container">
        <SectionHeading
          title="Thông tin hữu ích cho phụ kiện bạn chọn"
          description="Mẹo chọn mua và sử dụng phụ kiện, giúp bạn tìm hiểu kỹ hơn trước khi khám phá sản phẩm."
        />

        {articles.isPending ? (
          <p role="status" className="py-8 text-center text-sm text-gray-500">Đang tải tin tức...</p>
        ) : articles.isError ? (
          <div role="alert" className="space-y-3 py-8 text-center text-sm text-gray-600">
            <p>Không thể tải tin tức. {getApiError(articles.error).message}</p>
            <button type="button" className="font-semibold text-[#4d9210] underline" onClick={() => void articles.refetch()}>
              Thử tải lại
            </button>
          </div>
        ) : articles.data.data.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">Chưa có tin tức được xuất bản.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.data.data.map((article) => (
              <article key={article._id} className="group min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <Link to={`/bai-viet/${encodeURIComponent(article.slug)}`} aria-label={`Đọc bài viết ${article.title}`} className="block overflow-hidden bg-[#f3f4f1]">
                  {article.imageUrl ? (
                    <img src={article.imageUrl} alt={article.title} loading="lazy" className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex aspect-[16/9] w-full items-center justify-center text-[#57952b]" aria-hidden="true"><Newspaper size={40} /></div>
                  )}
                </Link>
                <div className="p-5 sm:p-6">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#57952b]">
                    <Newspaper size={14} />
                    {article.category}
                  </p>
                  <h3 className="mt-3 min-h-14 text-lg font-bold leading-7 text-gray-950">
                    <Link to={`/bai-viet/${encodeURIComponent(article.slug)}`} className="hover:text-[#4d9210]">{article.title}</Link>
                  </h3>
                  <p className="mt-2 min-h-20 text-sm leading-6 text-gray-600">{article.excerpt}</p>
                  <Link to={`/bai-viet/${encodeURIComponent(article.slug)}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4d9210] transition hover:gap-3">
                    Đọc bài viết
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
