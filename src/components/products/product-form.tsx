import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { LoaderCircle } from "lucide-react"
import { useCategories } from "@/hooks/categories/use-categories"
import { useBrands } from "@/hooks/brands/use-brands"
import { productDefaults, productPayload, productUpdatePayload, productSchema, type ProductFormValues } from "@/lib/product-schema"
import type { CatalogReference, Product, ProductInput } from "@/types/products"
import { getApiError } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { ProductDescriptionEditor } from "./product-description-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductInputField, ProductVariantsFields } from "./product-variants-fields"
import { ProductImage } from "./product-image"
import { useUnsavedProductChanges } from "@/hooks/products/use-unsaved-product-changes"
import { useProductListLocation } from "@/hooks/products/use-product-list-location"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ContentSkeleton } from "@/components/page-skeleton"

type ProductFormProps = { pending: boolean } & (
  | { product?: undefined; save: (input: ProductInput) => Promise<unknown> }
  | { product: Product; save: (input: Partial<ProductInput>, original: Product) => Promise<unknown> }
)

export function ProductForm({ product, save, pending }: ProductFormProps) {
  const navigate = useNavigate()
  const categories = useCategories()
  const brands = useBrands()
  const [original] = useState(product)
  const form = useForm<ProductFormValues>({ resolver: zodResolver(productSchema), defaultValues: productDefaults(original) })
  const { dirtyFields, isDirty } = form.formState
  const { blocker, allowSavedNavigation } = useUnsavedProductChanges(isDirty)
  const returnTo = useProductListLocation()
  const thumbnail = useWatch({ control: form.control, name: "thumbnail" })
  const variants = useWatch({ control: form.control, name: "variants" })
  const busy = pending || form.formState.isSubmitting
  const catalogLoading = categories.isPending || brands.isPending
  const catalogError = categories.error || brands.error
  const categoryChoices = (categories.data ?? []).filter(item => item.isActive !== false && !item.isDeleted)
  const brandChoices = (brands.data ?? []).filter(item => item.isActive !== false && !item.isDeleted)

  function catalogField(name: "category" | "brand", label: string, choices: CatalogReference[]) {
    const current = product?.[name]
    const unavailable = typeof current === "object" && current && !choices.some(item => item._id === current._id) ? current : null
    return <Controller control={form.control} name={name} render={({ field, fieldState }) => <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}>
        <SelectTrigger id={name} className="w-full" aria-invalid={!!fieldState.error} aria-describedby={`${name}-error`} onBlur={field.onBlur} ref={field.ref}>
          <SelectValue>{choices.find(item => item._id === field.value)?.name ?? unavailable?.name ?? "Select…"}</SelectValue>
        </SelectTrigger>
        <SelectContent>{unavailable && <SelectItem value={unavailable._id} disabled>{unavailable.name} (unavailable)</SelectItem>}
          {choices.map(item => <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>)}
        </SelectContent>
      </Select><FieldError id={`${name}-error`} errors={[fieldState.error]} />
    </Field>} />
  }

  return <form noValidate className="space-y-6" onSubmit={form.handleSubmit(async values => {
    try {
      form.clearErrors("root")
      if (product && original) {
        const input = productUpdatePayload(values, dirtyFields, original)
        if (Object.keys(input).length) await save(input, original)
      } else if (!product) {
        await save(productPayload(values))
      }
      allowSavedNavigation()
      navigate(product ? `/products/${product._id}` : returnTo, { state: { returnTo } })
    } catch (error: unknown) {
      const failure = getApiError(error)
      form.setError("root", { message: failure.message })
      failure.errors?.forEach(({ field, message }) => {
        const path = field.replace(/^body\./, "").replace(/\[(\d+)\]/g, ".$1")
        if (path in values || /^variants\.\d+\.(sku|price|stock|variant_name|color|size|image|compare_at_price)$/.test(path)) {
          form.setError(path as FieldPath<ProductFormValues>, { message })
        }
      })
    }
  })}>
    {catalogLoading && <ContentSkeleton label="Loading categories and brands…" variant="form" />}
    {catalogError && <div role="alert" className="text-destructive">{getApiError(catalogError).message} <Button type="button" variant="outline" onClick={() => { void categories.refetch(); void brands.refetch() }}>Retry</Button></div>}
    {!catalogLoading && !catalogError && (!categoryChoices.length || !brandChoices.length) && <p role="alert">An active category and brand are required to create a product.</p>}
    <fieldset hidden={catalogLoading} disabled={busy || catalogLoading || !!catalogError} className="space-y-6 disabled:opacity-70">
      <div className="grid gap-4 sm:grid-cols-2">
        <ProductInputField form={form} name="product_name" label="Product name" />
        <ProductInputField form={form} name="model_year" label="Model year" numeric />
        {catalogField("category", "Category", categoryChoices)}{catalogField("brand", "Brand", brandChoices)}
        <ProductInputField form={form} name="price" label="Price (optional; defaults to lowest variant price)" numeric optional />
        <ProductInputField form={form} name="discount" label="Discount (%)" numeric />
        <ProductInputField form={form} name="thumbnail" label="Thumbnail path" />
        <ProductImage src={thumbnail} alt="Thumbnail preview" className="size-24 border" />
        {!product && <p className="text-xs text-muted-foreground">Save the product first, then upload gallery images from its detail page.</p>}
        {variants.length ? <Field><FieldLabel>Total stock</FieldLabel><output className="text-sm">{variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0)}</output><p className="text-xs text-muted-foreground">Calculated from variant stock.</p></Field>
          : <ProductInputField form={form} name="stock" label="Stock" numeric optional />}
      </div>
      <Controller control={form.control} name="description" render={({ field, fieldState }) => <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <ProductDescriptionEditor value={field.value ?? ""} onChange={field.onChange} onBlur={field.onBlur} disabled={busy || catalogLoading || !!catalogError} invalid={!!fieldState.error} />
        <FieldError id="description-error" errors={[fieldState.error]} />
      </Field>} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("is_active")} />Active product</label>
      <ProductVariantsFields form={form} />
    </fieldset>
    {form.formState.errors.root && <p role="alert" className="text-destructive">{form.formState.errors.root.message}</p>}
    <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy || catalogLoading || !!catalogError || (!product && (!categoryChoices.length || !brandChoices.length))}>{busy && <LoaderCircle className="animate-spin" />}{product ? "Save changes" : "Create product"}</Button>
      <Button type="button" variant="outline" disabled={busy} onClick={() => navigate(product ? `/products/${product._id}` : returnTo, { state: { returnTo } })}>Cancel</Button></div>
    <Dialog open={blocker.state === "blocked"} onOpenChange={open => { if (!open && blocker.state === "blocked") blocker.reset() }}>
      <DialogContent><DialogHeader><DialogTitle>Discard unsaved changes?</DialogTitle><DialogDescription>Your product changes have not been saved. Leaving this page will discard them.</DialogDescription></DialogHeader>
        <DialogFooter><Button type="button" variant="outline" onClick={() => { if (blocker.state === "blocked") blocker.reset() }}>Keep editing</Button>
          <Button type="button" variant="destructive" onClick={() => { if (blocker.state === "blocked") blocker.proceed() }}>Discard changes</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </form>
}
