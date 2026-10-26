import { Link, useParams } from "react-router-dom"
import { BaseLayout } from "@/layout/admin/base-layout"
import { ProductForm } from "@/features/products/components/product-form"
import { ProductQueryState } from "@/features/products/components/product-query-state"
import { useProduct } from "@/features/products/hooks/use-product"
import { useUpdateProduct } from "@/features/products/hooks/use-update-product"
import { getProduct } from "@/features/products/services/products.service"
import { getApiError } from "@/services/api"
import { Button } from "@/components/ui/button"
import { useProductListLocation } from "@/features/products/hooks/use-product-list-location"
import { ArrowLeft } from "lucide-react"
export default function ProductEditPage() {
  const { id = "" } = useParams()
  const query = useProduct(id)
  const mutation = useUpdateProduct()
  const returnTo = useProductListLocation()
  return <BaseLayout title="Chỉnh sửa sản phẩm"><div className="space-y-4 px-4 lg:px-6">
    <div className="pb-4">
      <Button nativeButton={false} role="link" variant="outline" size="lg" render={<Link to={returnTo} />}><ArrowLeft />Về danh sách sản phẩm</Button>
    </div>
    {!query.data ? <ProductQueryState invalid={!/^[a-f\d]{24}$/i.test(id)} error={query.error} retry={query.refetch} />
      : <>
      {query.isError && <div role="alert" className="space-y-2 text-sm text-destructive">
        <p>Không thể làm mới dữ liệu sản phẩm. Các thay đổi chưa lưu được giữ nguyên. {getApiError(query.error).message}</p>
        <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>Thử làm mới lại</Button>
      </div>}
      <ProductForm key={id} product={query.data} pending={mutation.isPending} save={async (input, original) => {
        if (input.variants !== undefined || input.stock !== undefined) {
          const latest = await getProduct(id)
          if (JSON.stringify(latest.variants ?? []) !== JSON.stringify(original.variants ?? []) || latest.stock !== original.stock || (input.variants !== undefined && latest.price !== original.price)) {
            throw new Error("Tồn kho hoặc biến thể đã thay đổi khi bạn đang chỉnh sửa. Hãy tải lại trang và kiểm tra dữ liệu mới nhất trước khi lưu.")
          }
        }
        return mutation.mutateAsync({ id, input: { ...input, ...((input.variants !== undefined || input.stock !== undefined) ? { expectedVersion: original.__v ?? 0 } : {}) } })
      }} /></>}
  </div></BaseLayout>
}
