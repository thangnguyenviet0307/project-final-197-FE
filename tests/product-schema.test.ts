import { expect, it } from "vitest"
import { productDefaults, productPayload, productUpdatePayload, productSchema, productErrorPath } from "@/features/products/schemas/product-schema"
import type { Product } from "@/features/products/types/products"

const id = "a".repeat(24)
const values = () => ({ ...productDefaults(), product_name: "Phone case", category: id, brand: id })
it("maps backend image and attribute errors to the matching form inputs", () => {
  const input = { ...values(), variants: [{ sku: "CASE-1", price: 1, images: [{ url: "image.png" }], options: [{ name: "material", value: "Silicone" }] }] }
  expect(productErrorPath("body.variants[0].images[0]", input)).toBe("variants.0.images.0.url")
  expect(productErrorPath("body.variants.0.attributes.material", input)).toBe("variants.0.options.0.value")
  expect(productErrorPath("body.variants.0.attributes.unknown", input)).toBeNull()
  expect(productErrorPath("body.expectedVersion", input)).toBeNull()
})
it("allows products without a price or variants and enforces backend limits", () => {
  expect(productSchema.safeParse(values()).success).toBe(true)
  for (const input of [{ discount: 71 }, { model_year: 1899 }, { stock: 1.5 }, { category: "invalid" }, { product_name: "ab" }]) {
    expect(productSchema.safeParse({ ...values(), ...input }).success).toBe(false)
  }
})
it("rejects invalid SKUs, duplicate SKUs, negative prices and duplicate option names", () => {
  const variant = { sku: "CASE-1", price: 0, stock: 0, images: [], options: [] }
  for (const variants of [[{ ...variant, sku: "lower" }], [variant, variant], [{ ...variant, price: -1 }], [{ ...variant, options: [{ name: "Color", value: "red" }, { name: "Color", value: "blue" }] }]]) {
    expect(productSchema.safeParse({ ...values(), variants }).success).toBe(false)
  }
})
it("preserves variant IDs, typed attributes and image paths when editing", () => {
  const product: Product = { ...values(), _id: id, variants: [{ _id: "b".repeat(24), sku: "CASE-1", price: 10, images: ["/case.png"], attributes: { warranty: 12, wireless: false, empty: null, color: "red" } }] }
  const result = productPayload(productSchema.parse(productDefaults(product)))
  expect(result.variants?.[0]).toMatchObject(product.variants![0])
  expect(result.variants?.[0]).not.toHaveProperty("options")
})

const original: Product = { ...values(), _id: id, slug: "custom-campaign-case", price: 150, stock: 10,
  variants: [{ _id: "b".repeat(24), sku: "CASE-1", price: 100, stock: 10, attributes: { wireless: false } }] }
it("omits untouched inventory, catalog, name and active state from a description update", () => {
  const input = { ...productDefaults(original), description: "New description" }
  expect(productUpdatePayload(input, { description: true }, original)).toEqual({ description: "New description" })
})
it("retains a custom slug on rename and omits the name on a price update", () => {
  expect(productUpdatePayload({ ...productDefaults(original), product_name: "Renamed case" }, { product_name: true }, original))
    .toEqual({ product_name: "Renamed case", slug: "custom-campaign-case" })
  expect(productUpdatePayload({ ...productDefaults(original), price: 200 }, { price: true }, original)).toEqual({ price: 200 })
})
it("allows deactivation without resending inactive catalog references", () => {
  const inactiveCatalog: Product = { ...original, category: { _id: id, name: "Cases", isActive: false } }
  expect(productUpdatePayload({ ...productDefaults(inactiveCatalog), is_active: false }, { is_active: true }, inactiveCatalog))
    .toEqual({ is_active: false })
})
it("sends a full variant list with IDs and retains the explicit product price when variants change", () => {
  const input = productDefaults(original)
  input.variants[0].stock = 8
  expect(productUpdatePayload(input, { variants: [{ stock: true }] }, original)).toEqual({
    price: 150, variants: [{ ...original.variants![0], stock: 8, variant_name: null, images: [], color: "", size: "", image: "", compare_at_price: undefined }],
  })
})
it("omits variants when nested dirty flags have been reverted", () => {
  expect(productUpdatePayload(productDefaults(original), { variants: [{ sku: false }] }, original)).toEqual({})
})
it("preserves explicit price recalculation when the price is cleared", () => {
  const input = productDefaults(original)
  input.price = undefined
  const update = productUpdatePayload(input, { price: true }, original)
  expect(update).not.toHaveProperty("price")
  expect(update.variants).toEqual(productPayload(input).variants)
})
it("keeps explicit removal of all variants and updates simple product stock", () => {
  expect(productUpdatePayload({ ...productDefaults(original), variants: [] }, { variants: true }, original)).toEqual({ variants: [], price: 150 })
  expect(productUpdatePayload({ ...productDefaults({ ...original, variants: [] }), stock: 7 }, { stock: true }, original)).toEqual({ stock: 7 })
})
it("preserves untouched compare-at prices and sends null for a cleared price even with price recalculation", () => {
  const previous = { ...original, variants: [{ ...original.variants![0], compare_at_price: 150 }] }
  const input = productDefaults(previous)
  input.variants[0].stock = 8
  expect(productUpdatePayload(input, { variants: [{ stock: true }] }, previous).variants![0].compare_at_price).toBe(150)
  input.variants[0].compare_at_price = undefined
  input.price = undefined
  const update = productUpdatePayload(input, { variants: [{ stock: true, compare_at_price: true }], price: true }, previous)
  expect(JSON.parse(JSON.stringify(update)).variants[0].compare_at_price).toBeNull()
  expect(update).not.toHaveProperty("price")
})
