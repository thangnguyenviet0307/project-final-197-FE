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
  return <fieldset className="space-y-4 rounded-lg border p-4"><legend className="px-2 font-medium">Variant {index + 1}</legend>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProductInputField form={form} name={`variants.${index}.sku`} label="SKU" />
      <ProductInputField form={form} name={`variants.${index}.variant_name`} label="Variant name" />
      <ProductInputField form={form} name={`variants.${index}.price`} label="Variant price" numeric />
      <ProductInputField form={form} name={`variants.${index}.stock`} label="Variant stock" numeric optional />
      <ProductInputField form={form} name={`variants.${index}.color`} label="Color" />
      <ProductInputField form={form} name={`variants.${index}.size`} label="Size" />
      <ProductInputField form={form} name={`variants.${index}.compare_at_price`} label="Compare at price" numeric optional />
      <ProductInputField form={form} name={`variants.${index}.image`} label="Primary image path" />
    </div>
    <ProductImage src={variant?.image} alt={`Variant ${index + 1} primary image preview`} className="size-24 border" />
    <div className="space-y-3"><h3 className="text-sm font-medium">Options</h3>
      {options.fields.map((option, optionIndex) => <div key={option.id} className="flex flex-wrap items-end gap-2">
        <div className="min-w-40 flex-1"><ProductInputField form={form} name={`variants.${index}.options.${optionIndex}.name`} label="Option name" /></div>
        <div className="min-w-40 flex-1"><ProductInputField form={form} name={`variants.${index}.options.${optionIndex}.value`} label="Option value" /></div>
        <Button type="button" variant="outline" onClick={() => options.remove(optionIndex)} aria-label={`Remove option ${optionIndex + 1}`}><Trash2 /></Button>
      </div>)}
      <Button type="button" variant="outline" onClick={() => options.append({ name: "", value: "" })}><Plus />Add option</Button>
    </div>
    <div className="space-y-3"><h3 className="text-sm font-medium">Images</h3>
      {images.fields.map((image, imageIndex) => <div key={image.id} className="flex items-end gap-2">
        <ProductInputField form={form} name={`variants.${index}.images.${imageIndex}.url`} label={`Image ${imageIndex + 1} path`} />
        <ProductImage src={variant?.images?.[imageIndex]?.url} alt={`Variant ${index + 1} image ${imageIndex + 1} preview`} className="size-16 shrink-0 border" />
        <Button type="button" variant="outline" onClick={() => images.remove(imageIndex)} aria-label={`Remove image ${imageIndex + 1}`}><Trash2 /></Button>
      </div>)}
      <Button type="button" variant="outline" onClick={() => images.append({ url: "" })}><Plus />Add image path</Button>
    </div>
    <Button type="button" variant="destructive" onClick={onRemove}><Trash2 />Remove variant {index + 1}</Button>
  </fieldset>
}
export function ProductVariantsFields({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const variants = useFieldArray({ control: form.control, name: "variants" })
  return <section className="space-y-4"><h2 className="text-lg font-semibold">Variants</h2>
    {variants.fields.map((variant, index) => <VariantFields key={variant.id} form={form} index={index} onRemove={() => variants.remove(index)} />)}
    <Button type="button" variant="outline" onClick={() => variants.append({ sku: "", price: 0, stock: 0, images: [], options: [] })}><Plus />Add variant</Button>
  </section>
}
