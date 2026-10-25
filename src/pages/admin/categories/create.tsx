import { useNavigate } from "react-router-dom"
import { CreatePageLayout } from "@/components/create-page-layout"
import { CategoryForm } from "@/features/categories/components/category-form"
import { useCreateCategory } from "@/features/categories/hooks/use-create-category"

export default function CategoryCreatePage() {
  const navigate = useNavigate()
  const create = useCreateCategory()
  return <CreatePageLayout title="Thêm danh mục" backTo="/categories" backLabel="Về danh sách danh mục">
    <CategoryForm onSaved={() => navigate("/categories")} onCancel={() => navigate("/categories")} onSubmit={async values => { await create.mutateAsync(values) }} />
  </CreatePageLayout>
}
