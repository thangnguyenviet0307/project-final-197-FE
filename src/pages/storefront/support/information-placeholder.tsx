import { Link, useLocation } from "react-router-dom"
import { pendingInformationPages } from "@/features/support/utils/policy-documents"
import { StoreInformationLayout } from "@/features/support/components/store-information-layout"

export default function InformationPlaceholderPage() {
  const { pathname } = useLocation()
  const document = pendingInformationPages.find(item => pathname.replace(/\/$/, "") === `/${item.slug}`)
  if (!document) return <div className="store-container py-12"><Link to="/chinh-sach-bao-hanh">Xem chính sách cửa hàng</Link></div>
  return <StoreInformationLayout title={document.title} description="Thông tin dành cho khách hàng của cửa hàng." path={`/${document.slug}`}>
    <h2 className="text-xl font-bold">{document.title} đang được cập nhật</h2>
    <p className="text-gray-600">Nội dung đang được cập nhật.</p>
  </StoreInformationLayout>
}
