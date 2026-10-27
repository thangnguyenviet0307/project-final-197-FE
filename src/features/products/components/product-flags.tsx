import { useState } from "react"
import type { Product } from "@/features/products/types/products"
import { productFlags } from "@/features/products/types/product-flags"
import { useUpdateProductFlags } from "@/features/products/hooks/use-update-product-flags"
import { Button } from "@/components/ui/button"
import { TableCell } from "@/components/ui/table"
import { getApiError } from "@/services/api"

export function ProductFlags({ product, editable, disabled, reload }: { product: Product; editable: boolean; disabled: boolean; reload: () => Promise<unknown> }) {
  const mutation = useUpdateProductFlags()
  const [failed, setFailed] = useState(false)
  return <>{productFlags.map(([field, label]) => {
    const enabled = product[field] ?? field === "on_sale"
    return <TableCell key={field} className="text-center">
      {editable ? <Button variant="ghost" size="sm" aria-label={`${label}: ${product.product_name}`} aria-pressed={enabled}
        disabled={disabled || mutation.isPending || failed || product.__v === undefined}
        className={enabled ? "text-emerald-600" : "text-muted-foreground"}
        onClick={() => mutation.mutate({ id: product._id, input: { [field]: !enabled, expectedVersion: product.__v! } }, { onError: () => setFailed(true) })}>
        {enabled ? "✓" : "✕"}
      </Button> : <span aria-label={`${label}: ${String(enabled)}`}>{enabled ? "✓" : "✕"}</span>}
      {field === "on_sale" && failed && <div role="alert" className="min-w-40 text-xs text-destructive">{getApiError(mutation.error).message}<Button variant="outline" size="sm" disabled={disabled} onClick={async () => { try { await reload(); setFailed(false); mutation.reset() } catch { /* Keep the failure until a successful explicit reload. */ } }}>Tải lại để kiểm tra</Button></div>}
    </TableCell>
  })}</>
}
