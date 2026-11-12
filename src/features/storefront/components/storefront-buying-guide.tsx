import { Check, Search, ShoppingBag } from 'lucide-react';
import { SectionHeading } from './section-heading';

const guides = [
  {
    Icon: Search,
    title: 'Bắt đầu từ nhu cầu',
    description:
      'Chọn danh mục trước: cáp sạc, tai nghe, pin dự phòng, phụ kiện máy tính, loa hoặc kính cường lực.',
  },
  {
    Icon: Check,
    title: 'Đối chiếu thiết bị tương thích',
    description:
      'Với cáp và kính, hãy kiểm tra đúng cổng kết nối hoặc dòng máy. Với phụ kiện khác, xem kiểu kết nối và quy cách.',
  },
  {
    Icon: ShoppingBag,
    title: 'Xem kỹ sản phẩm',
    description:
      'Mở trang chi tiết để xem hình ảnh, thông tin mô tả và các sản phẩm liên quan trước khi lựa chọn.',
  },
];

export function StorefrontBuyingGuide() {
  return (
    <section
      className="bg-[#f5f6f4] py-12 sm:py-16"
      aria-label="Hướng dẫn khám phá sản phẩm"
    >
      <div className="store-container">
        <SectionHeading
          title="Cách chọn đúng phụ kiện"
          description="Một vài bước đơn giản giúp bạn tìm và chọn phụ kiện phù hợp với thiết bị đang sử dụng."
        />
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {guides.map(({ Icon, title, description }, index) => (
            <article
              key={title}
              className="relative h-full rounded-2xl border border-t-[3px] border-[#d7e5cb] border-t-[#57952b] bg-[#f8fbf5] p-6 shadow-[0_8px_24px_-12px_rgba(42,78,22,0.25)] sm:p-7"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-[#dce8d2] bg-white text-[#417d23] shadow-sm">
                  <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span
                  aria-hidden="true"
                  className="text-4xl leading-none font-bold tracking-tight text-[#d9e7ce] sm:text-5xl"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="mt-6 text-xs font-bold tracking-[0.14em] text-[#417d23] uppercase">
                Bước {index + 1}
              </p>
              <h3 className="mt-2 text-lg leading-7 font-bold text-gray-950">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
