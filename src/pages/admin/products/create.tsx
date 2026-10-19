import { BaseLayout } from "@/layout/admin/base-layout"
import { ProductForm } from "@/features/products/components/product-form"
import { useCreateProduct } from "@/features/products/hooks/use-create-product"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProductListLocation } from "@/features/products/hooks/use-product-list-location"
export default function ProductCreatePage() {
  const mutation = useCreateProduct()
  const returnTo = useProductListLocation()
  return <BaseLayout title="Add product"><div className="space-y-4 px-4 lg:px-6">
    <div className="pb-4"><Button nativeButton={false} role="link" variant="outline" size="lg" render={<Link to={returnTo} />}><ArrowLeft />Back to products</Button></div>
    <ProductForm save={mutation.mutateAsync} pending={mutation.isPending} />
  </div></BaseLayout>
}
