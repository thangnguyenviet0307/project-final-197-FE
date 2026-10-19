import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { CatalogImage } from "@/components/catalog-image"
import { imageUrlSchema } from "@/utils/image-url"
import { getApiError } from "@/services/api"
import type { IBrand, CreateBrandInput } from "@/features/brands/types/brands"

const schema = z.object({ name: z.string().trim().min(1, "Brand name is required.").max(100), description: z.string().trim().max(500), logoUrl: imageUrlSchema })
type Values = z.infer<typeof schema>
export function BrandForm({ brand, onSubmit, onCancel, submitLabel = "Create Brand" }: { brand?: IBrand; onSubmit: (values: CreateBrandInput) => Promise<unknown> | void; onCancel: () => void; submitLabel?: string }) {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: brand?.name ?? "", description: brand?.description ?? "", logoUrl: brand?.logoUrl ?? "" } })
  const logoUrl = useWatch({ control: form.control, name: "logoUrl" })
  const busy = form.formState.isSubmitting
  return <form aria-label={brand ? "Edit brand" : "Create brand"} noValidate className="max-w-3xl space-y-6" onSubmit={form.handleSubmit(async values => {
    form.clearErrors()
    try { await onSubmit(values) } catch (error) { form.setError("root", { message: getApiError(error).message }) }
  })}>
    <fieldset disabled={busy} className="space-y-4">
      <Field><FieldLabel htmlFor="brand-name">Brand Name</FieldLabel><Input id="brand-name" {...form.register("name")} aria-invalid={!!form.formState.errors.name} /><FieldError errors={[form.formState.errors.name]} /></Field>
      <Field>
        <FieldLabel htmlFor="brand-logo">Thumbnail URL</FieldLabel>
        <div className="flex items-center gap-3">
          <Input id="brand-logo" type="url" placeholder="https://example.com/brand.png" className="min-w-0 flex-1" {...form.register("logoUrl")} aria-invalid={!!form.formState.errors.logoUrl} />
          <div className="size-8 shrink-0 [&>*]:size-full"><CatalogImage src={logoUrl} alt="Brand thumbnail preview" /></div>
        </div>
        <FieldError errors={[form.formState.errors.logoUrl]} />
      </Field>
      <Field><FieldLabel htmlFor="brand-description">Description</FieldLabel><Textarea id="brand-description" rows={5} {...form.register("description")} /><FieldError errors={[form.formState.errors.description]} /></Field>
    </fieldset>
    {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
    <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving..." : submitLabel}</Button><Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancel</Button></div>
  </form>
}
