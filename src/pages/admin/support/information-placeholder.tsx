import { Link, useLocation } from "react-router-dom"
import { BaseLayout } from "@/layout/admin/base-layout"
import { pendingInformationPages } from "@/features/support/utils/policy-documents"

export default function AdminInformationPlaceholderPage() {
  const { pathname } = useLocation()
  const document = pendingInformationPages.find(item => pathname === `/auth/policies/${item.slug}`)!
  return <BaseLayout title={document.title} description="Nội dung cửa hàng">
    <div className="mx-4 max-w-4xl space-y-4 rounded-xl border p-6 lg:mx-6">
      <h2 className="text-lg font-semibold">{document.title}</h2>
      <p className="text-sm text-muted-foreground">Mục này đang được chuẩn bị. Chức năng soạn thảo và lưu nội dung sẽ được bổ sung sau.</p>
      <Link className="text-sm underline" to={`/${document.slug}`} target="_blank" rel="noreferrer">Xem trang công khai</Link>
    </div>
  </BaseLayout>
}
