import { ArrowRight, Newspaper } from "lucide-react"
import { Link } from "react-router-dom"
import { storefrontCategories } from "@/features/storefront/data/products"
import { SectionHeading } from "@/features/storefront/components/section-heading"

const newsItems = [
  {
    category: "Dây cáp sạc",
    label: "CẨM NANG CHỌN MUA",
    title: "Chọn cáp sạc phù hợp: bắt đầu từ cổng kết nối",
    description:
      "Xác định cổng kết nối trên thiết bị và củ sạc trước khi chọn cáp. Đừng quên kiểm tra chiều dài mong muốn và thông tin sản phẩm cụ thể.",
  },
  {
    category: "Tai nghe",
    label: "GỢI Ý SỬ DỤNG",
    title: "Tai nghe có dây hay Bluetooth: đâu là lựa chọn của bạn?",
    description:
      "Thường xuyên di chuyển hay chủ yếu nghe tại bàn làm việc? Xác định thói quen sử dụng sẽ giúp bạn cân nhắc kiểu kết nối và thiết kế phù hợp.",
  },
  {
    category: "Kính cường lực",
    label: "MẸO MUA SẮM",
    title: "Ba điều cần kiểm tra trước khi mua kính cường lực",
    description:
      "Đối chiếu đúng tên dòng máy, kích thước màn hình và phần camera trước khi đặt mua để chọn loại kính tương thích với thiết bị.",
  },
]

const articles = newsItems.map((item) => {
  const category = storefrontCategories.find(
    (storefrontCategory) => storefrontCategory.name === item.category,
  )

  if (!category) {
    throw new Error(`Missing storefront category for news article "${item.title}"`)
  }

  return { ...item, image: category.image }
})

export function StorefrontNewsSection() {
  return (
    <section id="tin-tuc" aria-label="Tin tức và cẩm nang phụ kiện" className="bg-[#f5f6f4] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Tin tức & cẩm nang"
          title="Thông tin hữu ích cho phụ kiện bạn chọn"
          description="Mẹo chọn mua và sử dụng phụ kiện, giúp bạn tìm hiểu kỹ hơn trước khi khám phá sản phẩm."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((article) => (
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
