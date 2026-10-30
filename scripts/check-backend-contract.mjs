import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import vm from "node:vm"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import { webcrypto } from "node:crypto"
import ts from "typescript"

// Read and execute only pure validation/service modules. Never import the Backend app,
// environment configuration, models or database connection.
const root = fileURLToPath(new URL("../", import.meta.url))
const backend = path.resolve(root, process.argv[2] ?? "../project-final-197-BE")
const require = createRequire(import.meta.url)
const backendRequire = createRequire(path.join(backend, "package.json"))
const loaded = new Map()
const allowed = new Set([
  "validations/common.validation.ts", "validations/customers.validation.ts",
  "validations/users.validation.ts", "validations/brands.validation.ts",
  "validations/categories.validation.ts", "validations/checkout.validation.ts",
  "validations/products.validation.ts", "validations/hero-slides.validation.ts",
  "validations/orders.validation.ts", "types/orders.type.ts",
])

function evaluate(file, resolve) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, require: resolve, crypto: webcrypto }, { filename: file })
  return exports
}
function loadValidation(relative) {
  if (!allowed.has(relative)) throw new Error(`Refusing to load a non-validation Backend module: ${relative}`)
  if (!loaded.has(relative)) {
    const file = path.join(backend, "src", relative)
    loaded.set(relative, evaluate(file, specifier => {
      if (specifier === "zod") return backendRequire("zod")
      if (!specifier.startsWith(".")) throw new Error(`Unsupported validation import: ${specifier}`)
      const resolved = path.relative(path.join(backend, "src"), path.resolve(path.dirname(file), specifier.replace(/\.js$/, ".ts"))).replaceAll("\\", "/")
      return loadValidation(resolved)
    }))
  }
  return loaded.get(relative)
}

