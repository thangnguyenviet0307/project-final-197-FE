import { catalogName, type Product } from "@/features/products/types/products"
import { discountedPrice } from "@/features/products/utils/product-price"
import type { StorefrontProduct } from "@/features/storefront/types/storefront"

export function mapCatalogProduct(product: Product): StorefrontProduct {
  const price = product.variants?.length ? Math.min(...product.variants.map(variant => variant.price)) : product.price ?? 0
  const gallery = [...new Set([product.thumbnail, ...(product.images ?? []).map(image => image.secure_url), ...(product.sourceImages ?? []), ...(product.variants ?? []).flatMap(variant => [variant.image, ...(variant.images ?? [])])].filter((url): url is string => !!url))]
  const discount = product.discount ?? 0
  return {
    id: product._id, slug: product.slug ?? "", name: product.product_name,
    category: catalogName(product.category), brand: catalogName(product.brand),
    price: discountedPrice(price, product.discount) ?? 0,
    image: gallery[0] ?? "", gallery, ...(discount > 0 ? { badge: `Giảm ${discount}%` } : {}), description: product.description ?? "", features: [],
    variants: (product.variants?.length ? product.variants : [{ sku: product.sku ?? "", variant_name: "Tiêu chuẩn", price: product.price ?? 0, stock: product.stock }]).map(variant => ({
      name: variant.variant_name || variant.sku, color: "#6b7280", image: variant.image || gallery[0] || "", stock: variant.stock,
    })),
  }
}
