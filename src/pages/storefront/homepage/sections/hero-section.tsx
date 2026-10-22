import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { categoryUrl } from "@/features/storefront/catalog"
import { asset, slides } from "../data"

export function HeroSection() {
  const [active, setActive] = useState(0)
  const slide = slides[active]
  return (
    <section className="am-hero-background" aria-label="Featured collections">
      <div className="sf-container am-hero-container">
        <div className="am-slider">
          <div className="am-slide">
            <img src={asset(slide.image)} alt={`${slide.label} collection`} fetchPriority="high" />
            <div className="am-slide-copy">
              <h1>{slide.title}<strong>{slide.accent}</strong></h1>
              <p>Get <b>20%</b> off your oder today</p>
              <Link to={categoryUrl(slide.category)}>SHOP NOW</Link>
            </div>
            <button className="am-slide-prev" aria-label="Previous banner" onClick={() => setActive((active + slides.length - 1) % slides.length)}><ChevronLeft size={22} /></button>
            <button className="am-slide-next" aria-label="Next banner" onClick={() => setActive((active + 1) % slides.length)}><ChevronRight size={22} /></button>
          </div>
          <div className="am-slide-tabs" role="group" aria-label="Banner collections">
            {slides.map((item, index) => <button key={item.label} aria-pressed={index === active} className={index === active ? "active" : ""} onClick={() => setActive(index)}>{item.label}</button>)}
          </div>
        </div>
      </div>
    </section>
  )
}
