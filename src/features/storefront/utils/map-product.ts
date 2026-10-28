import type { Product } from "@/features/products/types/products"
import type { StorefrontProduct } from "@/features/storefront/types/storefront"
import { sourceProductDetails } from "@/features/storefront/data/source-product-details"
import { sourceProductListings } from "@/features/storefront/data/source-product-listings"

function catalogName(value: Product["category"]): string {
  return typeof value === "string" ? value : value?.name ?? "Phụ kiện"
}

export function mapProductToStorefront(product: Product): StorefrontProduct {
  const sourcedImage = sourceProductDetails.find((item) => item.slug === product.slug)?.image
    || sourceProductListings.find((item) => item.slug === product.slug)?.image
  const image = sourcedImage
    || product.thumbnail
    || product.variants?.find((variant) => variant.image)?.image
    || product.images?.[0]?.secure_url
    || ""
  const gallery = [...new Set([
    ...(sourcedImage ? [sourcedImage] : []),
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...(product.images?.map((item) => item.secure_url) ?? []),
    ...(product.variants?.flatMap((variant) => variant.images ?? []) ?? []),
    ...(product.variants?.map((variant) => variant.image).filter((item): item is string => Boolean(item)) ?? []),
  ])]
  const discount = product.discount ?? 0
  const price = product.price ?? product.variants?.[0]?.price ?? 0

  return {
    id: product._id,
    slug: product.slug ?? product._id,
    name: product.product_name,
    category: catalogName(product.category),
    brand: catalogName(product.brand),
    price,
    ...(discount > 0 ? { cashPrice: Math.round(price * (100 - discount)) / 100 } : {}),
    image,
    gallery,
    ...(discount > 0 ? { badge: `Giảm ${discount}%` } : {}),
    description: product.description ?? `${product.product_name} – xem thông tin sản phẩm tại cửa hàng.`,
    features: [],
    variants: (product.variants ?? []).map((variant) => ({
      name: variant.variant_name || variant.color || variant.size || "Mẫu tiêu chuẩn",
      color: variant.color && /^#[\da-f]{3,8}$/i.test(variant.color) ? variant.color : "#6b7280",
      image: variant.image || variant.images?.[0] || image,
      stock: variant.stock,
    })),
  }
}
