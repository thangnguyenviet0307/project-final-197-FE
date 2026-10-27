import { ArrowUpRight } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import type { StorefrontProduct } from "@/features/storefront/types/storefront"
import { formatStorePrice } from "@/features/storefront/utils/format-price"
import { ProductImage } from "@/features/products/components/product-image"

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const location = useLocation()
  const linkState = { returnTo: location.pathname === "/shop" ? location.pathname + location.search : "/shop" }
  return (
    <article className="product-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-300 hover:border-gray-200 hover:shadow-xl">
      <Link
        to={`/shop/${encodeURIComponent(product.slug)}`}
        state={linkState}
        className="product-card-media relative block aspect-[4/3] shrink-0 overflow-hidden bg-[#f4f5f2]"
        aria-label={`Xem ${product.name}`}
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[#e9f5e0] px-3 py-1 text-xs font-semibold text-[#397a16]">
            {product.badge}
          </span>
        )}
        <span className="absolute bottom-3 right-3 flex size-9 translate-y-2 items-center justify-center rounded-full bg-white text-gray-900 opacity-0 shadow transition group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={17} />
        </span>
      </Link>
      <div className="product-card-content flex min-h-0 flex-1 flex-col gap-2 p-4 sm:p-5">
        <p className="product-card-meta line-clamp-2 break-words h-8 shrink-0 text-xs font-semibold uppercase leading-4 tracking-[0.15em] text-gray-400">
          {product.brand} <span className="px-1 text-gray-300">/</span> {product.category}
        </p>
        <Link
          to={`/shop/${encodeURIComponent(product.slug)}`}
          state={linkState}
          className="product-card-title line-clamp-2 break-words h-12 shrink-0 font-semibold leading-6 text-gray-900 hover:text-[#4d9210]"
        >
          {product.name}
        </Link>
        <div className="product-card-prices *:whitespace-nowrap mt-auto flex min-h-14 shrink-0 flex-wrap content-start items-baseline gap-x-2 gap-y-1 pt-1">
          <span className="font-bold text-[#397a16]" aria-label="Giá bán">{formatStorePrice(product.price)}</span>
          {!!product.discount && product.originalPrice !== undefined && product.originalPrice > product.price && <>
            <del className="text-xs text-gray-400" aria-label="Giá gốc">{formatStorePrice(product.originalPrice)}</del>
            <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">-{product.discount}%</span>
          </>}
        </div>
      </div>
    </article>
  )
}
