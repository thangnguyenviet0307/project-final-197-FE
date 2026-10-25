import { useNavigate } from "react-router-dom"
import { CreatePageLayout } from "@/components/create-page-layout"
import { BrandForm } from "@/features/brands/components/brand-form"
import { useCreateBrand } from "@/features/brands/hooks/use-brand-management"

export default function BrandCreatePage() {
  const navigate = useNavigate()
  const create = useCreateBrand()
  return <CreatePageLayout title="Thêm thương hiệu" backTo="/brands" backLabel="Về danh sách thương hiệu">
    <BrandForm onSaved={() => navigate("/brands")} onCancel={() => navigate("/brands")} onSubmit={async values => { await create.mutateAsync(values) }} />
  </CreatePageLayout>
}