const customers = loadValidation("validations/customers.validation.ts")
const brands = loadValidation("validations/brands.validation.ts")
const categories = loadValidation("validations/categories.validation.ts")
const users = loadValidation("validations/users.validation.ts")
const id = "a".repeat(24)
const requests = []
const customer = { _id: id, firstName: "An", lastName: "Nguyen", email: "an@example.com", phone: "0901234567", address: { street: "One", city: "City", state: "State" }, isActive: true }
const api = {
  async get(url, config) {
    customers.getCustomersQuerySchema.parse(config.params)
    requests.push({ method: "GET", url, query: config.params })
    return { data: { success: true, data: [customer], pagination: { page: config.params.page, limit: 10, total: 101, totalPages: 11 } } }
  },
  async post(url, body) {
    const schema = url === "/customers" ? customers.createCustomerSchema : url === "/brands" ? brands.createBrandSchema : url === "/categories" ? categories.createCategoriesSchema : users.createUserSchema
    const parsed = schema.parse(body)
    assert.ok(Object.keys(body).every(key => Object.hasOwn(parsed, key)), `Backend would discard unsupported fields for ${url}`)
    requests.push({ method: "POST", url, body })
    return { data: { success: true, data: url === "/customers" ? customer : { _id: id, ...body } } }
  },
  async put(url, body) {
    const schema = url.startsWith("/customers/") ? customers.updateCustomerSchema : url.startsWith("/brands/") ? brands.updateBrandSchema : url.startsWith("/categories/") ? categories.updateCategoriesSchema : users.updateUserSchema
    schema.parse(body)
    requests.push({ method: "PUT", url, body })
    return { data: { success: true, data: url.startsWith("/customers/") ? customer : { _id: id, ...body } } }
  },
  async delete(url) { requests.push({ method: "DELETE", url }); return { data: { success: true, data: null } } },
}
function loadService(relative) {
  return evaluate(path.join(root, "src", relative), specifier => {
    if (specifier === "@/services/api") return { api }
    if (specifier === "@/features/auth/schemas/auth-schemas") return evaluate(path.join(root, "src/features/auth/schemas/auth-schemas.ts"), require)
    if (specifier === "@/utils/image-url") return evaluate(path.join(root, "src/utils/image-url.ts"), require)
    if (specifier === "zod") return require("zod")
    throw new Error(`Unsupported service import: ${specifier}`)
  })
}
const customerService = loadService("features/customers/services/customers.service.ts").customersService
const brandService = loadService("features/brands/services/brands.service.ts").brandsService
const categoryService = loadService("features/categories/services/categories.service.ts")
const userService = loadService("features/users/services/users.service.ts")
const contacts = await customerService.getCustomers({ page: 11, limit: 10, search: "An" })
assert.equal(contacts.pagination.total, 101)
assert.equal(contacts.data[0].first_name, "An")
assert.equal(contacts.data[0].last_name, "Nguyen")
assert.equal(Object.hasOwn(customerService, "createCustomer"), false)
await customerService.updateCustomer(id, { first_name: "Binh" })
await customerService.deleteCustomer(id)
await brandService.createBrand({ name: "Acme", description: "Devices", isActive: true, logoUrl: "https://example.com/brand.png" })
await brandService.updateById(id, { name: "Acme updated" })
await brandService.deleteById(id)
await categoryService.createCategory({ name: "Phones", description: "Devices", parent: null, isActive: true })
await categoryService.updateCategory({ id, input: { name: "Cases", icon: "https://example.com/category.png" } })
await categoryService.deleteCategory(id)
const temporary = userService.getTemporaryPassword("staff")
assert.equal(temporary, "Staff123")
assert.equal(userService.getTemporaryPassword("admin"), "Admin123")
await userService.createUser({ firstName: "New", lastName: "Staff", email: "staff@example.com", role: "staff", password: temporary })
await userService.resetUserPassword({ id, password: userService.getTemporaryPassword("admin") })
assert.equal(categories.updateCategoriesSchema.safeParse({ icon: "" }).success, true)
assert.equal(brands.updateBrandSchema.safeParse({ logoUrl: "" }).success, true)
assert.equal(categories.updateCategoriesSchema.safeParse({ icon: "javascript:alert(1)" }).success, false)
assert.equal(brands.updateBrandSchema.safeParse({ logoUrl: "data:image/svg+xml,test" }).success, false)
const products = loadValidation("validations/products.validation.ts")
const common = loadValidation("validations/common.validation.ts")
const productForm = evaluate(path.join(root, "src/features/products/schemas/product-schema.ts"), specifier => {
  if (specifier === "zod") return require("zod")
  if (specifier === "@/features/products/types/products") return evaluate(path.join(root, "src/features/products/types/products.ts"), require)
  throw new Error(`Unsupported product schema import: ${specifier}`)
})
const reviewForm = evaluate(path.join(root, "src/features/products/schemas/product-review-schema.ts"), require)
const productApi = {
  async post(url, body) {
    const schema = url.endsWith("/reviews") ? products.reviewInputSchema : products.createProductSchema
    const parsed = schema.parse(body)
    assert.ok(Object.keys(body).every(key => Object.hasOwn(parsed, key)), `Backend would discard unsupported product fields for ${url}`)
    requests.push({ method: "POST", url, body })
    return { data: { data: { _id: id, ...body } } }
  },
  async put(url, body) {
    products.updateProductSchema.parse(body)
    requests.push({ method: "PUT", url, body })
    return { data: { data: { _id: id, ...body } } }
  },
  async get(url, config) {
    if (url.endsWith("/reviews")) common.paginationSchema.parse(config.params)
    requests.push({ method: "GET", url, query: config.params })
    return { data: url.endsWith("/metrics") ? { data: { rating: 0, reviewCount: 0, soldCount: 0 } }
      : { data: [], pagination: { page: config.params.page, limit: 5, total: 0, totalPages: 0 } } }
  },
  async delete(url) { requests.push({ method: "DELETE", url }); return { data: { success: true } } },
}
function loadProductService(file) {
  return evaluate(path.join(root, "src/features/products/services", file), specifier => {
    if (specifier === "@/services/api") return { api: productApi }
    throw new Error(`Unsupported product service import: ${specifier}`)
  })
}
const productService = loadProductService("products.service.ts")
const reviewService = loadProductService("product-reviews.service.ts")
const productValues = productForm.productSchema.parse({ ...productForm.productDefaults(), product_name: "Imported case", category: id, brand: id,
  sku: "case-001", barcode: "12345", tags: [{ value: "Case" }], weight: 0.5, dimensions: { width: 10, height: 20, depth: 2 },
  warrantyInformation: "12 months", shippingInformation: "3 days", returnPolicy: "30 days", minimumOrderQuantity: 2 })
const productBody = productForm.productPayload(productValues)
await productService.createProduct(productBody)
await productService.updateProduct({ id, input: productForm.productUpdatePayload({ ...productValues, weight: undefined, dimensions: {}, tags: [], sku: "", model_year: undefined },
  { weight: true, dimensions: true, tags: true, sku: true, model_year: true }, { _id: id, ...productBody }) })
