import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"

export function CollectionGallery() {
  const collections = [
    {
      name: "Bộ sưu tập máy ảnh",
      subtitle: "Thiết bị lưu giữ khoảnh khắc",
      category: "Máy ảnh",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
    },
    {
      name: "Bộ sưu tập âm thanh",
      subtitle: "Âm nhạc luôn ở bên bạn",
      category: "Âm thanh",
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=85",
    },
  ]

  return (
    <section id="bo-suu-tap" className="mx-auto max-w-7xl px-4 py-7 sm:py-10">
      <div className="grid gap-5 md:grid-cols-2">
          {collections.map((collection) => (
            <Link
              key={collection.name}
              to={`/shop?category=${encodeURIComponent(collection.category)}`}
              className="group relative min-h-52 overflow-hidden bg-gray-900 sm:min-h-64"
            >
              <img src={collection.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-85" />
              <span className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
              <span className="absolute inset-y-0 left-0 flex max-w-[80%] items-center justify-between gap-5 p-6 text-white sm:p-8">
                <span>
                  <span className="block text-xl font-bold sm:text-2xl">{collection.name}</span>
                  <span className="mt-2 block text-sm text-white/75">{collection.subtitle}</span>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider">Khám phá <ArrowUpRight size={15} /></span>
                </span>
              </span>
            </Link>
          ))}
      </div>
    </section>
  )
}
