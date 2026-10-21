import { afterEach, expect, it } from "vitest"
import { AxiosHeaders } from "axios"
import { api } from "@/services/api"
import { categorySchema, createCategory, updateCategory } from "@/features/categories/services/categories.service"

const originalAdapter = api.defaults.adapter
afterEach(() => { api.defaults.adapter = originalAdapter })

it("preserves an omitted thumbnail and sends an explicit clear or trimmed URL", async () => {
  const payloads: Record<string, unknown>[] = []
  api.defaults.adapter = async config => {
    payloads.push(JSON.parse(config.data))
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: { _id: "category" } } }
  }
  await createCategory({ name: "Phones" })
  await updateCategory({ id: "category", input: { name: "New name" } })
  await updateCategory({ id: "category", input: { icon: "" } })
  await createCategory({ name: "Phones", icon: " https://example.com/icon.png " })
  await updateCategory({ id: "category", input: { icon: " https://example.com/new.png " } })
  expect(payloads[0]).not.toHaveProperty("icon")
  expect(payloads[1]).not.toHaveProperty("icon")
  expect(payloads[2]).toEqual({ icon: "" })
  expect(payloads[3].icon).toBe("https://example.com/icon.png")
  expect(payloads[4]).toEqual({ icon: "https://example.com/new.png" })
})

it("validates category thumbnails with the shared image URL rules", () => {
  for (const icon of ["ftp://example.com/icon.png", "invalid-url"]) {
    const result = categorySchema.safeParse({ name: "Phones", icon })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe("Enter a valid HTTP or HTTPS image URL.")
  }
  const result = categorySchema.safeParse({ name: "Phones", icon: `https://example.com/${"a".repeat(255)}` })
  expect(result.success).toBe(false)
  if (!result.success) expect(result.error.issues[0].message).toBe("Image URL cannot exceed 255 characters.")
  expect(categorySchema.safeParse({ name: "Phones", icon: "" }).success).toBe(true)
})
