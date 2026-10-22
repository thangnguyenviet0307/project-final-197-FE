import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { products, money } from "@/features/storefront/catalog"

// Fixed demo deadline: reloading the page must not restart an offer.
const dealDeadline = Date.UTC(2026, 11, 31, 23, 59, 59)
export function DealSection() {
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer) }, [])
  const remaining = Math.max(0, Math.floor((dealDeadline - now) / 1000))
  const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60]
  const product = products.find(item => item.slug === "black-silence")!
  return <section className="am-deal"><div className="sf-container am-deal-inner"><div className="am-deal-copy"><h2>DEALS OF THE DAYS</h2><h3><Link to={`/shop/${product.slug}`}>{product.name}</Link></h3><strong className="am-deal-price">{money(product.price)}</strong><p>{remaining ? "Hurry up ! DEAL END IN :" : "This demo offer has ended"}</p><div className="am-countdown" aria-label="Demo offer countdown">{values.map((value, index) => <div key={index}><strong>{String(value).padStart(2, "0")}</strong><span>{["Days", "Hours", "Mins", "Secs"][index]}</span></div>)}</div><Link to={`/shop/${product.slug}`} className="am-deal-shop">SHOP NOW</Link></div><Link className="am-deal-image" to={`/shop/${product.slug}`}><img src={product.image} alt={product.name} loading="lazy" /></Link></div></section>
}
