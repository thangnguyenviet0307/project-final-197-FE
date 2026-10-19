import { useNavigate } from "react-router-dom"
import { CreatePageLayout } from "@/components/create-page-layout"
import { CategoryForm } from "@/features/categories/components/category-form"
import { useCreateCategory } from "@/features/categories/hooks/use-create-category"

export default function CategoryCreatePage() {
  const navigate = useNavigate()
  const create = useCreateCategory()
  return <CreatePageLayout title="Add category" backTo="/categories" backLabel="Back to categories">
    <CategoryForm onCancel={() => navigate("/categories")} onSubmit={async values => { await create.mutateAsync(values); navigate("/categories") }} />
  </CreatePageLayout>
}
