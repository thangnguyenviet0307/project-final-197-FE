
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
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex rounded-full bg-[#55b000]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#459000]">
              Chào mừng đến với Demo Store
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Khám phá những
              <span className="block text-[#55b000]">
                sản phẩm yêu thích
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-gray-600">
              Khám phá bộ sưu tập mới nhất, sản phẩm được yêu thích và đồ dùng thiết yếu tại Demo Store.
            </p>

            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-3 rounded-md bg-[#55b000] px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-[#459000]"
            >
              LIÊN HỆ
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="relative flex min-h-[320px] items-center justify-center rounded-3xl bg-[#223328] p-10 text-white lg:min-h-[430px]">
            <div className="absolute left-7 top-7 h-24 w-24 rounded-full border-[14px] border-[#55b000]/20" />

            <div className="absolute bottom-7 right-7 h-32 w-32 rounded-full border-[18px] border-[#55b000]/20" />

            <div className="relative flex flex-col items-center gap-5 text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#55b000]/20">
                <ShoppingBag
                  size={62}
                  className="text-[#a4e665]"
                />
              </div>

              <h2 className="text-3xl font-extrabold tracking-wider">
                DEMO STORE
              </h2>

              <p className="max-w-xs text-sm leading-7 text-gray-300">
                Điểm đến mua sắm trực tuyến của bạn
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-5 py-12 md:grid-cols-2 xl:grid-cols-4">
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
              className="flex items-center gap-4 rounded-xl border border-gray-200 p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#55b000]/10 text-[#55b000]">
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

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-[1440px] px-5 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Khám phá bộ sưu tập
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
            Các bộ sưu tập sản phẩm sẽ sớm được cập nhật tại đây.
          </p>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              "Sản phẩm mới",
              "Sản phẩm bán chạy",
              "Sản phẩm nổi bật",
            ].map((name) => (
              <div
                key={name}
                className="flex min-h-44 items-center justify-center rounded-xl border border-gray-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold">
                  {name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
