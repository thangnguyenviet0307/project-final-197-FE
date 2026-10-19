import { Link, useParams } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { ProductForm } from "@/components/products/product-form"
import { ProductQueryState } from "@/components/products/product-query-state"
import { useProduct } from "@/hooks/products/use-product"
import { useUpdateProduct } from "@/hooks/products/use-update-product"
import { getProduct } from "@/services/products.service"
import { getApiError } from "@/services/api"
import { Button } from "@/components/ui/button"
import { useProductListLocation } from "@/hooks/products/use-product-list-location"
import { ArrowLeft } from "lucide-react"
export default function ProductEditPage() {
  const { id = "" } = useParams()
  const query = useProduct(id)
  const mutation = useUpdateProduct()
  const returnTo = useProductListLocation()
  return <BaseLayout title="Edit product"><div className="space-y-4 px-4 lg:px-6">
    <div className="pb-4">
      <Button nativeButton={false} role="link" variant="outline" size="lg" render={<Link to={returnTo} />}><ArrowLeft />Back to products</Button>
    </div>
    {!query.data ? <ProductQueryState invalid={!/^[a-f\d]{24}$/i.test(id)} error={query.error} retry={query.refetch} />
      : <>
      {query.isError && <div role="alert" className="space-y-2 text-sm text-destructive">
        <p>Could not refresh product data. Your unsaved changes are preserved. {getApiError(query.error).message}</p>
        <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>Retry refresh</Button>
      </div>}
      <ProductForm key={id} product={query.data} pending={mutation.isPending} save={async (input, original) => {
        if (input.variants !== undefined || input.stock !== undefined) {
          const latest = await getProduct(id)
          if (JSON.stringify(latest.variants ?? []) !== JSON.stringify(original.variants ?? []) || latest.stock !== original.stock || (input.variants !== undefined && latest.price !== original.price)) {
            throw new Error("Product inventory or variants changed while you were editing. Reload this page and review the latest data before saving.")
          }
        }
        return mutation.mutateAsync({ id, input })
      }} /></>}
  </div></BaseLayout>
}
