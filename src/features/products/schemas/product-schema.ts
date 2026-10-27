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
  sku: z.union([z.string().trim().toUpperCase().min(3, "SKU phải có ít nhất 3 ký tự.").max(64).regex(/^[A-Z0-9-]+$/, "SKU chỉ chứa chữ, số và dấu gạch ngang."), z.literal(""), z.null()]).optional(),
  barcode: optionalText("Mã vạch", 64),
  currency: z.literal("VND").optional(),
  tags: z.array(z.object({ value: z.string().trim().min(1, "Nhãn không được để trống.").max(50, "Nhãn tối đa 50 ký tự.") })).max(30, "Tối đa 30 nhãn.").optional(),
  weight: numeric("Khối lượng").nonnegative("Khối lượng không được âm.").nullable().optional(),
  dimensions: z.object({
    width: numeric("Chiều rộng").nonnegative("Chiều rộng không được âm.").optional(),
    height: numeric("Chiều cao").nonnegative("Chiều cao không được âm.").optional(),
    depth: numeric("Chiều sâu").nonnegative("Chiều sâu không được âm.").optional(),
  }).superRefine((value, ctx) => {
    if (Object.values(value).some(item => item !== undefined)) {
      for (const key of ["width", "height", "depth"] as const) {
        if (value[key] === undefined) ctx.addIssue({ code: "custom", path: [key], message: "Vui lòng nhập đủ ba kích thước hoặc để trống tất cả." })
      }
    }
  }).optional(),
  warrantyInformation: optionalText("Thông tin bảo hành", 2000),
  shippingInformation: optionalText("Thông tin giao hàng", 2000),
  returnPolicy: optionalText("Chính sách đổi trả", 2000),
  minimumOrderQuantity: stock("Số lượng đặt tối thiểu").min(1, "Số lượng đặt tối thiểu phải từ 1.").optional(),
  product_name: z.string({ error: "Vui lòng nhập tên sản phẩm." }).trim().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự.").max(255, "Tên sản phẩm không được vượt quá 255 ký tự."),
  category: z.string().regex(/^[a-f\d]{24}$/i, "Vui lòng chọn danh mục hợp lệ."), brand: z.string().regex(/^[a-f\d]{24}$/i, "Vui lòng chọn thương hiệu hợp lệ."),
  model_year: numeric("Năm sản xuất").int("Năm sản xuất phải là số nguyên.").min(1900, "Năm sản xuất phải từ 1900 trở đi.").max(new Date().getFullYear() + 2, `Năm sản xuất không được sau ${new Date().getFullYear() + 2}.`).nullable().optional(),
  price: numeric("Giá").nonnegative("Giá không được âm.").optional(), discount: numeric("Giảm giá").min(0, "Mức giảm giá không được âm.").max(70, "Mức giảm giá không được vượt quá 70%."),
  description: optionalText("Mô tả", 2000), thumbnail: optionalText("Đường dẫn ảnh đại diện", 255),
  stock: stock("Tồn kho").optional(), on_sale: z.boolean().optional(), is_best_seller: z.boolean().optional(), is_new: z.boolean().optional(), is_hot: z.boolean().optional(), is_home: z.boolean().optional(), is_active: z.boolean(), variants: z.array(variantSchema),
}).superRefine(({ variants, sku }, ctx) => {
  const skus = new Set<string>()
  variants.forEach((variant, index) => {
    if (sku && variant.sku === sku) ctx.addIssue({ code: "custom", path: ["variants", index, "sku"], message: "SKU biến thể phải khác SKU sản phẩm." })
    if (skus.has(variant.sku)) ctx.addIssue({ code: "custom", path: ["variants", index, "sku"], message: "Mã SKU không được trùng nhau." })
    skus.add(variant.sku)
  })
})
// Existing missing references must not block unrelated partial metadata updates.
export function productEditSchema(product: Product) {
  return productSchema.safeExtend({
    category: catalogId(product.category) ? objectId : z.union([objectId, z.literal("")]),
    brand: catalogId(product.brand) ? objectId : z.union([objectId, z.literal("")]),
  })
}
export type ProductFormValues = z.infer<typeof productSchema>

export function productErrorPath(field: string, values: ProductFormValues): string | null {
  let path = field.replace(/^body\./, "").replace(/\[(\d+)\]/g, ".$1")
  if (Object.hasOwn(values, path)) return path
  if (/^dimensions\.(width|height|depth)$/.test(path)) return path
  if (/^tags\.\d+$/.test(path)) return `${path}.value`
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
    sku: product?.sku ?? "", barcode: product?.barcode ?? "", currency: "VND",
    tags: (product?.tags ?? []).map(value => ({ value })), weight: product?.weight ?? undefined,
    dimensions: { width: product?.dimensions?.width, height: product?.dimensions?.height, depth: product?.dimensions?.depth },
    warrantyInformation: product?.warrantyInformation ?? "", shippingInformation: product?.shippingInformation ?? "",
    returnPolicy: product?.returnPolicy ?? "", minimumOrderQuantity: product?.minimumOrderQuantity ?? 1,
    product_name: product?.product_name ?? "", category: product ? catalogId(product.category) : "", brand: product ? catalogId(product.brand) : "",
    model_year: product ? product.model_year ?? undefined : new Date().getFullYear(), price: product?.price,
    discount: product?.discount ?? 0, description: product?.description ?? "", thumbnail: product?.thumbnail ?? "",
    on_sale: product?.on_sale ?? true,
    is_best_seller: product?.is_best_seller ?? false,
    is_new: product?.is_new ?? false,
    is_hot: product?.is_hot ?? false,
    is_home: product?.is_home ?? false,
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
  const dimensions = values.dimensions
  return { ...values, model_year: values.model_year ?? null, sku: values.sku || null, barcode: values.barcode?.trim() || null,
    tags: values.tags?.map(({ value }) => value), weight: values.weight ?? null,
    dimensions: dimensions?.width !== undefined && dimensions.height !== undefined && dimensions.depth !== undefined
      ? { width: dimensions.width, height: dimensions.height, depth: dimensions.depth } : null,
    variants: values.variants.map(({ options, images, variant_name, ...variant }) => ({
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
  for (const name of ["category", "brand"] as const) {
    if (update[name] === "" && !catalogId(original[name])) delete update[name]
  }
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
