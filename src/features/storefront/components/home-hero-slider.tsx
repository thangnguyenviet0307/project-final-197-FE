 import { useEffect, useState } from "react"
 import { ArrowLeft, ArrowRight } from "lucide-react"
 import { Link } from "react-router-dom"
 import { storefrontCategories } from "@/features/storefront/data/products"

 const slides = storefrontCategories.map((category) => ({
   ...category,
   eyebrow: "Khám phá danh mục",
   title: `${category.name},\nđúng nhu cầu mỗi ngày.`,
   action: `Khám phá ${category.name}`,
 }))

export function HomeHeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = slides[activeSlide]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [])

  function showSlide(offset: number) {
    setActiveSlide((current) => (current + offset + slides.length) % slides.length)
  }

  return (
    <section aria-label="Sản phẩm và bộ sưu tập nổi bật" className="pt-0">
      <div className="relative isolate min-h-[420px] overflow-hidden bg-[#1e271b] sm:min-h-[500px]">
        {slides.map((item, index) => (
          <img
            key={item.image}
            src={item.image}
            alt=""
            fetchPriority={index === activeSlide ? "high" : "auto"}
            aria-hidden="true"
            className={`absolute inset-0 -z-20 size-full object-cover transition-opacity duration-700 ${index === activeSlide ? "opacity-55" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#12170f]/95 via-[#12170f]/75 to-[#12170f]/10" />
        <div className="store-container flex min-h-[420px] items-center py-12 sm:min-h-[500px]">
          <div key={activeSlide} className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c5ee80]">{slide.eyebrow}</p>
            <h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
              {slide.title}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 sm:text-base">{slide.description}</p>
            <Link
              to={`/shop?category=${encodeURIComponent(slide.name)}`}
              className="mt-7 inline-flex h-12 items-center gap-3 rounded-lg bg-[#69ad27] px-6 text-sm font-bold text-white transition hover:bg-[#57951f]"
            >
              {slide.action}<ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <div className="absolute bottom-5 right-5 flex items-center gap-2 sm:bottom-8 sm:right-8">
          <span className="mr-2 text-xs font-medium tabular-nums text-white/80">{String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => showSlide(-1)} aria-label="Banner trước" className="flex size-10 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white hover:text-gray-950">
            <ArrowLeft size={17} />
          </button>
          <button type="button" onClick={() => showSlide(1)} aria-label="Banner tiếp theo" className="flex size-10 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white hover:text-gray-950">
            <ArrowRight size={17} />
          </button>
        </div>
        <div className="absolute bottom-8 left-6 hidden gap-2 sm:left-12 sm:flex lg:left-16">
          {slides.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Chuyển đến banner ${index + 1}`}
              aria-pressed={activeSlide === index}
              onClick={() => setActiveSlide(index)}
              className={`h-1.5 rounded-full transition-all ${activeSlide === index ? "w-9 bg-[#c5ee80]" : "w-4 bg-white/50 hover:bg-white"}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
