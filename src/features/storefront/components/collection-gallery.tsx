import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { storefrontCategories } from "@/features/storefront/data/products"

export function CollectionGallery() {
  return (
    <section id="bo-suu-tap" className="store-container py-7 sm:py-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storefrontCategories.map((collection) => (
            <Link
              key={collection.name}
              to={`/shop?category=${encodeURIComponent(collection.name)}`}
              className="group relative min-h-48 overflow-hidden bg-gray-900 sm:min-h-56"
            >
              <img src={collection.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-85" />
              <span className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
              <span className="absolute inset-y-0 left-0 flex max-w-[80%] items-center justify-between gap-5 p-6 text-white sm:p-8">
                <span>
                  <span className="block text-xl font-bold sm:text-2xl">Bộ sưu tập {collection.name}</span>
                  <span className="mt-2 block text-sm text-white/75">{collection.caption}</span>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider">Khám phá <ArrowUpRight size={15} /></span>
                </span>
              </span>
            </Link>
          ))}
      </div>
    </section>
  )
}
