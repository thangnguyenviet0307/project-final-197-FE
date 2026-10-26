import { Clock, Shield, Sparkles, Truck, type LucideIcon } from "lucide-react"

export interface Feature {
  id: number
  title: string
  description: string
  icon: LucideIcon
}

export const features: Feature[] = [
  {
    id: 1,
    title: "Chất lượng cao cấp",
    description:
      "Handcrafted with premium materials and meticulous attention to detail.",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Mua sắm an toàn",
    description: "100% secure payment processing with end-to-end encryption.",
    icon: Shield,
  },
  {
    id: 3,
    title: "Giao hàng nhanh",
    description:
      "Free worldwide shipping and hassle-free returns within 30 days.",
    icon: Truck,
  },
  {
    id: 4,
    title: "24/7 Support",
    description: "Round-the-clock customer support to assist you anytime.",
    icon: Clock,
  },
]
