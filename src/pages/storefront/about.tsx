import {
  ArrowRight,
  Compass,
  Eye,
  Lightbulb,
  PackageSearch,
  Sparkles,
} from "lucide-react"
import { Link } from "react-router-dom"

const principles = [
  {
    icon: Eye,
    title: "Rõ ràng",
    description:
      "Thông tin sản phẩm, phiên bản và đánh giá được trình bày tại nơi bạn cần xem, giúp việc tìm hiểu dễ dàng hơn.",
  },
  {
    icon: Compass,
    title: "Thuận tiện",
    description:
      "Danh mục, tìm kiếm và bài viết giúp bạn bắt đầu từ nhu cầu của mình và lần lượt khám phá nội dung liên quan.",
  },
  {
    icon: Lightbulb,
    title: "Minh bạch",
    description:
      "Chúng tôi phân biệt rõ tính năng đang dùng được và phần chưa triển khai, không biến nội dung tham khảo thành lời hứa giao dịch.",
  },
]

const offerings = [
  {
    title: "Danh mục sản phẩm",
    description:
      "Khám phá phụ kiện và thiết bị công nghệ theo danh mục, thương hiệu hoặc từ khóa.",
  },
  {
    title: "Thông tin chi tiết",
    description:
      "Xem hình ảnh, mô tả, lựa chọn phiên bản và giá đang hiển thị trên trang sản phẩm.",
  },
  {
    title: "Bài viết và đánh giá",
    description:
      "Đọc bài viết tham khảo và xem đánh giá được hiển thị tại từng sản phẩm.",
  },
  {
    title: "Tài khoản khách hàng",
    description:
      "Đăng ký để quản lý hồ sơ, địa chỉ mặc định, mật khẩu và lịch sử đơn hàng hiện có.",
  },
]

const steps = [
  {
    number: "01",
    title: "Tìm điều bạn quan tâm",
    description:
      "Chọn danh mục trên thanh điều hướng hoặc nhập tên sản phẩm, thương hiệu vào ô tìm kiếm.",
  },
  {
    number: "02",
    title: "Xem thông tin sản phẩm",
    description:
      "Mở sản phẩm để xem nội dung, các phiên bản và đánh giá nếu có. Thông tin có thể khác nhau giữa các sản phẩm.",
  },
  {
    number: "03",
    title: "Tham khảo trước khi quyết định",
    description:
      "Đọc bài viết và câu hỏi thường gặp để hiểu phạm vi dịch vụ hiện tại. Website chưa hỗ trợ đặt hàng hoặc thanh toán.",
  },
]

export default function StorefrontAboutPage() {
  return (
    <div className="bg-white text-gray-900">
      <section className="relative isolate overflow-hidden bg-[#223328] text-white">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-32 size-96 rounded-full bg-[#55b000]/20 blur-3xl"
        />
        <div className="store-container relative py-16 sm:py-24 lg:py-28">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#99df54]">
            <Sparkles size={15} aria-hidden="true" />
            VỀ DEMOSTORE
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Khám phá công nghệ,
            <span className="block text-[#99df54]">theo cách thật dễ dàng.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-gray-300 sm:text-lg">
            DemoStore là cửa hàng trực tuyến giới thiệu phụ kiện và thiết bị
            công nghệ. Bạn có thể tìm sản phẩm, xem thông tin chi tiết, đọc bài
            viết và tham khảo đánh giá — tất cả trong một trải nghiệm đơn giản,
            dễ theo dõi.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-md bg-[#65b719] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#4d9210]"
            >
              Khám phá sản phẩm
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Câu hỏi thường gặp
            </Link>
          </div>
        </div>
      </section>

      <section className="store-container py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#57952b]">
              CÂU CHUYỆN CỦA CHÚNG TÔI
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Công nghệ dễ khám phá hơn khi thông tin được sắp xếp rõ ràng.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-gray-600">
            <p>
              DemoStore được xây dựng như một điểm đến để tìm hiểu sản phẩm
              công nghệ. Từ danh mục và thương hiệu đến trang chi tiết, các
              thông tin được sắp xếp để bạn dễ tìm, dễ đọc và dễ so sánh những
              lựa chọn đang được giới thiệu.
            </p>
            <p>
              Bên cạnh catalog, website có bài viết, đánh giá sản phẩm và tài
              khoản khách hàng. Chúng tôi muốn việc tham khảo trở nên thuận
              tiện, dù bạn đang tìm một sản phẩm cụ thể hay chỉ đang khám phá
              những lựa chọn mới.
            </p>
            <p>
              DemoStore hiện ưu tiên trải nghiệm xem và tìm hiểu. Các chức năng
              mua hàng sẽ chỉ được giới thiệu khi đã sẵn sàng; vui lòng xem lưu
              ý về dịch vụ bên dưới để biết phạm vi hoạt động hiện tại.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-[#f7faf5]">
        <div className="store-container py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#57952b]">
              BẠN CÓ THỂ LÀM GÌ?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Mọi thứ cần thiết để tìm hiểu sản phẩm
            </h2>
          </div>
          <div className="mx-auto mt-9 grid max-w-5xl gap-4 sm:grid-cols-2">
            {offerings.map((item, index) => (
              <article
                key={item.title}
                className="flex gap-4 rounded-xl border border-gray-100 bg-white p-5 sm:p-6"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#55b000]/10 text-sm font-bold text-[#4d9210]">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="store-container py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#57952b]">
              CÁCH CHÚNG TÔI LÀM
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Một trải nghiệm đơn giản, hữu ích
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#55b000]/10 text-[#4d9210]">
                  <Icon size={23} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="store-container py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#57952b]">
              BẮT ĐẦU TỪ ĐÂU?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Ba bước để khám phá DemoStore
            </h2>
          </div>
          <ol className="mt-9 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.number}
                className="rounded-xl border border-gray-200 p-6 sm:p-7"
              >
                <span className="text-sm font-extrabold tracking-widest text-[#57952b]">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="store-container pb-16 sm:pb-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-2xl border border-[#dcebcf] bg-[#f7faf5] p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#4d9210] shadow-sm">
            <PackageSearch size={24} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Lưu ý về phạm vi hiện tại</h2>
            <p className="mt-2 text-sm leading-7 text-gray-600">
              DemoStore hiện hỗ trợ khám phá và tham khảo thông tin sản phẩm.
              Tính năng đặt hàng, thanh toán và gửi lời nhắn từ biểu mẫu liên
              hệ chưa khả dụng; các nội dung về giao hàng, đổi trả và bảo hành
              cũng chưa được công bố thành chính sách chính thức.
            </p>
          </div>
          <Link
            to="/faq"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#4d9210] hover:underline"
          >
            Xem câu hỏi thường gặp
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
