import { useFieldArray, useWatch, type UseFormReturn, type FieldPath } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import type { ProductFormValues } from "@/features/products/schemas/product-schema"
import { ProductImage } from "@/features/products/components/product-image"

export function ProductInputField({ form, name, label, numeric = false, optional = false }: {
  form: UseFormReturn<ProductFormValues>; name: FieldPath<ProductFormValues>; label: string; numeric?: boolean; optional?: boolean
}) {
  const error = form.getFieldState(name, form.formState).error
  return <Field><FieldLabel htmlFor={name}>{label}</FieldLabel><Input id={name} type={numeric ? "number" : "text"} step={numeric ? "any" : undefined}
    aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined}
    {...form.register(name, numeric ? { setValueAs: (value: string) => value === "" && optional ? undefined : value === "" ? NaN : Number(value) } : {})} />
    <FieldError id={`${name}-error`} errors={[error]} /></Field>
}

function VariantFields({ form, index, onRemove }: { form: UseFormReturn<ProductFormValues>; index: number; onRemove: () => void }) {
  const options = useFieldArray({ control: form.control, name: `variants.${index}.options` })
  const images = useFieldArray({ control: form.control, name: `variants.${index}.images` })
  const variant = useWatch({ control: form.control, name: `variants.${index}` })
  return <fieldset className="space-y-4 rounded-lg border p-4"><legend className="px-2 font-medium">Biến thể {index + 1}</legend>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProductInputField form={form} name={`variants.${index}.sku`} label="SKU" />
      <ProductInputField form={form} name={`variants.${index}.variant_name`} label="Tên biến thể" />
      <ProductInputField form={form} name={`variants.${index}.price`} label="Giá biến thể" numeric />
      <ProductInputField form={form} name={`variants.${index}.stock`} label="Tồn kho biến thể" numeric optional />
      <ProductInputField form={form} name={`variants.${index}.color`} label="Màu sắc" />
      <ProductInputField form={form} name={`variants.${index}.size`} label="Kích thước" />
      <ProductInputField form={form} name={`variants.${index}.compare_at_price`} label="Giá so sánh" numeric optional />
      <ProductInputField form={form} name={`variants.${index}.image`} label="Đường dẫn ảnh chính" />
    </div>
    <ProductImage src={variant?.image} alt={`Xem trước ảnh chính biến thể ${index + 1}`} className="size-24 border" />
    <div className="space-y-3"><h3 className="text-sm font-medium">Tùy chọn</h3>
      {options.fields.map((option, optionIndex) => <div key={option.id} className="flex flex-wrap items-end gap-2">
        <div className="min-w-40 flex-1"><ProductInputField form={form} name={`variants.${index}.options.${optionIndex}.name`} label="Tên tùy chọn" /></div>
        <div className="min-w-40 flex-1"><ProductInputField form={form} name={`variants.${index}.options.${optionIndex}.value`} label="Giá trị tùy chọn" /></div>
        <Button type="button" variant="outline" onClick={() => options.remove(optionIndex)} aria-label={`Xóa tùy chọn ${optionIndex + 1}`}><Trash2 /></Button>
      </div>)}
      <Button type="button" variant="outline" onClick={() => options.append({ name: "", value: "" })}><Plus />Thêm tùy chọn</Button>
    </div>
    <div className="space-y-3"><h3 className="text-sm font-medium">Hình ảnh</h3>
      {images.fields.map((image, imageIndex) => <div key={image.id} className="flex items-end gap-2">
        <ProductInputField form={form} name={`variants.${index}.images.${imageIndex}.url`} label={`Đường dẫn ảnh ${imageIndex + 1}`} />
        <ProductImage src={variant?.images?.[imageIndex]?.url} alt={`Xem trước ảnh ${imageIndex + 1} của biến thể ${index + 1}`} className="size-16 shrink-0 border" />
        <Button type="button" variant="outline" onClick={() => images.remove(imageIndex)} aria-label={`Xóa ảnh ${imageIndex + 1}`}><Trash2 /></Button>
      </div>)}
      <Button type="button" variant="outline" onClick={() => images.append({ url: "" })}><Plus />Thêm đường dẫn ảnh</Button>
    </div>
    <Button type="button" variant="destructive" onClick={onRemove}><Trash2 />Xóa biến thể {index + 1}</Button>
  </fieldset>
}
export function ProductVariantsFields({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const variants = useFieldArray({ control: form.control, name: "variants" })
  return <section className="space-y-4"><h2 className="text-lg font-semibold">Biến thể</h2>
    {variants.fields.map((variant, index) => <VariantFields key={variant.id} form={form} index={index} onRemove={() => variants.remove(index)} />)}
    <Button type="button" variant="outline" onClick={() => variants.append({ sku: "", price: 0, stock: 0, images: [], options: [] })}><Plus />Thêm biến thể</Button>
  </section>
}
