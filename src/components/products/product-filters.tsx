import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { useCategories } from "@/hooks/categories/use-categories"
import { useBrands } from "@/hooks/brands/use-brands"

export interface ProductFiltersValue { search: string; category: string; brand: string; stockStatus: string }
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
  return <section aria-label="Product filters" className="space-y-3 rounded-lg border p-4">
    <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field><FieldLabel htmlFor="filter-search">Product name</FieldLabel>
        <Input id="filter-search" value={draft.search} onChange={event => setDraft(previous => ({ ...previous, search: event.target.value }))} />
      </Field>
      {([['category', 'Category', categories], ['brand', 'Brand', brands]] as const).map(([name, label, query]) => <Field key={name}>
        <FieldLabel htmlFor={`filter-${name}`}>{label}</FieldLabel><select id={`filter-${name}`} className="h-8 rounded-md border bg-background px-2 text-sm" disabled={query.isPending} value={draft[name]} onChange={event => setDraft(previous => ({ ...previous, [name]: event.target.value }))}>
          <option value="">All {label.toLowerCase()}</option>{draft[name] && !query.data?.some(item => item._id === draft[name]) && <option value={draft[name]}>Selected {label.toLowerCase()}</option>}
          {query.data?.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>{query.isError && <Button variant="outline" onClick={() => void query.refetch()}>Retry {label.toLowerCase()}</Button>}
      </Field>)}
      <Field><FieldLabel htmlFor="filter-stock">Stock</FieldLabel>
        <select id="filter-stock" className="h-8 rounded-md border bg-background px-2 text-sm" value={draft.stockStatus} onChange={event => setDraft(previous => ({ ...previous, stockStatus: event.target.value }))}>
          <option value="">All stock</option><option value="in_stock">In stock (&gt; 0)</option><option value="low_stock">Low stock (1–5)</option><option value="out_of_stock">Out of stock (0)</option>
        </select>
      </Field>
      <Button type="button" variant="outline" className="sm:col-span-2 lg:col-span-4 lg:justify-self-end" onClick={() => { setDraft({ search: "", category: "", brand: "", stockStatus: "" }); onReset() }}>Reset filters</Button>
    </div>
  </section>
}
