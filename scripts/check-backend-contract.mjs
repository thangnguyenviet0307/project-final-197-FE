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
  "validations/shared/common.validation.ts", "validations/customers/customers.validation.ts",
  "validations/users/users.validation.ts", "validations/brands/brands.validation.ts",
  "validations/categories/categories.validation.ts", "validations/orders/checkout.validation.ts", "validations/orders/customer-order-cancel.validation.ts",
  "validations/products/products.validation.ts", "validations/storefront/hero-slides.validation.ts",
  "validations/orders/orders.validation.ts", "types/orders/orders.type.ts",
  "validations/articles/articles.validation.ts", "validations/articles/post-categories.validation.ts",
  "validations/products/product-news.validation.ts",
  "validations/support/support.validation.ts",
  "validations/support/information.validation.ts",
  "validations/support/managed-document.validation.ts",
])

function evaluate(file, resolve) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, require: resolve, crypto: webcrypto, FormData, File }, { filename: file })
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

const customers = loadValidation("validations/customers/customers.validation.ts")
const brands = loadValidation("validations/brands/brands.validation.ts")
const categories = loadValidation("validations/categories/categories.validation.ts")
const users = loadValidation("validations/users/users.validation.ts")
const id = "a".repeat(24)
const requests = []
const customer = { _id: id, firstName: "An", lastName: "Nguyen", email: "an@example.com", phone: "0901234567", address: { street: "One", city: "City", state: "State" }, isActive: true }
function catalogBody(body) {
  if (!(body instanceof FormData)) return body
  assert.ok(body.get("image") instanceof File)
  const fields = Object.fromEntries([...body.entries()].filter(([key]) => key !== "image"))
  if (fields.isActive === "true" || fields.isActive === "false") fields.isActive = fields.isActive === "true"
  if (fields.parent === "null" || fields.parent === "") fields.parent = null
  return fields
}
const api = {
  async get(url, config) {
    customers.getCustomersQuerySchema.parse(config.params)
    requests.push({ method: "GET", url, query: config.params })
    return { data: { success: true, data: [customer], pagination: { page: config.params.page, limit: 10, total: 101, totalPages: 11 } } }
  },
  async post(url, body) {
    body = catalogBody(body)
    if (/^\/users\/[^/]+\/reset-password$/.test(url)) {
      assert.deepEqual(Object.keys(body), [])
      requests.push({ method: 'POST', url, body })
      return { data: { success: true, data: null } }
    }
    const schema = url === "/customers" ? customers.createCustomerSchema : url === "/brands" ? brands.createBrandSchema : url === "/categories" ? categories.createCategoriesSchema : users.createUserSchema
    const parsed = schema.parse(body)
    assert.ok(Object.keys(body).every(key => Object.hasOwn(parsed, key)), `Backend would discard unsupported fields for ${url}`)
    requests.push({ method: "POST", url, body })
    return { data: { success: true, data: url === "/customers" ? customer : { _id: id, ...body } } }
  },
  async put(url, body) {
    body = catalogBody(body)
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
    if (specifier === "@/utils/catalog-form-data") return evaluate(path.join(root, "src/utils/catalog-form-data.ts"), require)
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
const catalogImage = new File([new Uint8Array([137,80,78,71,13,10,26,10])], "photo.png", { type: "image/png" })
await brandService.createBrand({ name: "Uploaded brand", isActive: false, image: catalogImage })
await brandService.updateById(id, { image: catalogImage, name: "Uploaded logo" })
await categoryService.createCategory({ name: "Uploaded category", parent: null, isActive: false, image: catalogImage })
await categoryService.updateCategory({ id, input: { image: catalogImage, name: "Uploaded icon" } })
const temporary = userService.getTemporaryPassword("staff")
assert.match(temporary, /^Aa1![a-f0-9]{36}$/)
assert.notEqual(temporary, userService.getTemporaryPassword("admin"))
await userService.createUser({ firstName: "New", lastName: "Staff", email: "staff@example.com", role: "staff", password: temporary })
await userService.resetUserPassword(id)
assert.equal(categories.updateCategoriesSchema.safeParse({ icon: "" }).success, true)
assert.equal(brands.updateBrandSchema.safeParse({ logoUrl: "" }).success, true)
assert.equal(categories.updateCategoriesSchema.safeParse({ icon: "javascript:alert(1)" }).success, false)
assert.equal(brands.updateBrandSchema.safeParse({ logoUrl: "data:image/svg+xml,test" }).success, false)
const products = loadValidation("validations/products/products.validation.ts")
const common = loadValidation("validations/shared/common.validation.ts")
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
const heroValidation = loadValidation("validations/storefront/hero-slides.validation.ts")
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
const checkoutValidation = loadValidation("validations/orders/checkout.validation.ts")
const guestCheckoutApi = {
  async post(url, body, config) {
    assert.equal(url, "/storefront/checkout")
    assert.equal(config.withCredentials, false)
    checkoutValidation.checkoutSchema.parse(body)
    requests.push({ method: "POST", url, body })
    return { data: { data: { _id: id, orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 } } }
  },
}
const checkoutService = evaluate(path.join(root, "src/features/checkout/services/checkout.service.ts"), specifier => {
  if (specifier === "@/features/checkout/schemas/checkout-schema") return evaluate(path.join(root, "src/features/checkout/schemas/checkout-schema.ts"), dependency => {
    if (dependency === "zod") return require("zod")
    throw new Error(`Unsupported checkout schema import: ${dependency}`)
  })
  if (specifier === "@/services/api") return { authApi: guestCheckoutApi, api: {
    async post(url, body) {
      assert.equal(url, "/customer-auth/orders")
      checkoutValidation.checkoutSchema.parse(body)
      requests.push({ method: "POST", url, body })
      return { data: { data: { _id: id, orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 } } }
    },
  } }
  throw new Error(`Unsupported checkout service import: ${specifier}`)
})
await checkoutService.createCheckout({ requestId: webcrypto.randomUUID(), recipientName: "Nguyễn An", phone: "0901234567", addressVersion: 2, provinceCode: 1, wardCode: 3, street: "12 Đường A", note: "", paymentMethod: "cod", items: [{ productId: id, quantity: 2, expectedUnitPrice: 100000 }] })
const adminOrderAddress = evaluate(path.join(root, "src/features/orders/schemas/admin-order-schema.ts"), specifier => {
  if (specifier === "zod") return require("zod")
  throw new Error(`Unsupported order schema import: ${specifier}`)
}).adminOrderAddressSchema
const backendAddress = loadValidation("validations/shared/common.validation.ts").createAddressSchema()
for (const [field, limit] of [["street", 255], ["city", 50], ["state", 50]]) {
  for (const length of [0, limit, limit + 1]) {
    const value = { street: "Street", city: "City", state: "State", [field]: "x".repeat(length) }
    assert.equal(adminOrderAddress.safeParse(value).success, backendAddress.safeParse(value).success, `Order address boundary: ${field}/${length}`)
  }
}
const noteValidation = loadValidation("validations/orders/orders.validation.ts").updateOrderNoteSchema
noteValidation.parse({ orderNote: "Updated note", expectedOrderNote: "Original note" })
noteValidation.parse({ orderNote: "First note", expectedOrderNote: "" })
assert.equal(noteValidation.safeParse({ orderNote: "Unsafe update without baseline" }).success, false)
await checkoutService.createCheckout(requests.at(-1).body, true)
const cancelOrderValidation = loadValidation("validations/orders/customer-order-cancel.validation.ts")
const customerOrdersService = evaluate(path.join(root, "src/features/orders/services/customer-orders.service.ts"), specifier => {
  if (specifier === "@/services/api") return { api: {
    async patch(url, body) {
      assert.equal(url, `/customer-auth/orders/${id}/cancel`)
      cancelOrderValidation.cancelCustomerOrderSchema.parse(body)
      requests.push({ method: "PATCH", url, body })
      return { data: { data: { _id: id, orderStatus: 3, cancelledByCustomer: true } } }
    },
  } }
  throw new Error(`Unsupported customer order service import: ${specifier}`)
})
await customerOrdersService.cancelCustomerOrder({ id, cancellationReason: "Không còn nhu cầu" })
const postValidation = loadValidation("validations/articles/articles.validation.ts")
const categoryValidation = loadValidation("validations/articles/post-categories.validation.ts")
const editorialService = evaluate(path.join(root, "src/features/articles/services/articles.service.ts"), specifier => {
  if (specifier === "@/services/api") return { api: {
    async post(url, body) {
      if (url === "/articles") postValidation.createArticleSchema.parse(body)
      else { assert.equal(url, "/articles/category-options"); categoryValidation.createPostCategorySchema.parse(body) }
      requests.push({ method: "POST", url, body }); return { data: { data: { _id: id, __v: 0 } } }
    },
    async patch(url, body) {
      if (url === `/articles/${id}`) postValidation.updateArticleSchema.parse(body)
      else { assert.equal(url, `/articles/category-options/${id}`); categoryValidation.updatePostCategorySchema.parse(body) }
      requests.push({ method: "PATCH", url, body }); return { data: { data: { _id: id, __v: 1 } } }
    },
    async delete(url, config) {
      postValidation.articleVersionSchema.parse(config.data)
      requests.push({ method: "DELETE", url, body: config.data }); return { data: { data: { deleted: true } } }
    },
  } }
  throw new Error(`Unsupported articles service import: ${specifier}`)
})
await editorialService.createPostCategory({ name: "Guides", slug: "guides", description: "", isActive: true })
await editorialService.createArticle({ type: "news", title: "New guide", category: "Guides", categoryId: id, excerpt: "Summary", content: "Content", authorName: "Editor", imageUrl: null, tags: [], status: "draft", publishAt: null, isFeatured: true, sortOrder: 2, seo: { title: "", description: "" } })
await editorialService.updateArticle({ id, input: { expectedVersion: 0, isFeatured: false, sortOrder: 3 } })
await editorialService.updatePostCategory({ id, input: { expectedVersion: 0, isActive: false } })
await editorialService.deleteArticle({ id, expectedVersion: 1 })
await editorialService.deletePostCategory({ id, expectedVersion: 1 })
postValidation.publicArticleQuerySchema.parse({ type: "news", isFeatured: "true", sort: "display", page: "1", limit: "3" })
const newsValidation = loadValidation("validations/products/product-news.validation.ts")
const productNewsService = evaluate(path.join(root, "src/features/products/services/product-news.service.ts"), specifier => {
  if (specifier === "@/services/api") return { authApi: {}, api: { async patch(url, body) {
    assert.equal(url, `/products/${id}/news`)
    newsValidation.productNewsSchema.parse(body)
    requests.push({ method: "PATCH", url, body })
    return { data: { data: { articleIds: body.articleIds, expectedVersion: body.expectedVersion + 1 } } }
  } } }
  throw new Error(`Unsupported product news import: ${specifier}`)
})
await productNewsService.updateProductNews({ id, input: { articleIds: [id], expectedVersion: 2 } })
await productNewsService.updateProductNews({ id, input: { articleIds: [], expectedVersion: 3 } })
const supportValidation = loadValidation("validations/support/support.validation.ts")
const supportService = evaluate(path.join(root, "src/features/support/services/support.service.ts"), specifier => {
  if (specifier === "@/services/api") return { api: {
    async put(url, body) {
      assert.equal(url, "/support/admin/policy")
      supportValidation.savePolicySchema.parse(body)
      requests.push({ method: "PUT", url, body }); return { data: { data: { __v: 1, content: body.content } } }
    },
    async post(url, body) {
      assert.equal(url, "/support/customer/requests")
      supportValidation.createWarrantySchema.parse(body)
      requests.push({ method: "POST", url, body }); return { data: { data: { _id: id } } }
    },
    async patch(url, body) {
      assert.equal(url, `/support/admin/requests/${id}`)
      supportValidation.updateWarrantySchema.parse(body)
      requests.push({ method: "PATCH", url, body }); return { data: { data: { _id: id } } }
    },
    async get(url, config) {
      assert.ok(["/support/customer/eligible-orders", "/support/customer/requests", "/support/admin/requests"].includes(url))
      if (url === "/support/customer/eligible-orders") supportValidation.eligibleWarrantyOrdersSchema.parse(config.params)
      else supportValidation.supportListSchema.parse(config.params)
      requests.push({ method: "GET", url, query: config.params }); return { data: { data: [], pagination: {} } }
    },
  } }
  throw new Error(`Unsupported support service import: ${specifier}`)
})
const policyContent = { warranty: "Warranty terms", returns: "Returns", shipping: "Shipping", payment: "COD", support: "Contact", privacy: "Privacy terms" }
await supportService.savePolicy({ content: policyContent, publish: true, expectedVersion: 0 })
await supportService.createWarranty({ requestId: webcrypto.randomUUID(), orderId: id, itemIndex: 0, description: "Product will not turn on" })
await supportService.updateWarranty({ id, expectedVersion: 0, status: "reviewing", note: "Received for inspection" })
await supportService.eligibleOrders(1)
await supportService.eligibleOrders(1, undefined, id)
await supportService.listWarranties(false, 1, "")
await supportService.listWarranties(true, 2, "reviewing")
const informationValidation = loadValidation("validations/support/information.validation.ts")
const informationService = evaluate(path.join(root, "src/features/support/services/information.service.ts"), specifier => {
  if (specifier === "@/services/api") return { api: {
    async put(url, body) {
      informationValidation.informationParams.parse({ slug: url.split("/").at(-1) })
      informationValidation.saveInformationSchema.parse(body)
      requests.push({ method: "PUT", url, body })
      return { data: { data: { content: body.content, __v: body.expectedVersion + 1, publishedAt: null } } }
    },
    async get(url) {
      informationValidation.informationParams.parse({ slug: url.split("/").at(-1) })
      requests.push({ method: "GET", url })
      return { data: { data: null } }
    },
  } }
  throw new Error(`Unsupported information service import: ${specifier}`)
})
for (const slug of ["gioi-thieu", "dieu-khoan-su-dung", "cau-hoi-thuong-gap"]) {
  await informationService.getInformation(slug)
  await informationService.getAdminInformation(slug)
  await informationService.saveInformation({ slug, content: "<h2>Title</h2><p>Content</p>", expectedVersion: 2, publish: true })
}
const managedValidation = loadValidation("validations/support/managed-document.validation.ts")
const managedService = evaluate(path.join(root, "src/features/support/services/managed-document.service.ts"), specifier => {
  if (specifier === "@/services/api") {
    const check = (url, method, body) => {
      const parts = url.split("/")
      const key = parts.at(-1) === "views" ? parts.at(-2) : parts.at(-1)
      if (url !== "/support/admin/documents") managedValidation.documentParams.parse({ key })
      if (method === "PUT") managedValidation.documentInput.parse(body)
      if (method === "DELETE") managedValidation.documentVersion.parse(body)
      requests.push({ method, url, body })
      return { data: { data: method === "POST" ? { views: 1 } : null } }
    }
    return { api: { get: async url => check(url, "GET"), put: async (url, body) => check(url, "PUT", body), delete: async (url, options) => check(url, "DELETE", options.data), post: async url => check(url, "POST") } }
  }
  throw new Error(`Unsupported managed document import: ${specifier}`)
})
await managedService.listDocuments()
for (const key of managedValidation.documentKeys) {
  await managedService.getDocument(key)
  await managedService.getPublicDocument(key)
  await managedService.saveDocument({ key, content: "<p>Content</p>", expectedVersion: 2, publish: true })
  await managedService.deleteDocument({ key, expectedVersion: 3 })
  await managedService.recordDocumentView(key)
}
const assigneesService = evaluate(path.join(root, "src/features/orders/services/order-assignees.service.ts"), specifier => {
  if (specifier === "@/services/api") return { api: { async get(url, config) {
    assert.equal(url, "/orders/assignees")
    loadValidation("validations/orders/orders.validation.ts").orderAssigneesQuerySchema.parse(config.params)
    requests.push({ method: "GET", url, query: config.params })
    return { data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } }
  } } }
  throw new Error(`Unsupported order assignees import: ${specifier}`)
})
await assigneesService.getOrderAssignees(1, "")
await assigneesService.getOrderAssignees(2, " Nguyen ")
console.log(`Backend schema contract checks passed: ${requests.length} service requests validated; no HTTP or database connections.`)
