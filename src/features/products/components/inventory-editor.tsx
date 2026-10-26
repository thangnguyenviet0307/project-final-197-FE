import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { getProduct, updateInventory } from "@/features/products/services/products.service"
import type { Product } from "@/features/products/types/products"
import { getApiError } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"

export function InventoryEditor({ product }: { product: Product }) {
  const role = useAuthStore(state => state.user?.role)
  const client = useQueryClient()
  const [original, setOriginal] = useState(product)
  const stocksFor = (value: Product) => (value.variants?.length ? value.variants.map(variant => String(variant.stock ?? 0)) : [String(value.stock ?? 0)])
  const [stocks, setStocks] = useState(() => stocksFor(product))
  const [reloadError, setReloadError] = useState("")
  const [reloading, setReloading] = useState(false)
  const mutation = useMutation({ mutationFn: updateInventory, meta: { successMessage: "Đã cập nhật tồn kho." }, onSuccess: async saved => {
    setOriginal(saved); setStocks(stocksFor(saved))
    await Promise.all([client.invalidateQueries({ queryKey: ["products"] }), client.invalidateQueries({ queryKey: ["orders"] })])
  } })
  if (role !== "admin" && role !== "staff") return null
  const valid = stocks.every(stock => stock.trim() !== "" && Number.isSafeInteger(Number(stock)) && Number(stock) >= 0)
  const busy = mutation.isPending || reloading
  return <section className="space-y-3 rounded-lg border p-4" aria-label="Cập nhật tồn kho">
    <h2 className="font-semibold">Cập nhật tồn kho</h2>
    <p className="text-sm text-muted-foreground">Chỉ cập nhật số lượng; giá và thông tin sản phẩm được giữ nguyên.</p>
    {(original.variants?.length ? original.variants.map(variant => variant.sku) : ["Sản phẩm"]).map((label, index) => <label key={label} className="grid gap-2 text-sm">Tồn kho {label}<input className="rounded-md border bg-background p-2" type="number" min="0" step="1" max={Number.MAX_SAFE_INTEGER} value={stocks[index]} disabled={busy} onChange={event => setStocks(previous => previous.map((value, i) => i === index ? event.target.value : value))} /></label>)}
    {!valid && <p role="alert">Tồn kho phải là số nguyên không âm.</p>}
    {mutation.error && <p role="alert">{getApiError(mutation.error).message} Bản nhập được giữ nguyên. Nếu dữ liệu đã thay đổi, hãy tải dữ liệu mới rồi nhập lại.</p>}
    {reloadError && <p role="alert">{reloadError}</p>}
    <div className="flex flex-wrap gap-2"><Button disabled={!valid || busy || original.__v === undefined} onClick={() => mutation.mutate({ id: original._id, input: { expectedVersion: original.__v!, ...(original.variants?.length ? { variants: original.variants.map((variant, index) => ({ _id: variant._id!, stock: Number(stocks[index]) })) } : { stock: Number(stocks[0]) }) } })}>Lưu tồn kho</Button>
    <Button variant="outline" disabled={busy} onClick={async () => {
      setReloading(true); setReloadError("")
      try { const latest = await getProduct(original._id); setOriginal(latest); setStocks(stocksFor(latest)); mutation.reset() }
      catch (error) { setReloadError(getApiError(error).message) }
      finally { setReloading(false) }
    }}>Tải dữ liệu mới và đặt lại bản nhập</Button></div>
    {original.__v === undefined && <p role="alert">Thiếu phiên bản sản phẩm. Hãy tải dữ liệu mới trước khi lưu.</p>}
  </section>
}
