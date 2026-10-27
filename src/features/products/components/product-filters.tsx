import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { useBrands } from "@/features/brands/hooks/use-brands"

import { productFlags } from "@/features/products/types/product-flags"
import type { ProductFlag } from "@/features/products/types/products"

export interface ProductFiltersValue extends Partial<Record<ProductFlag, string>> { search: string; category: string; brand: string; stockStatus: string }
export function ProductFilters({ initial, onChange, onReset }: {
  initial: ProductFiltersValue; onChange: (value: ProductFiltersValue) => void; onReset: () => void
}) {
  const [draft, setDraft] = useState(initial)
  const categories = useCategories()
  const brands = useBrands()
  const initialKey = JSON.stringify(initial)
  useEffect(() => {
    const next = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as unknown as ProductFiltersValue
    if (JSON.stringify(next) === initialKey) return
    const timer = window.setTimeout(() => onChange(next), 350)
    return () => window.clearTimeout(timer)
  }, [draft, initialKey, onChange])
  return <section aria-label="Bộ lọc sản phẩm" className="space-y-3 rounded-lg border p-4">
    <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field><FieldLabel htmlFor="filter-search">Tên sản phẩm</FieldLabel>
        <Input id="filter-search" value={draft.search} onChange={event => setDraft(previous => ({ ...previous, search: event.target.value }))} />
      </Field>
      {([['category', "Danh mục", categories], ['brand', "Thương hiệu", brands]] as const).map(([name, label, query]) => <Field key={name}>
        <FieldLabel htmlFor={`filter-${name}`}>{label}</FieldLabel><select id={`filter-${name}`} className="h-8 rounded-md border bg-background px-2 text-sm" disabled={query.isPending} value={draft[name]} onChange={event => setDraft(previous => ({ ...previous, [name]: event.target.value }))}>
          <option value="">Tất cả {label.toLowerCase()}</option>{draft[name] && !query.data?.some(item => item._id === draft[name]) && <option value={draft[name]}>Đã chọn {label.toLowerCase()}</option>}
          {query.data?.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>{query.isError && <Button variant="outline" onClick={() => void query.refetch()}>Thử lại {label.toLowerCase()}</Button>}
      </Field>)}
      <Field><FieldLabel htmlFor="filter-stock">Tồn kho</FieldLabel>
        <select id="filter-stock" className="h-8 rounded-md border bg-background px-2 text-sm" value={draft.stockStatus} onChange={event => setDraft(previous => ({ ...previous, stockStatus: event.target.value }))}>
          <option value="">Tất cả tồn kho</option><option value="in_stock">Còn hàng (&gt; 0)</option><option value="low_stock">Sắp hết hàng (1–5)</option><option value="out_of_stock">Hết hàng (0)</option>
        </select>
      </Field>
      {productFlags.map(([name, label]) => <Field key={name}>
        <FieldLabel htmlFor={`filter-${name}`}>{label}</FieldLabel>
        <select id={`filter-${name}`} className="h-8 rounded-md border bg-background px-2 text-sm" value={draft[name] ?? ""} onChange={event => setDraft(previous => ({ ...previous, [name]: event.target.value }))}>
          <option value="">Tất cả</option>
          <option value="true">{name === "on_sale" ? "Đang bán" : "Có"}</option>
          <option value="false">{name === "on_sale" ? "Không bán" : "Không"}</option>
        </select>
      </Field>)}
      <Button type="button" variant="outline" className="sm:col-span-2 lg:col-span-4 lg:justify-self-end" onClick={() => { setDraft({ search: "", category: "", brand: "", stockStatus: "" }); onReset() }}>Đặt lại bộ lọc</Button>
    </div>
  </section>
}
