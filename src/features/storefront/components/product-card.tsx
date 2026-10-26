import { ArrowUpRight, Star } from "lucide-react"
import { Link } from "react-router-dom"
import type { StorefrontProduct } from "@/features/storefront/types/storefront"
import { formatStorePrice } from "@/features/storefront/utils/format-price"

export function ProductCard({ product }: { product: StorefrontProduct }) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-xl">
      <Link
        to={`/shop/${product.slug}`}
        className="relative block overflow-hidden bg-[#f4f5f2]"
        aria-label={`Xem ${product.name}`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
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
          to={`/shop/${product.slug}`}
          className="line-clamp-2 min-h-12 font-semibold leading-6 text-gray-900 hover:text-[#4d9210]"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 text-xs text-amber-500">
          <Star size={14} fill="currentColor" />
          <span className="font-semibold">{product.rating.toFixed(1)}</span>
          <span className="text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-2 pt-1">
          <span className="font-bold text-gray-950">{formatStorePrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatStorePrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
