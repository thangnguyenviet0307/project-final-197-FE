import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreatePageLayout } from "@/components/create-page-layout"
import { BrandForm } from "@/features/brands/components/brand-form"
import { brandsService } from "@/features/brands/services/brands.service"

export default function BrandCreatePage() {
  const navigate = useNavigate()
  const client = useQueryClient()
  const create = useMutation({ mutationFn: brandsService.createBrand, meta: { successMessage: "Brand created." }, onSuccess: () => client.invalidateQueries({ queryKey: ["brands"] }) })
  return <CreatePageLayout title="Add brand" backTo="/brands" backLabel="Back to brands">
    <BrandForm onCancel={() => navigate("/brands")} onSubmit={async values => { await create.mutateAsync(values); navigate("/brands") }} />
  </CreatePageLayout>
}
