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
  "validations/categories.validation.ts",
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
await customerService.createCustomer({ first_name: "An", last_name: "Nguyen", email: customer.email, phone: customer.phone, ...customer.address })
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
console.log(`Backend schema contract checks passed: ${requests.length} service requests validated; no HTTP or database connections.`)
