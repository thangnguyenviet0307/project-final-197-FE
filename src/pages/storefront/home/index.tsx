
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Headphones,
  ShieldCheck,
  Truck,
  RefreshCcw,
  ShoppingBag,
} from "lucide-react"

export default function StoreHomePage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#f4f7f1]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-6 px-5 py-8 sm:py-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12 lg:py-12">
          <div>
            <span className="inline-flex rounded-full bg-[#55b000]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#459000]">
              Chào mừng đến với Demo Store
            </span>

            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Khám phá những
              <span className="block text-[#55b000]">
                sản phẩm yêu thích
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-gray-600">
              Khám phá bộ sưu tập mới nhất, sản phẩm được yêu thích và đồ dùng thiết yếu tại Demo Store.
            </p>

            <Link
              to="/contact"
              className="mt-5 inline-flex items-center gap-3 rounded-md bg-[#55b000] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#459000]"
            >
              LIÊN HỆ
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <ShoppingBag size={28} className="text-[#459000]" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold text-gray-900">Không gian mua sắm của bạn</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">Sản phẩm mới, lựa chọn nổi bật và những bộ sưu tập dành cho bạn.</p>
            <a href="#collections" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-[#367500] hover:underline">Khám phá bộ sưu tập <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section id="collections" className="scroll-mt-6 bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-[1440px] px-5">
          <h2 className="text-2xl font-bold text-gray-900">
            Khám phá bộ sưu tập
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-7 text-gray-500">
            Các bộ sưu tập sản phẩm sẽ sớm được cập nhật tại đây.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              "Sản phẩm mới",
              "Sản phẩm bán chạy",
              "Sản phẩm nổi bật",
            ].map((name) => (
              <div
                key={name}
                className="flex min-h-32 flex-col items-start justify-center rounded-xl border border-gray-200 bg-gray-50 p-5"
              >
                <h3 className="text-lg font-semibold">
                  {name}
                </h3>
                <span className="mt-3 text-xs text-gray-500">Sắp ra mắt</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1440px] gap-3 px-5 py-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: Truck,
            title: "Giao hàng nhanh",
            description: "Thông tin dịch vụ giao hàng",
          },
          {
            icon: ShieldCheck,
            title: "Mua sắm an toàn",
            description: "Trải nghiệm mua sắm tiện lợi",
          },
          {
            icon: RefreshCcw,
            title: "Đổi trả dễ dàng",
            description: "Thông tin chính sách đổi trả",
          },
          {
            icon: Headphones,
            title: "Hỗ trợ khách hàng",
            description: "Chúng tôi luôn sẵn sàng hỗ trợ",
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-xl border border-gray-200 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#55b000]/10 text-[#55b000]">
                <Icon size={23} />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {item.description}
                </p>
              </div>
            </div>
          )
        })}
      </section>


    </div>
  )
}
