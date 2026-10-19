import { BaseLayout } from "@/components/layouts/base-layout"
import { ProductForm } from "@/components/products/product-form"
import { useCreateProduct } from "@/hooks/products/use-create-product"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProductListLocation } from "@/hooks/products/use-product-list-location"
export default function ProductCreatePage() {
  const mutation = useCreateProduct()
  const returnTo = useProductListLocation()
  return <BaseLayout title="Add product"><div className="space-y-4 px-4 lg:px-6">
    <div className="pb-4"><Button nativeButton={false} role="link" variant="outline" size="lg" render={<Link to={returnTo} />}><ArrowLeft />Back to products</Button></div>
    <ProductForm save={mutation.mutateAsync} pending={mutation.isPending} />
  </div></BaseLayout>
}
