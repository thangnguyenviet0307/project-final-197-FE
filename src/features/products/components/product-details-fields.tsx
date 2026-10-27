import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { ProductInputField } from "@/features/products/components/product-variants-fields"
import type { ProductFormValues } from "@/features/products/schemas/product-schema"

export function ProductDetailsFields({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const tags = useFieldArray({ control: form.control, name: "tags" })
  return <section className="space-y-4 rounded-lg border p-4">
    <h2 className="text-lg font-semibold">Thông tin bán hàng và vận chuyển</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProductInputField form={form} name="sku" label="SKU sản phẩm" />
      <ProductInputField form={form} name="barcode" label="Mã vạch" />
      <Field><FieldLabel>Đơn vị tiền tệ</FieldLabel><p className="text-sm">VND</p></Field>
      <ProductInputField form={form} name="minimumOrderQuantity" label="Số lượng đặt tối thiểu" numeric />
      <ProductInputField form={form} name="weight" label="Khối lượng (kg)" numeric optional />
      <ProductInputField form={form} name="dimensions.width" label="Chiều rộng (cm)" numeric optional />
      <ProductInputField form={form} name="dimensions.height" label="Chiều cao (cm)" numeric optional />
      <ProductInputField form={form} name="dimensions.depth" label="Chiều sâu (cm)" numeric optional />
    </div>
    <p className="text-xs text-muted-foreground">Nhập đủ ba kích thước hoặc để trống tất cả.</p>
    <fieldset className="space-y-3"><legend className="text-sm font-medium">Nhãn sản phẩm</legend>
      {tags.fields.map((tag, index) => <div key={tag.id} className="flex items-end gap-2">
        <ProductInputField form={form} name={`tags.${index}.value`} label={`Nhãn ${index + 1}`} />
        <Button type="button" variant="outline" onClick={() => tags.remove(index)} aria-label={`Xóa nhãn ${index + 1}`}>Xóa</Button>
      </div>)}
      <FieldError errors={[form.formState.errors.tags]} />
      <Button type="button" variant="outline" disabled={tags.fields.length >= 30} onClick={() => tags.append({ value: "" })}>Thêm nhãn</Button>
    </fieldset>
    <div className="grid gap-4 lg:grid-cols-3">{([
      ["warrantyInformation", "Thông tin bảo hành"], ["shippingInformation", "Thông tin giao hàng"], ["returnPolicy", "Chính sách đổi trả"],
    ] as const).map(([name, label]) => <Controller key={name} control={form.control} name={name} render={({ field, fieldState }) => <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel><Textarea {...field} id={name} value={field.value ?? ""} maxLength={2000} aria-invalid={!!fieldState.error} aria-describedby={`${name}-error`} />
      <FieldError id={`${name}-error`} errors={[fieldState.error]} />
    </Field>} />)}</div>
  </section>
}
