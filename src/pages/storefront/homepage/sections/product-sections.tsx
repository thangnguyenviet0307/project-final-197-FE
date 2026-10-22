import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { HomeProductCard } from "../components/home-product-card"
import { featuredGroups, productLists, trendingGroups } from "../data"

export function FeaturedSection() {
  const [active, setActive] = useState(0)
  return <section className="am-featured"><div className="sf-container"><div className="am-section-heading"><h2>FEATURED PARTS</h2><div className="am-product-tabs" role="group" aria-label="Featured products">{featuredGroups.map((group, index) => <button key={group.label} className={index === active ? "active" : ""} aria-pressed={index === active} onClick={() => setActive(index)}>{group.label}</button>)}</div></div><div className="am-featured-grid">{featuredGroups[active].items.map(product => <HomeProductCard key={product.slug} product={product} />)}</div></div></section>
}
export function TrendingSection() {
  const [active, setActive] = useState(0)
  return <section className="sf-container am-trending"><div className="am-section-heading"><h2>TRENDING</h2><div className="am-product-tabs" role="group" aria-label="Trending products">{trendingGroups.map((group, index) => <button key={group.label} className={index === active ? "active" : ""} aria-pressed={index === active} onClick={() => setActive(index)}>{group.label}</button>)}</div><div className="am-carousel-controls"><button aria-label="Previous trending collection" onClick={() => setActive((active + 2) % 3)}><ChevronLeft size={17} /></button><button aria-label="Next trending collection" onClick={() => setActive((active + 1) % 3)}><ChevronRight size={17} /></button></div></div><div className="am-trending-grid">{trendingGroups[active].items.map(product => <HomeProductCard key={product.slug} product={product} />)}</div></section>
}
export function ProductLists() {
  return <section className="sf-container am-product-lists">{productLists.map(group => <div key={group.title}><h2>{group.title}</h2>{group.items.map(product => <HomeProductCard key={product.slug} product={product} compact />)}</div>)}</section>
}
