import axios from "axios"
import { z } from "zod"
import { api } from "@/services/api"
import type { StoreProduct } from "../catalog"

// Public requests must never attach or refresh an admin session.
export const storefrontApi = axios.create({ baseURL: api.defaults.baseURL, timeout: 15_000, withCredentials: false })
const reference = z.object({ id: z.string().min(1), name: z.string(), slug: z.string() })
const productSchema = z.object({
  id: z.string().min(1), slug: z.string().min(1), name: z.string().min(1),
  description: z.string(), modelYear: z.number(), category: reference, brand: reference,
  price: z.number().finite().nonnegative(), compareAtPrice: z.number().finite().nonnegative(),
  available: z.boolean(), thumbnail: z.string().nullable(), images: z.array(z.string()),
  variants: z.array(z.object({
    id: z.string().min(1), sku: z.string(), name: z.string(), color: z.string().nullable(), size: z.string().nullable(),
    price: z.number().finite().nonnegative(), compareAtPrice: z.number().finite().nonnegative(),
    available: z.boolean(), image: z.string().nullable(), images: z.array(z.string()),
  })),
})

function imageUrl(value: string | null): string | undefined {
  if (!value) return undefined
  try {
    const base = new URL(storefrontApi.defaults.baseURL || "http://localhost:5000/api/v1", window.location.origin)
    const url = new URL(value, base.origin)
    return /^https?:$/.test(url.protocol) ? url.href : undefined
  } catch { return undefined }
}

export async function getStorefrontProduct(slug: string, signal?: AbortSignal): Promise<StoreProduct> {
  const response = await storefrontApi.get<unknown>(`/storefront/products/${encodeURIComponent(slug)}`, { signal }).catch((error: unknown) => {
    // Express' unmatched-route 404 is different from a missing published product.
    if (axios.isAxiosError<{ message?: string }>(error) && error.response?.status === 404 && error.response.data?.message === "Not Found") {
      throw new Error("The product service is currently unavailable.")
    }
    throw error
  })
  const { data } = z.object({ success: z.literal(true), data: productSchema }).parse(response.data)
  return mapProduct(data)
}

function mapProduct(data: z.infer<typeof productSchema>): StoreProduct {
  const images = [...new Set([data.thumbnail, ...data.images, ...data.variants.flatMap(variant => [variant.image, ...variant.images])].flatMap(value => imageUrl(value) ?? []))]
  const fallback = "/storefront/product-placeholder.svg"
  return {
    source: "api", id: data.id, slug: data.slug, name: data.name, description: data.description,
    category: data.category.name, categorySlug: data.category.slug, brand: data.brand.name, modelYear: data.modelYear,
    price: data.price, originalPrice: data.compareAtPrice, available: data.available,
    image: images[0] ?? fallback, images: images.length ? images : [fallback], rating: 0,
    options: data.variants.map(variant => ({
      images: [...new Set([variant.image, ...variant.images].flatMap(value => imageUrl(value) ?? []))],
      id: variant.id, sku: variant.sku, name: variant.name, color: variant.color ?? "transparent",
      price: variant.price, compareAtPrice: variant.compareAtPrice, available: variant.available, image: imageUrl(variant.image) ?? imageUrl(variant.images[0] ?? null) ?? images[0] ?? fallback,
    })),
  }
}

export async function getStorefrontRecommendations(slug: string, signal?: AbortSignal): Promise<StoreProduct[]> {
  const response = await storefrontApi.get<unknown>(`/storefront/products/${encodeURIComponent(slug)}/recommendations`, { signal })
  const { data } = z.object({ success: z.literal(true), data: z.array(productSchema) }).parse(response.data)
  return data.map(mapProduct)
}
