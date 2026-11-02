import { Link } from "react-router-dom"
import { ShieldCheck, ArrowRight, ClipboardList, Wrench, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePolicy } from "@/features/support/hooks/use-support"
import { policySections, supportDate } from "@/features/support/utils/support"
import { policyDocuments } from "@/features/support/utils/policy-documents"
import { getApiError } from "@/services/api"

export default function PolicyPage() {
  const query = usePolicy()
  const content = query.data?.content
  return <main className="bg-[#f7f9f5] text-gray-900">
    <div className="store-container py-10 sm:py-14">
      <nav aria-label="Đường dẫn" className="mb-6 text-sm text-gray-500"><Link to="/" className="hover:underline">Trang chủ</Link> / Chính sách & bảo hành</nav>
      <header className="rounded-3xl bg-[#253529] p-7 text-white sm:p-12">
        <ShieldCheck className="mb-5 size-10 text-[#9ddd66]" />
        <p className="text-sm font-semibold uppercase tracking-widest text-[#9ddd66]">Đồng hành sau mua hàng</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Chính sách & bảo hành</h1>
        <p className="mt-5 max-w-2xl leading-7 text-gray-200">Tìm hiểu điều kiện mua hàng, cách gửi yêu cầu và theo dõi quá trình hỗ trợ của cửa hàng.</p>
        <Link to="/account/warranty" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#65b719] px-6 py-3 font-semibold text-white hover:bg-[#559d13]">Gửi yêu cầu bảo hành <ArrowRight size={18} /></Link>
      </header>
      <nav aria-label="Chính sách dành cho khách hàng" className="mt-6 grid gap-3 sm:grid-cols-3">{policyDocuments.map(document => <Link key={document.key} to={document.path} className="rounded-2xl border border-gray-200 bg-white p-5 font-semibold text-[#4d9210] transition hover:border-[#65b719]">{document.title} →</Link>)}</nav>
      <section aria-label="Quy trình bảo hành" className="my-8 grid gap-4 sm:grid-cols-3">
        {[{ Icon: ClipboardList, title: "1. Gửi yêu cầu", text: "Chọn sản phẩm trong đơn đã hoàn tất, mô tả lỗi và bổ sung ảnh." }, { Icon: Wrench, title: "2. Kiểm tra & xử lý", text: "Nhân viên kiểm tra điều kiện và cập nhật phương án xử lý." }, { Icon: CheckCircle2, title: "3. Theo dõi kết quả", text: "Xem phản hồi và lịch sử xử lý trong tài khoản của bạn." }].map(({ Icon, title, text }) => <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6"><Icon className="mb-4 text-[#559d13]" /><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{text}</p></div>)}
      </section>
      {query.isPending ? <p role="status">Đang tải chính sách…</p> : query.isError ? <div role="alert" className="rounded-2xl bg-white p-6"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Thử lại</Button></div> : query.data ? <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="self-start rounded-2xl border border-gray-200 bg-white p-6"><h2 className="mb-4 font-bold">Nội dung chính sách</h2><nav aria-label="Mục lục chính sách" className="space-y-3">{policySections.map(section => <a key={section.key} href={`#${section.key}`} className="block text-sm text-gray-600 hover:text-[#559d13]">{section.title}</a>)}</nav>{query.data.publishedAt && <p className="mt-6 text-xs text-gray-500">Cập nhật: {supportDate(query.data.publishedAt)}</p>}</aside>
        <div className="space-y-5">{policySections.map(section => <section id={section.key} key={section.key} className="scroll-mt-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"><h2 className="text-xl font-bold">{section.title}</h2><p className="mt-4 whitespace-pre-wrap break-words leading-8 text-gray-600">{content?.[section.key]?.trim() || "Nội dung này đang được cập nhật. Vui lòng liên hệ cửa hàng để xác nhận thông tin."}</p></section>)}</div>
      </div> : <div className="rounded-2xl border border-gray-200 bg-white p-8"><h2 className="text-xl font-bold">Chính sách đang được cập nhật</h2><p className="mt-3 text-gray-600">Cửa hàng chưa công bố nội dung chính sách. Vui lòng liên hệ để xác nhận điều kiện áp dụng cho sản phẩm trước khi mua hoặc gửi bảo hành.</p><Link to="/contact" className="mt-4 inline-block font-semibold text-[#559d13]">Liên hệ cửa hàng →</Link></div>}
    </div>
  </main>
}
