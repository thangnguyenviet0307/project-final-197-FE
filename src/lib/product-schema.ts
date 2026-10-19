import { z } from "zod"
import { catalogId, type Product, type ProductInput } from "@/types/products"

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Select a valid record.")
const stock = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
const optionalText = (max: number) => z.string().trim().max(max).nullable().optional()
export const variantSchema = z.object({
  _id: objectId.optional(),
  sku: z.string().trim().min(3).max(64).regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers and hyphens."),
  variant_name: z.union([z.string().trim().min(1).max(100), z.literal(""), z.null()]).optional(),
  color: optionalText(50), size: optionalText(50),
  price: z.number().nonnegative(), compare_at_price: z.number().nonnegative().nullable().optional(),
  stock: stock.optional(), image: optionalText(255),
  images: z.array(z.object({ url: z.string().trim().min(1, "Enter an image path.").max(255) })),
  options: z.array(z.object({ name: z.string().trim().min(1, "Enter an option name."), value: z.union([z.string(), z.number(), z.boolean(), z.null()]) })).superRefine((options, ctx) => {
    const names = new Set<string>()
    options.forEach((option, index) => {
      if (names.has(option.name)) ctx.addIssue({ code: "custom", path: [index, "name"], message: "Option names must be unique." })
      names.add(option.name)
    })
  }),
})
export const productSchema = z.object({
  product_name: z.string().trim().min(3).max(255), category: objectId, brand: objectId,
  model_year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  price: z.number().nonnegative().optional(), discount: z.number().min(0).max(70),
  description: optionalText(2000), thumbnail: optionalText(255),
  stock: stock.optional(), is_active: z.boolean(), variants: z.array(variantSchema),
}).superRefine(({ variants }, ctx) => {
  const skus = new Set<string>()
  variants.forEach((variant, index) => {
    if (skus.has(variant.sku)) ctx.addIssue({ code: "custom", path: ["variants", index, "sku"], message: "SKU must be unique." })
    skus.add(variant.sku)
  })
})
export type ProductFormValues = z.infer<typeof productSchema>
export function productDefaults(product?: Product): ProductFormValues {
  return {
    product_name: product?.product_name ?? "", category: product ? catalogId(product.category) : "", brand: product ? catalogId(product.brand) : "",
    model_year: product?.model_year ?? new Date().getFullYear(), price: product?.price,
    discount: product?.discount ?? 0, description: product?.description ?? "", thumbnail: product?.thumbnail ?? "",
    stock: product?.stock ?? 0, is_active: product?.is_active ?? true,
    variants: (product?.variants ?? []).map((variant) => ({ ...variant,
      variant_name: variant.variant_name ?? "", color: variant.color ?? "", size: variant.size ?? "",
      image: variant.image ?? "", stock: variant.stock ?? 0, compare_at_price: variant.compare_at_price ?? undefined,
      images: (variant.images ?? []).map(url => ({ url })),
      options: Object.entries(variant.attributes ?? {}).map(([name, value]) => ({ name, value })),
    })),
  }
}
export function productPayload(values: ProductFormValues): ProductInput {
  return { ...values, variants: values.variants.map(({ options, images, variant_name, ...variant }) => ({
    ...variant, variant_name: variant_name || null, images: images.map(({ url }) => url), attributes: Object.fromEntries(options.map(({ name, value }) => [name, value])),
  })) }
}

export function productUpdatePayload(
  values: ProductFormValues,
  changedFields: Partial<Record<keyof ProductFormValues, unknown>>,
  original: Product,
): Partial<ProductInput> {
  const payload = productPayload(values)
  const hasChanges = (field: unknown): boolean => field === true || (
    typeof field === "object" && field !== null && Object.values(field).some(hasChanges)
  )
  const update = Object.fromEntries(Object.entries(payload).filter(([key, value]) => value !== undefined && hasChanges(changedFields[key as keyof ProductFormValues]))) as Partial<ProductInput>
  // JSON drops undefined; clearing an existing nullable value must be explicit.
  if (update.variants) update.variants = update.variants.map(variant => {
    const previous = variant._id ? original.variants?.find(item => item._id === variant._id) : undefined
    return variant.compare_at_price === undefined && previous?.compare_at_price != null
      ? { ...variant, compare_at_price: null } : variant
  })
  // Clearing price explicitly requests the existing lowest-variant-price behavior.
  if (hasChanges(changedFields.price) && values.price === undefined && values.variants.length && update.variants === undefined) update.variants = payload.variants
  // Variant updates otherwise cause the backend to recalculate the product price.
  if (update.variants !== undefined && values.price !== undefined) update.price = values.price
  // Stock belongs to individual variants whenever the product has variants.
  if (values.variants.length) delete update.stock
  // Sending a name makes the backend regenerate the slug unless it is retained explicitly.
  if (update.product_name !== undefined && original.slug) update.slug = original.slug
  return update
}
