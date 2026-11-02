import { Link, useLocation } from "react-router-dom"
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePolicy } from "@/features/support/hooks/use-support"
import { companyInformationLinks, customerSupportLinks, policyDocuments } from "@/features/support/utils/policy-documents"
import { supportDate } from "@/features/support/utils/support"
import { getApiError } from "@/services/api"

export default function PolicyDetailPage() {
  const { pathname } = useLocation()
  const document = policyDocuments.find(item => item.path === pathname.replace(/\/$/, ""))
  const query = usePolicy()
  if (!document) return <div className="store-container py-12"><Link to="/chinh-sach-bao-hanh">Xem chính sách cửa hàng</Link></div>
  const text = query.data?.content[document.key]?.trim()
  return <main className="min-h-[65vh] bg-[#f7f9f5] text-gray-900"><div className="store-container py-10 sm:py-14">
    <nav aria-label="Đường dẫn" className="mb-6 flex flex-wrap gap-2 text-sm text-gray-500"><Link to="/" className="hover:underline">Trang chủ</Link><span>/</span><Link to="/chinh-sach-bao-hanh" className="hover:underline">Chính sách cửa hàng</Link><span>/</span><span aria-current="page">{document.title}</span></nav>
    <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6">
        {[{ title: "Về chúng tôi", items: companyInformationLinks }, { title: "Hỗ trợ khách hàng", items: customerSupportLinks }].map(group => <section key={group.title}>
          <h2 className="font-bold">{group.title}</h2>
          <nav aria-label={group.title} className="mt-4 space-y-2">{group.items.map(item => item.path ? <Link key={item.label} to={item.path} aria-current={item.path === document.path ? "page" : undefined} className={`block rounded-lg px-3 py-3 text-sm ${item.path === document.path ? "bg-green-50 font-semibold text-green-800" : "text-gray-600 hover:bg-gray-50"}`}>{item.label}</Link> : <span key={item.label} aria-disabled="true" title="Đang cập nhật" className="block rounded-lg px-3 py-3 text-sm text-gray-500">{item.label}</span>)}</nav>
        </section>)}
      </aside>
      <div className="min-w-0 space-y-6">
      <header className="rounded-3xl bg-[#253529] p-7 text-white sm:p-10"><ShieldCheck className="mb-5 size-9 text-[#9ddd66]" /><p className="text-sm font-semibold uppercase tracking-widest text-[#9ddd66]">Thông tin dành cho khách hàng</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">{document.title}</h1><p className="mt-4 max-w-2xl leading-7 text-gray-200">{document.description}</p></header>
      <article className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-9" aria-label={document.title}>
        {query.isPending ? <p role="status">Đang tải chính sách…</p> : query.isError ? <div role="alert" className="space-y-4"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Thử lại</Button></div> : text ? <>{query.data?.publishedAt && <p className="mb-6 border-b border-gray-100 pb-4 text-sm text-gray-500">Cập nhật: {supportDate(query.data.publishedAt)}</p>}<div className="whitespace-pre-wrap break-words leading-8 text-gray-700">{text}</div></> : <div><h2 className="text-xl font-bold">{document.title} đang được cập nhật</h2><p className="mt-4 leading-7 text-gray-600">Nội dung này chưa được cửa hàng công bố. Vui lòng liên hệ để xác nhận thông tin áp dụng trước khi sử dụng dịch vụ hoặc gửi trả sản phẩm.</p></div>}
        <div className="mt-8 border-t border-gray-100 pt-6"><p className="font-semibold">Bạn cần trao đổi thêm?</p><p className="mt-2 text-sm leading-6 text-gray-600">Xem kênh liên hệ của cửa hàng. Nếu vấn đề liên quan đơn hàng, hãy chuẩn bị mã đơn và thông tin sản phẩm.</p><Link to="/contact" className="mt-4 inline-flex items-center gap-2 font-semibold text-[#559d13] hover:underline">Liên hệ cửa hàng <ArrowRight size={16} /></Link></div>
      </article>
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#559d13]"><ArrowLeft size={16} /> Tiếp tục mua sắm</Link>
      </div>
    </div>
  </div></main>
}
