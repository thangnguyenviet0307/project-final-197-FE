import { Fragment, useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { usePublicHeroSlides } from "@/features/hero-slides/hooks/use-hero-slides"
import type { PublicHeroSlide } from "@/features/hero-slides/types/hero-slides"

function HeroSlides({ slides }: { slides: PublicHeroSlide[] }) {
  const [activeId, setActiveId] = useState(slides[0]._id)
  const activeSlide = Math.max(0, slides.findIndex(item => item._id === activeId))
  useEffect(() => {
    if (slides.length < 2) return
    const timer = window.setInterval(() => {
      setActiveId(current => slides[(slides.findIndex(item => item._id === current) + 1) % slides.length]._id)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [slides])
  return <section aria-label="Sản phẩm và bộ sưu tập nổi bật">
    <div className="relative isolate min-h-[420px] overflow-hidden bg-[#1e271b] sm:min-h-[500px]">
      {slides.map((item, index) => (item.imageUrl || item.category.icon) && <img key={item._id} src={item.imageUrl || item.category.icon} alt="" fetchPriority={index === activeSlide ? "high" : "auto"} aria-hidden="true" className={`absolute inset-0 -z-20 size-full object-cover transition-opacity duration-700 ${index === activeSlide ? "opacity-55" : "opacity-0"}`} />)}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#12170f]/95 via-[#12170f]/75 to-[#12170f]/10" />
      <div className="store-container flex min-h-[420px] items-center pt-12 pb-24 sm:min-h-[500px]">
        <div className="grid w-full max-w-2xl grid-cols-1 grid-rows-[auto_auto_auto_auto]">
          <p className="col-start-1 row-start-1 text-xs font-bold uppercase tracking-[0.22em] text-[#c5ee80]">Khám phá danh mục</p>
          {slides.map((item, index) => {
            const hidden = index !== activeSlide
            return <Fragment key={item._id}>
              <h1 aria-hidden={hidden} style={{ visibility: hidden ? "hidden" : "visible" }} className="col-start-1 row-start-2 mt-5 whitespace-pre-line break-words text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">{item.title}</h1>
              <p aria-hidden={hidden} style={{ visibility: hidden ? "hidden" : "visible" }} className="col-start-1 row-start-3 mt-5 min-h-7 max-w-lg whitespace-pre-line break-words text-sm leading-7 text-white/75 sm:text-base">{item.description}</p>
              <Link inert={hidden} aria-hidden={hidden} tabIndex={hidden ? -1 : undefined} style={{ visibility: hidden ? "hidden" : "visible" }} to={`/shop?category=${encodeURIComponent(item.category._id)}`} className="col-start-1 row-start-4 mt-7 inline-flex min-h-12 max-w-full items-center justify-self-start gap-3 rounded-lg bg-[#69ad27] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#57951f]">Khám phá {item.category.name}<ArrowRight size={17} className="shrink-0" /></Link>
            </Fragment>
          })}
        </div>
      </div>
      {slides.length > 1 && <div className="absolute inset-x-0 bottom-6 sm:bottom-8"><div className="store-container flex flex-wrap items-center gap-2">
        {slides.map((item, index) => <button key={item._id} type="button" aria-label={`Chuyển đến banner ${index + 1}`} aria-pressed={activeSlide === index} onClick={() => setActiveId(item._id)} className={`h-1.5 rounded-full transition-all ${activeSlide === index ? "w-9 bg-[#c5ee80]" : "w-4 bg-white/50 hover:bg-white"}`} />)}
      </div></div>}
    </div>
  </section>
}
function WelcomeHero() {
  return <section aria-label="Khám phá cửa hàng" className="relative isolate overflow-hidden bg-[#1e271b]">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#121b10] via-[#24391d] to-[#3e5b27]" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 -z-10 size-[460px] -translate-y-1/2 rounded-full border border-lime-200/15 bg-lime-200/5 sm:right-[8%] sm:size-[560px]">
      <div className="absolute inset-12 rounded-full border border-lime-200/15" />
      <div className="absolute inset-24 rounded-full border border-lime-200/20 bg-lime-200/5" />
      <div className="absolute inset-40 rounded-full bg-lime-200/10" />
    </div>
    <div className="store-container flex min-h-[420px] items-center py-12 sm:min-h-[500px] sm:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c5ee80]">Chào mừng đến cửa hàng</p>
        <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">Khám phá sản phẩm<br />cho nhu cầu của bạn.</h1>
        <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 sm:text-base">Tìm sản phẩm phù hợp, tham khảo thông tin chi tiết và khám phá các danh mục trong cửa hàng.</p>
        <Link to="/shop" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#69ad27] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#57951f]">Khám phá sản phẩm<ArrowRight size={17} className="shrink-0" /></Link>
      </div>
    </div>
  </section>
}
export function HomeHeroSlider() {
  const query = usePublicHeroSlides()
  if (query.isPending) return <div role="status" className="grid min-h-[420px] place-items-center bg-[#1e271b] text-white sm:min-h-[500px]">Đang tải banner…</div>
  if (query.isError) return <div role="alert" className="grid min-h-[420px] content-center justify-items-center gap-3 bg-[#1e271b] text-white sm:min-h-[500px]"><p>Không thể tải banner.</p><button type="button" onClick={() => void query.refetch()}>Thử lại</button></div>
  return query.data.length ? <HeroSlides slides={query.data} /> : <WelcomeHero />
}
