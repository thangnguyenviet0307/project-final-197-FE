import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api, getApiError } from "@/services/api"
import type { Product } from "@/features/products/types/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function InventoryEditor({ product }: { product: Product }) {
  const client = useQueryClient()
  const variants = product.variants ?? []
  const mutation = useMutation({
    mutationFn: (input: { expectedVersion: number; stock?: number; variants?: { _id: string; stock: number }[] }) => api.patch(`/products/${encodeURIComponent(product._id)}/inventory`, input),
    meta: { successMessage: "Stock updated." },
    onSuccess: () => client.invalidateQueries({ queryKey: ["products"] }),
    onError: () => { void client.invalidateQueries({ queryKey: ["products"] }) },
  })
  return <form className="space-y-3 rounded-lg border p-4" onSubmit={event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const input = variants.length
      ? { variants: variants.map(variant => ({ _id: variant._id!, stock: Number(data.get(variant._id!)) })) }
      : { stock: Number(data.get("stock")) }
    mutation.mutate({ expectedVersion: product.__v ?? 0, ...input })
  }}>
    <h2 className="font-semibold">Update inventory</h2>
    <div className="grid gap-3 sm:grid-cols-2">{(variants.length ? variants.map(variant => ({ id: variant._id!, label: variant.sku, stock: variant.stock })) : [{ id: "stock", label: "Product stock", stock: product.stock }]).map(item => <label key={item.id} className="grid gap-2 text-sm">{item.label}<Input name={item.id} type="number" min={0} max={Number.MAX_SAFE_INTEGER} step={1} required defaultValue={item.stock ?? 0} disabled={mutation.isPending} /></label>)}</div>
    {mutation.isError && <p role="alert" className="text-sm text-destructive">{getApiError(mutation.error).message}</p>}
    <Button type="submit" disabled={mutation.isPending}>Save stock</Button>
  </form>
}
