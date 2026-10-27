import { ArrowUpRight } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import type { StorefrontProduct } from "@/features/storefront/types/storefront"
import { formatStorePrice } from "@/features/storefront/utils/format-price"
import { ProductImage } from "@/features/products/components/product-image"

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const location = useLocation()
  const linkState = { returnTo: location.pathname === "/shop" ? location.pathname + location.search : "/shop" }
  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-xl">
      <Link
        to={`/shop/${encodeURIComponent(product.slug)}`}
        state={linkState}
        className="relative block overflow-hidden bg-[#f4f5f2]"
        aria-label={`Xem ${product.name}`}
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
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
      <div className="space-y-2 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
          {product.brand} <span className="px-1 text-gray-300">/</span> {product.category}
        </p>
        <Link
          to={`/shop/${encodeURIComponent(product.slug)}`}
          state={linkState}
          className="line-clamp-2 min-h-12 font-semibold leading-6 text-gray-900 hover:text-[#4d9210]"
        >
          {product.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1">
          <span>
            <span className="block text-[10px] font-medium text-gray-400">Giá bán</span>
            <span className="font-bold text-gray-950">{formatStorePrice(product.price)}</span>
          </span>
          {product.cashPrice !== undefined && (
            <span>
              <span className="block text-[10px] font-medium text-gray-400">Giá CK</span>
              <span className="text-sm font-semibold text-[#4d9210]">{formatStorePrice(product.cashPrice)}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
