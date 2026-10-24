import { useNavigate } from "react-router-dom"
import { CreatePageLayout } from "@/components/create-page-layout"
import { BrandForm } from "@/features/brands/components/brand-form"
import { useCreateBrand } from "@/features/brands/hooks/use-brand-management"

export default function BrandCreatePage() {
  const navigate = useNavigate()
  const create = useCreateBrand()
  return <CreatePageLayout title="Add brand" backTo="/brands" backLabel="Back to brands">
    <BrandForm onSaved={() => navigate("/brands")} onCancel={() => navigate("/brands")} onSubmit={async values => { await create.mutateAsync(values) }} />
  </CreatePageLayout>
}