await reviewService.createProductReview({ id, input: reviewForm.productReviewSchema.parse({ reviewerName: "Admin", rating: 5, comment: "Good product" }) })
assert.deepEqual(await reviewService.getProductMetrics(id), { rating: 0, reviewCount: 0, soldCount: 0 })
assert.equal((await reviewService.listProductReviews(id, 2)).pagination.page, 2)
await reviewService.deleteProductReview({ id, reviewId: id })
const heroValidation = loadValidation("validations/hero-slides.validation.ts")
const heroApi = {
  async get(url) { requests.push({ method: "GET", url }); return { data: { data: [] } } },
  async post(url, body) { heroValidation.createHeroSlideSchema.parse(body); requests.push({ method: "POST", url, body }); return { data: { data: { _id: id, ...body } } } },
  async patch(url, body) { heroValidation.updateHeroSlideSchema.parse(body); requests.push({ method: "PATCH", url, body }); return { data: { data: { _id: id, ...body } } } },
  async delete(url, config) { heroValidation.heroSlideVersionSchema.parse(config.data); requests.push({ method: "DELETE", url, body: config.data }); return { data: { success: true } } },
}
const heroService = evaluate(path.join(root, "src/features/hero-slides/services/hero-slides.service.ts"), specifier => {
  if (specifier === "@/services/api") return { api: heroApi, authApi: heroApi }
  throw new Error(`Unsupported hero service import: ${specifier}`)
})
const heroForm = evaluate(path.join(root, "src/features/hero-slides/schemas/hero-slide-schema.ts"), specifier => {
  if (specifier === "zod") return require("zod")
  throw new Error(`Unsupported hero form import: ${specifier}`)
})
const heroInput = heroForm.heroSlideSchema.parse({ category: id, title: "Custom title", description: "Custom description", imageUrl: "", sortOrder: 2, isActive: true })
await heroService.listHeroSlides()
await heroService.listPublicHeroSlides()
await heroService.createHeroSlide(heroInput)
await heroService.updateHeroSlide({ id, input: { expectedVersion: 0, description: "Updated description", imageUrl: null } })
await heroService.deleteHeroSlide({ id, expectedVersion: 1 })
const checkoutValidation = loadValidation("validations/checkout.validation.ts")
const checkoutService = evaluate(path.join(root, "src/features/checkout/services/checkout.service.ts"), specifier => {
  if (specifier === "@/features/checkout/schemas/checkout-schema") return evaluate(path.join(root, "src/features/checkout/schemas/checkout-schema.ts"), dependency => {
    if (dependency === "zod") return require("zod")
    throw new Error(`Unsupported checkout schema import: ${dependency}`)
  })
  if (specifier === "@/services/api") return { api: {
    async post(url, body) {
      assert.equal(url, "/customer-auth/orders")
      checkoutValidation.checkoutSchema.parse(body)
      requests.push({ method: "POST", url, body })
      return { data: { data: { _id: id, orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 } } }
    },
  } }
  throw new Error(`Unsupported checkout service import: ${specifier}`)
})
await checkoutService.createCheckout({ requestId: webcrypto.randomUUID(), recipientName: "Nguyễn An", phone: "0901234567", provinceCode: 1, districtCode: 2, wardCode: 3, street: "12 Đường A", note: "", paymentMethod: "cod", items: [{ productId: id, quantity: 2, expectedUnitPrice: 100000 }] })
const adminOrderAddress = evaluate(path.join(root, "src/features/orders/schemas/admin-order-schema.ts"), specifier => {
  if (specifier === "zod") return require("zod")
  throw new Error(`Unsupported order schema import: ${specifier}`)
}).adminOrderAddressSchema
const backendAddress = loadValidation("validations/common.validation.ts").createAddressSchema()
for (const [field, limit] of [["street", 255], ["city", 50], ["state", 50]]) {
  for (const length of [0, limit, limit + 1]) {
    const value = { street: "Street", city: "City", state: "State", [field]: "x".repeat(length) }
    assert.equal(adminOrderAddress.safeParse(value).success, backendAddress.safeParse(value).success, `Order address boundary: ${field}/${length}`)
  }
}
const noteValidation = loadValidation("validations/orders.validation.ts").updateOrderNoteSchema
noteValidation.parse({ orderNote: "Updated note", expectedOrderNote: "Original note" })
noteValidation.parse({ orderNote: "First note", expectedOrderNote: "" })
assert.equal(noteValidation.safeParse({ orderNote: "Unsafe update without baseline" }).success, false)
console.log(`Backend schema contract checks passed: ${requests.length} service requests validated; no HTTP or database connections.`)
