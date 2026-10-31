import { catalogName, type Product } from "@/features/products/types/products"
import { discountedPrice } from "@/features/products/utils/product-price"
import type { StorefrontProduct } from "@/features/storefront/types/storefront"

export type ProductBadgeContext = "catalog" | "is_home" | "is_new" | "is_hot" | "is_best_seller"
export function mapCatalogProduct(product: Product, context: ProductBadgeContext = "catalog"): StorefrontProduct {
  const price = product.variants?.length ? Math.min(...product.variants.map(variant => variant.price)) : product.price ?? 0
  const gallery = [...new Set([product.thumbnail, ...(product.images ?? []).map(image => image.secure_url), ...(product.sourceImages ?? []), ...(product.variants ?? []).flatMap(variant => [variant.image, ...(variant.images ?? [])])].filter((url): url is string => !!url))]
  return {
    id: product._id, slug: product.slug ?? "", name: product.product_name,
    category: catalogName(product.category), brand: catalogName(product.brand),
    price: discountedPrice(price, product.discount) ?? 0,
    originalPrice: price, discount: product.discount ?? 0,
    visible: product.on_sale !== false,
    badges: [
      ...(product.on_sale === false ? [] : [
        ...(product.is_best_seller && (context === "catalog" || context === "is_best_seller") ? [{ label: "Bán chạy", className: "bg-amber-400 text-amber-950" }] : []),
        ...(product.is_new && (context === "catalog" || context === "is_new") ? [{ label: "Mới", className: "bg-blue-600 text-white" }] : []),
        ...(product.is_hot && (context === "catalog" || context === "is_hot") ? [{ label: "Nổi bật", className: "bg-rose-600 text-white" }] : []),
        ...(product.is_home && context === "is_home" ? [{ label: "Trang chủ", className: "bg-violet-600 text-white" }] : []),
      ]),
    ],
    image: gallery[0] ?? "", gallery, description: product.description ?? "", features: [],
    variants: (product.variants?.length ? product.variants : [{ sku: product.sku ?? "", variant_name: "Tiêu chuẩn", price: product.price ?? 0, stock: product.stock }]).map(variant => ({
      name: variant.variant_name || variant.sku, color: "#6b7280", image: variant.image || gallery[0] || "", stock: variant.stock,
    })),
  }
}
