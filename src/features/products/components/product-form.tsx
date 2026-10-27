import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { LoaderCircle } from "lucide-react"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { useBrands } from "@/features/brands/hooks/use-brands"
import { productDefaults, productPayload, productUpdatePayload, productSchema, productEditSchema, productErrorPath, type ProductFormValues } from "@/features/products/schemas/product-schema"
import type { CatalogReference, Product, ProductInput } from "@/features/products/types/products"
import { getApiError } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { ProductDescriptionEditor } from "@/features/products/components/product-description-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductInputField, ProductVariantsFields } from "@/features/products/components/product-variants-fields"
import { ProductImage } from "@/features/products/components/product-image"
import { useUnsavedProductChanges } from "@/features/products/hooks/use-unsaved-product-changes"
import { useProductListLocation } from "@/features/products/hooks/use-product-list-location"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ContentSkeleton } from "@/components/page-skeleton"
import { ProductDetailsFields } from "@/features/products/components/product-details-fields"

type ProductFormProps = { pending: boolean } & (
  | { product?: undefined; save: (input: ProductInput) => Promise<unknown> }
  | { product: Product; save: (input: Partial<ProductInput>, original: Product) => Promise<unknown> }
)

export function ProductForm({ product, save, pending }: ProductFormProps) {
  const navigate = useNavigate()
  const categories = useCategories()
  const brands = useBrands()
  const [original] = useState(product)
  const form = useForm<ProductFormValues>({ resolver: zodResolver(original ? productEditSchema(original) : productSchema), defaultValues: productDefaults(original) })
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
          <SelectValue>{choices.find(item => item._id === field.value)?.name ?? unavailable?.name ?? "Chọn…"}</SelectValue>
        </SelectTrigger>
        <SelectContent>{unavailable && <SelectItem value={unavailable._id} disabled>{unavailable.name} (không khả dụng)</SelectItem>}
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
      navigate(product ? `/auth/products/${product._id}` : returnTo, { state: { returnTo } })
    } catch (error: unknown) {
      const failure = getApiError(error)
      form.setError("root", { message: failure.message })
      failure.errors?.forEach(({ field, message }) => {
        const path = productErrorPath(field, values)
        if (path) {
          form.setError(path as FieldPath<ProductFormValues>, { message })
        }
      })
    }
  })}>
    {catalogLoading && <ContentSkeleton label="Đang tải danh mục và thương hiệu…" variant="form" />}
    {catalogError && <div role="alert" className="text-destructive">{getApiError(catalogError).message} <Button type="button" variant="outline" onClick={() => { void categories.refetch(); void brands.refetch() }}>Thử lại</Button></div>}
    {!catalogLoading && !catalogError && (!categoryChoices.length || !brandChoices.length) && <p role="alert">Cần có danh mục và thương hiệu đang hoạt động để tạo sản phẩm.</p>}
    <fieldset hidden={catalogLoading} disabled={busy || catalogLoading || !!catalogError} className="space-y-6 disabled:opacity-70">
      <div className="grid gap-4 sm:grid-cols-2">
        <ProductInputField form={form} name="product_name" label="Tên sản phẩm" />
        <ProductInputField form={form} name="model_year" label="Năm sản xuất" numeric optional />
        {catalogField("category", "Danh mục", categoryChoices)}{catalogField("brand", "Thương hiệu", brandChoices)}
        <ProductInputField form={form} name="price" label="Giá (không bắt buộc; mặc định là giá biến thể thấp nhất)" numeric optional />
        <ProductInputField form={form} name="discount" label="Giảm giá (%)" numeric />
        <ProductInputField form={form} name="thumbnail" label="Đường dẫn ảnh đại diện" />
        <ProductImage src={thumbnail} alt="Xem trước ảnh đại diện" className="size-24 border" />
        {!product && <p className="text-xs text-muted-foreground">Lưu sản phẩm trước, sau đó tải ảnh lên từ trang chi tiết sản phẩm.</p>}
        {variants.length ? <Field><FieldLabel>Tổng tồn kho</FieldLabel><output className="text-sm">{variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0)}</output><p className="text-xs text-muted-foreground">Được tính từ tồn kho của các biến thể.</p></Field>
          : <ProductInputField form={form} name="stock" label="Tồn kho" numeric optional />}
      </div>
      <Controller control={form.control} name="description" render={({ field, fieldState }) => <Field>
        <FieldLabel htmlFor="description">Mô tả</FieldLabel>
        <ProductDescriptionEditor value={field.value ?? ""} onChange={field.onChange} onBlur={field.onBlur} disabled={busy || catalogLoading || !!catalogError} invalid={!!fieldState.error} />
        <FieldError id="description-error" errors={[fieldState.error]} />
      </Field>} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("is_active")} />Sản phẩm đang hoạt động</label>
      <fieldset className="flex flex-wrap gap-4"><legend>Hiển thị sản phẩm</legend>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("on_sale")} />On sale - Đang bán</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("is_new")} />New - Mới</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("is_hot")} />Hot - Nổi bật</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("is_home")} />Home - Trang chủ</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("is_best_seller")} />Best Seller - Bán chạy</label>
      </fieldset>
      <ProductDetailsFields form={form} />
      <ProductVariantsFields form={form} />
    </fieldset>
    {form.formState.errors.root && <p role="alert" className="text-destructive">{form.formState.errors.root.message}</p>}
    <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy || catalogLoading || !!catalogError || (!product && (!categoryChoices.length || !brandChoices.length))}>{busy && <LoaderCircle className="animate-spin" />}{product ? "Lưu thay đổi" : "Tạo sản phẩm"}</Button>
      <Button type="button" variant="outline" disabled={busy} onClick={() => navigate(product ? `/auth/products/${product._id}` : returnTo, { state: { returnTo } })}>Hủy</Button></div>
    <Dialog open={blocker.state === "blocked"} onOpenChange={open => { if (!open && blocker.state === "blocked") blocker.reset() }}>
      <DialogContent><DialogHeader><DialogTitle>Bỏ các thay đổi chưa lưu?</DialogTitle><DialogDescription>Thay đổi sản phẩm chưa được lưu. Rời trang sẽ làm mất các thay đổi này.</DialogDescription></DialogHeader>
        <DialogFooter><Button type="button" variant="outline" onClick={() => { if (blocker.state === "blocked") blocker.reset() }}>Tiếp tục chỉnh sửa</Button>
          <Button type="button" variant="destructive" onClick={() => { if (blocker.state === "blocked") blocker.proceed() }}>Bỏ thay đổi</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </form>
}
