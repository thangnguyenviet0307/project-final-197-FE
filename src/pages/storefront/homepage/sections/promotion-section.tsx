import { Clock3, MapPin, Plane, Headphones } from "lucide-react"
import { Link } from "react-router-dom"
import { asset } from "../data"

const services = [
  { icon: Clock3, title: "FREE SAME DAY DELIVERY*", text: "In a hurry? Get it Fast!" },
  { icon: MapPin, title: "Free Click & Collect", text: "From 200+ locations nationwide" },
  { icon: Plane, title: "International Shipping", text: "From only £3.95" },
  { icon: Headphones, title: "365 Days Return", text: "Buy with Confidence" },
]
export function ServiceSection() {
  return <section className="am-services"><div className="sf-container">{services.map(({ icon: Icon, title, text }) => <div key={title}><Icon size={43} strokeWidth={1.2} /><div><h2>{title}</h2><p>{text}</p></div></div>)}</div></section>
}
export function PromotionSection() {
  return <section className="sf-container am-promotions" aria-label="Collections">{[{ title: "Flycam Collection", image: "slider22.jpg" }, { title: "Projectors Collection", image: "slider23.jpg" }].map(item => <Link to="/shop" key={item.title}><img src={asset(item.image)} alt="" loading="lazy" /><div><h2>{item.title}</h2><p>Daily Essentials</p><span>Shop now</span></div></Link>)}</section>
}
