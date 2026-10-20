import { z } from "zod"
import { catalogId, type Product, type ProductInput } from "@/features/products/types/products"

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Select a valid record.")
const numeric = (label: string) => z.number({ error: `Enter a valid number for ${label.toLowerCase()}.` })
const stock = (label: string) => numeric(label).int(`${label} must be a whole number.`)
  .nonnegative(`${label} cannot be negative.`).max(Number.MAX_SAFE_INTEGER, `${label} cannot exceed ${Number.MAX_SAFE_INTEGER}.`)
const optionalText = (label: string, max: number) => z.string({ error: `${label} must be text.` }).trim().max(max, `${label} cannot exceed ${max} characters.`).nullable().optional()
export const variantSchema = z.object({
  _id: objectId.optional(),
  sku: z.string({ error: "Enter a SKU." }).trim().min(3, "SKU must contain at least 3 characters.").max(64, "SKU cannot exceed 64 characters.").regex(/^[A-Z0-9-]+$/, "SKU can only contain uppercase letters, numbers and hyphens."),
  variant_name: z.union([z.string().trim().min(1).max(100, "Variant name cannot exceed 100 characters."), z.literal(""), z.null()], { error: "Enter a variant name of 1 to 100 characters, or leave it blank." }).optional(),
  color: optionalText("Color", 50), size: optionalText("Size", 50),
  price: numeric("Variant price").nonnegative("Variant price cannot be negative."), compare_at_price: numeric("Compare at price").nonnegative("Compare at price cannot be negative.").nullable().optional(),
  stock: stock("Variant stock").optional(), image: optionalText("Primary image path", 255),
  images: z.array(z.object({ url: z.string().trim().min(1, "Enter an image path.").max(255, "Image path cannot exceed 255 characters.") })),
  options: z.array(z.object({ name: z.string().trim().min(1, "Enter an option name."), value: z.union([z.string(), z.number(), z.boolean(), z.null()]) })).superRefine((options, ctx) => {
    const names = new Set<string>()
    options.forEach((option, index) => {
      if (names.has(option.name)) ctx.addIssue({ code: "custom", path: [index, "name"], message: "Option names must be unique." })
      names.add(option.name)
    })
  }),
})
export const productSchema = z.object({
  product_name: z.string({ error: "Enter a product name." }).trim().min(3, "Product name must contain at least 3 characters.").max(255, "Product name cannot exceed 255 characters."),
  category: z.string().regex(/^[a-f\d]{24}$/i, "Select a valid category."), brand: z.string().regex(/^[a-f\d]{24}$/i, "Select a valid brand."),
  model_year: numeric("Model year").int("Model year must be a whole year.").min(1900, "Model year must be 1900 or later.").max(new Date().getFullYear() + 2, `Model year cannot be later than ${new Date().getFullYear() + 2}.`),
  price: numeric("Price").nonnegative("Price cannot be negative.").optional(), discount: numeric("Discount").min(0, "Discount cannot be negative.").max(70, "Discount cannot exceed 70%."),
  description: optionalText("Description", 2000), thumbnail: optionalText("Thumbnail path", 255),
  stock: stock("Stock").optional(), is_active: z.boolean(), variants: z.array(variantSchema),
}).superRefine(({ variants }, ctx) => {
  const skus = new Set<string>()
  variants.forEach((variant, index) => {
    if (skus.has(variant.sku)) ctx.addIssue({ code: "custom", path: ["variants", index, "sku"], message: "SKU must be unique." })
    skus.add(variant.sku)
  })
})
export type ProductFormValues = z.infer<typeof productSchema>

export function productErrorPath(field: string, values: ProductFormValues): string | null {
  let path = field.replace(/^body\./, "").replace(/\[(\d+)\]/g, ".$1")
  if (Object.hasOwn(values, path)) return path
  path = path.replace(/^(variants\.\d+\.images\.\d+)$/, "$1.url")
  const attribute = /^variants\.(\d+)\.attributes\.(.+)$/.exec(path)
  if (attribute) {
    const index = values.variants[Number(attribute[1])]?.options.findIndex(option => option.name === attribute[2]) ?? -1
    if (index < 0) return null
    path = `variants.${attribute[1]}.options.${index}.value`
  }
  return /^variants\.\d+\.(sku|price|stock|variant_name|color|size|image|compare_at_price|images\.\d+\.url|options\.\d+\.(name|value))$/.test(path) ? path : null
}

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
