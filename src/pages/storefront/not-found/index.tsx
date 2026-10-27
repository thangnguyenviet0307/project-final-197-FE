import { Link } from "react-router-dom"
import { ArrowRight, SearchX } from "lucide-react"

export default function StoreNotFoundPage() {
  return <section className="bg-[#f4f7f1] py-16 text-gray-900 sm:py-24">
    <div className="store-container flex flex-col items-center text-center">
      <div className="mb-6 rounded-full bg-[#55b000]/10 p-6 text-[#459000]"><SearchX size={48} aria-hidden="true" /></div>
      <p className="text-7xl font-black tracking-tight text-[#459000] sm:text-9xl">404</p>
      <h1 className="mt-5 text-2xl font-bold sm:text-3xl">Không tìm thấy trang</h1>
      <p className="mt-4 max-w-lg text-sm leading-7 text-gray-600">Trang bạn đang tìm không tồn tại hoặc đã được chuyển đến địa chỉ khác. Hãy tiếp tục khám phá sản phẩm tại DemoStore.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="rounded-lg bg-[#55b000] px-6 py-3 text-sm font-semibold text-white hover:bg-[#459000]">Về trang chủ</Link>
        <Link to="/shop" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold hover:border-[#55b000]">Xem sản phẩm <ArrowRight size={16} /></Link>
      </div>
      <Link to="/contact" className="mt-6 text-sm text-[#459000] underline underline-offset-4">Liên hệ hỗ trợ</Link>
    </div>
  </section>
}
