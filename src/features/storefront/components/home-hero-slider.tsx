import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const slides = [
  {
    eyebrow: "Thiết bị cho ngày mới",
    title: "Công nghệ hay,\ntrải nghiệm khác.",
    description: "Chọn những thiết bị đồng hành cùng bạn trong công việc và những phút giây thư giãn.",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1800&q=85",
    action: "Khám phá cửa hàng",
    category: "Điện thoại",
  },
  {
    eyebrow: "Âm thanh theo cách bạn muốn",
    title: "Nghe rõ từng nhịp,\nở bất cứ đâu.",
    description: "Tai nghe và loa không dây cho những bản nhạc luôn ở bên bạn.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1800&q=85",
    action: "Khám phá âm thanh",
    category: "Âm thanh",
  },
  {
    eyebrow: "Lưu lại điều đáng nhớ",
    title: "Khoảnh khắc đẹp,\ntrong tầm tay.",
    description: "Tìm thiết bị chụp ảnh phù hợp cho chuyến đi và những câu chuyện của bạn.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=85",
    action: "Xem máy ảnh",
    category: "Máy ảnh",
  },
]

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
        <div className="mx-auto flex min-h-[420px] max-w-7xl items-center px-5 py-12 sm:min-h-[500px] sm:px-8 lg:px-12">
          <div key={activeSlide} className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c5ee80]">{slide.eyebrow}</p>
            <h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
              {slide.title}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 sm:text-base">{slide.description}</p>
            <Link
              to={`/shop?category=${encodeURIComponent(slide.category)}`}
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
              key={item.eyebrow}
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
