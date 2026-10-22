import { useState } from "react"
import { asset } from "../data"

export function TestimonialsSection() {
  const [active, setActive] = useState(0)
  return <section className="am-testimonials"><div className="sf-container"><h2>TESTIMONIALS</h2><div className="am-testimonial-cards">{[0, 1].map(offset => <article key={offset}><img src={asset(`testimonials-img${[5, 2, 3, 4][(active + offset) % 4]}.jpg`)} alt="Customer testimonial avatar" loading="lazy" /><div><h3>Rein® PSR0022 Power Steering Reservoir</h3><p>OEM direct replacement, fits perfectly only steering pump. Brought my car up to spec again..</p><span>★★★★★</span></div></article>)}</div><div className="am-testimonial-dots">{[0, 1, 2, 3].map(index => <button key={index} className={active === index ? "active" : ""} aria-label={`Testimonial ${index + 1}`} aria-pressed={active === index} onClick={() => setActive(index)} />)}</div></div></section>
}
