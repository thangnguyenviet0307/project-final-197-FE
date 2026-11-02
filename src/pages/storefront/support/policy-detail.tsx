import { Link, useLocation } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePolicy } from "@/features/support/hooks/use-support"
import { policyDocuments } from "@/features/support/utils/policy-documents"
import { supportDate } from "@/features/support/utils/support"
import { StoreInformationLayout } from "@/features/support/components/store-information-layout"
import { getApiError } from "@/services/api"

export default function PolicyDetailPage() {
  const { pathname } = useLocation()
  const document = policyDocuments.find(item => item.path === pathname.replace(/\/$/, ""))
  const query = usePolicy()
  if (!document) return <div className="store-container py-12"><Link to="/chinh-sach-bao-hanh">Xem chính sách cửa hàng</Link></div>
  const text = query.data?.content[document.key]?.trim()
  return <StoreInformationLayout title={document.title} description={document.description} path={document.path}>
        {query.isPending ? <p role="status">Đang tải chính sách…</p> : query.isError ? <div role="alert" className="space-y-4"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Thử lại</Button></div> : text ? <>{query.data?.publishedAt && <p className="mb-6 border-b border-gray-100 pb-4 text-sm text-gray-500">Cập nhật: {supportDate(query.data.publishedAt)}</p>}<div className="whitespace-pre-wrap break-words leading-8 text-gray-700">{text}</div></> : <div><h2 className="text-xl font-bold">{document.title} đang được cập nhật</h2><p className="mt-4 leading-7 text-gray-600">Nội dung này chưa được cửa hàng công bố. Vui lòng liên hệ để xác nhận thông tin áp dụng trước khi sử dụng dịch vụ hoặc gửi trả sản phẩm.</p></div>}
        {document.key === "warranty" && <Link to="/account/warranty" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#65b719] px-6 py-3 font-semibold text-white hover:bg-[#559d13]">Gửi yêu cầu bảo hành <ArrowRight size={18} /></Link>}
  </StoreInformationLayout>
}
