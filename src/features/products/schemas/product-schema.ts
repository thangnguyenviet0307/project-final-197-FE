import { z } from "zod"
import { catalogId, type Product, type ProductInput } from "@/features/products/types/products"

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Vui lòng chọn bản ghi hợp lệ.")
const numeric = (label: string) => z.number({ error: `Vui lòng nhập số hợp lệ cho ${label.toLowerCase()}.` })
const stock = (label: string) => numeric(label).int(`${label} phải là số nguyên.`)
  .nonnegative(`${label} không được âm.`).max(Number.MAX_SAFE_INTEGER, `${label} không được vượt quá ${Number.MAX_SAFE_INTEGER}.`)
const optionalText = (label: string, max: number) => z.string({ error: `${label} phải là văn bản.` }).trim().max(max, `${label} không được vượt quá ${max} ký tự.`).nullable().optional()
export const variantSchema = z.object({
  _id: objectId.optional(),
  sku: z.string({ error: "Vui lòng nhập mã SKU." }).trim().min(3, "Mã SKU phải có ít nhất 3 ký tự.").max(64, "Mã SKU không được vượt quá 64 ký tự.").regex(/^[A-Z0-9-]+$/, "Mã SKU chỉ được chứa chữ in hoa, chữ số và dấu gạch nối."),
  variant_name: z.union([z.string().trim().min(1).max(100, "Tên biến thể không được vượt quá 100 ký tự."), z.literal(""), z.null()], { error: "Nhập tên biến thể từ 1 đến 100 ký tự, hoặc để trống." }).optional(),
  color: optionalText("Màu sắc", 50), size: optionalText("Kích thước", 50),
  price: numeric("Giá biến thể").nonnegative("Giá biến thể không được âm."), compare_at_price: numeric("Giá so sánh").nonnegative("Giá so sánh không được âm.").nullable().optional(),
  stock: stock("Tồn kho biến thể").optional(), image: optionalText("Đường dẫn ảnh chính", 255),
  images: z.array(z.object({ url: z.string().trim().min(1, "Vui lòng nhập đường dẫn ảnh.").max(255, "Đường dẫn ảnh không được vượt quá 255 ký tự.") })),
  options: z.array(z.object({ name: z.string().trim().min(1, "Vui lòng nhập tên tùy chọn."), value: z.union([z.string(), z.number(), z.boolean(), z.null()]) })).superRefine((options, ctx) => {
    const names = new Set<string>()
    options.forEach((option, index) => {
      if (names.has(option.name)) ctx.addIssue({ code: "custom", path: [index, "name"], message: "Tên tùy chọn không được trùng nhau." })
      names.add(option.name)
    })
  }),
})
export const productSchema = z.object({
  product_name: z.string({ error: "Vui lòng nhập tên sản phẩm." }).trim().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự.").max(255, "Tên sản phẩm không được vượt quá 255 ký tự."),
  category: z.string().regex(/^[a-f\d]{24}$/i, "Vui lòng chọn danh mục hợp lệ."), brand: z.string().regex(/^[a-f\d]{24}$/i, "Vui lòng chọn thương hiệu hợp lệ."),
  model_year: numeric("Năm sản xuất").int("Năm sản xuất phải là số nguyên.").min(1900, "Năm sản xuất phải từ 1900 trở đi.").max(new Date().getFullYear() + 2, `Năm sản xuất không được sau ${new Date().getFullYear() + 2}.`),
  price: numeric("Giá").nonnegative("Giá không được âm.").optional(), discount: numeric("Giảm giá").min(0, "Mức giảm giá không được âm.").max(70, "Mức giảm giá không được vượt quá 70%."),
  description: optionalText("Mô tả", 2000), thumbnail: optionalText("Đường dẫn ảnh đại diện", 255),
  stock: stock("Tồn kho").optional(), is_active: z.boolean(), variants: z.array(variantSchema),
}).superRefine(({ variants }, ctx) => {
  const skus = new Set<string>()
  variants.forEach((variant, index) => {
    if (skus.has(variant.sku)) ctx.addIssue({ code: "custom", path: ["variants", index, "sku"], message: "Mã SKU không được trùng nhau." })
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
