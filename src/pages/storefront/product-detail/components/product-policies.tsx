import { Headset, Rocket, RotateCcw } from "lucide-react"

const policies = [
  { title: "Delivery info", icon: Rocket, text: "From then, delivery is generally within 2–10 days, depending on your location." },
  { title: "30 days returns", icon: RotateCcw, text: "Not the right fit? No worries. We'll arrange pick up and a full refund within 7 days including the delivery fee." },
  { title: "Customer support", icon: Headset, text: "Have a question about your purchase? Contact our team for help." },
]

export function ProductPolicies() {
  return <aside className="pd-policies grid" aria-label="Shopping policies">{policies.map(({ title, icon: Icon, text }) => <section className="pd-policy relative text-center" key={title}><div className="pd-policy-icon absolute flex items-center justify-center"><Icon aria-hidden="true" size={42} strokeWidth={1.2} /></div><h2>{title}</h2><p>{text}</p></section>)}</aside>
}
