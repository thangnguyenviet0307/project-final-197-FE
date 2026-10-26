import { Check, ExternalLink, Search } from "lucide-react"
import { SectionHeading } from "./section-heading"

const guides = [
  {
    Icon: Search,
    title: "Bắt đầu từ nhu cầu",
    description: "Chọn danh mục trước: cáp sạc, tai nghe, pin dự phòng, phụ kiện máy tính, loa hoặc kính cường lực.",
  },
  {
    Icon: Check,
    title: "Đối chiếu thiết bị tương thích",
    description: "Với cáp và kính, hãy kiểm tra đúng cổng kết nối hoặc dòng máy. Với phụ kiện khác, xem kiểu kết nối và quy cách.",
  },
  {
    Icon: ExternalLink,
    title: "Kiểm tra giá và thông tin mới nhất",
    description: "Giá hiển thị là giá tham khảo từ website nguồn; mở liên kết sản phẩm để xác nhận giá, chi tiết và tình trạng hiện tại.",
  },
]

export function StorefrontBuyingGuide() {
  return (
    <section className="bg-[#f5f6f4] py-12 sm:py-16" aria-label="Hướng dẫn khám phá sản phẩm">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Mua sắm dễ dàng"
          title="Cách chọn đúng phụ kiện"
          description="Một vài bước kiểm tra giúp bạn tìm được sản phẩm phù hợp và xem đúng thông tin từ nguồn."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {guides.map(({ Icon, title, description }, index) => (
            <article key={title} className="border border-gray-100 bg-white p-5 sm:p-6">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#edf6e6] text-[#57952b]">
                <Icon size={19} />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#57952b]">Bước {index + 1}</p>
              <h3 className="mt-2 text-lg font-bold text-gray-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
