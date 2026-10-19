import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { CatalogImage } from "@/components/catalog-image"
import { categorySchema, type Category, type CategoryFormInput } from "@/features/categories/services/categories.service"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { getApiError } from "@/services/api"

export function CategoryForm({ category, onSubmit, onCancel }: { category?: Category; onSubmit: (values: CategoryFormInput) => Promise<unknown>; onCancel: () => void }) {
  const categories = useCategories()
  const form = useForm<CategoryFormInput>({ resolver: zodResolver(categorySchema), defaultValues: { name: category?.name ?? "", description: category?.description ?? "", icon: category?.icon ?? "", parent: typeof category?.parent === "object" ? category.parent?._id ?? null : category?.parent ?? null, isActive: category?.isActive ?? true } })
  const icon = useWatch({ control: form.control, name: "icon" })
  const busy = form.formState.isSubmitting
  return <form aria-label={category ? "Edit category" : "Create category"} noValidate className="max-w-3xl space-y-6" onSubmit={form.handleSubmit(async values => {
    form.clearErrors()
    try { await onSubmit(values) } catch (error) { form.setError("root", { message: getApiError(error).message }) }
  })}>
    <fieldset disabled={busy} className="space-y-4">
      <Field><FieldLabel htmlFor="category-name">Category name</FieldLabel><Input id="category-name" {...form.register("name")} aria-invalid={!!form.formState.errors.name} /><FieldError errors={[form.formState.errors.name]} /></Field>
      <Field>
        <FieldLabel htmlFor="category-icon">Thumbnail URL</FieldLabel>
        <div className="flex items-center gap-3">
          <Input id="category-icon" type="url" placeholder="https://example.com/category.png" className="min-w-0 flex-1" {...form.register("icon")} aria-invalid={!!form.formState.errors.icon} />
          <div className="size-8 shrink-0 [&>*]:size-full"><CatalogImage src={icon} alt="Category thumbnail preview" /></div>
        </div>
        <FieldError errors={[form.formState.errors.icon]} />
      </Field>
      <Field><FieldLabel htmlFor="category-description">Description</FieldLabel><Textarea id="category-description" rows={5} {...form.register("description")} /><FieldError errors={[form.formState.errors.description]} /></Field>
      <Field><FieldLabel htmlFor="category-parent">Parent category</FieldLabel><select id="category-parent" className="h-8 rounded-md border bg-background px-2 text-sm" {...form.register("parent", { setValueAs: value => value || null })} disabled={categories.isPending || categories.isError}>
        <option value="">No parent (root category)</option>{categories.data?.filter(item => item._id !== category?._id).map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
      </select></Field>
      {categories.isError && <div role="alert"><p>{getApiError(categories.error).message}</p><Button type="button" variant="outline" onClick={() => void categories.refetch()}>Retry categories</Button></div>}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isActive")} />Active category</label>
    </fieldset>
    {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
    <div className="flex gap-2"><Button type="submit" disabled={busy || categories.isPending || categories.isError}>{busy ? "Saving..." : category ? "Save changes" : "Create category"}</Button><Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancel</Button></div>
  </form>
}
