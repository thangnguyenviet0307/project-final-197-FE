import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ShoppingCart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { money, type StoreProduct } from "@/features/storefront/catalog"
import type { ProductOption } from "@/features/storefront/product-options"

interface StickyPurchaseProps {
  product: StoreProduct
  selected?: ProductOption
  quantity: number
  available: boolean
  addSelected: () => void
  buyNow: () => void
}

export function StickyPurchase({ product, selected, quantity, available, addSelected, buyNow }: StickyPurchaseProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const navbar = document.querySelector(".sf-nav-wrap")
    if (!navbar) return
    const update = () => setVisible(window.scrollY > 0 && navbar.getBoundingClientRect().bottom <= 0)
    update()
    if (typeof IntersectionObserver === "undefined") {
      window.addEventListener("scroll", update, { passive: true })
      return () => window.removeEventListener("scroll", update)
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0)
    })
    observer.observe(navbar)
    return () => observer.disconnect()
  }, [])
  if (!visible) return null
  return <section className="pd-sticky-purchase fixed inset-x-0 bottom-0" aria-label="Purchase summary"><div className="pd-container mx-auto flex items-center">
    <img className="pd-sticky-image" src={selected?.image ?? product.image} alt="" onError={event => { const image = event.currentTarget; if (image.src.endsWith("/storefront/product-placeholder.svg")) return; const fallback = new URL(product.image, window.location.origin).href; image.src = image.src === fallback ? "/storefront/product-placeholder.svg" : fallback }} />
    <div className="pd-sticky-name"><strong>{product.name}</strong>{selected && <span>{selected.name} · {quantity}</span>}</div>
    <div className="pd-sticky-total"><span>Tạm tính</span><strong>{money((selected?.price ?? product.price) * quantity)}</strong></div>
    <Button className="pd-sticky-add" variant="outline" disabled={!available} onClick={addSelected}><ShoppingCart size={20} /><span>Thêm vào giỏ</span></Button>
    <Button className="pd-sticky-buy" disabled={!available} onClick={buyNow}>Mua ngay</Button>
    <Dialog><DialogTrigger render={<Button className="pd-sticky-credit" />}>Trả chậm <ChevronRight size={18} /></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Tư vấn trả chậm</DialogTitle><DialogDescription>Hiện chưa hỗ trợ đăng ký trả chậm trực tuyến. Vui lòng liên hệ cửa hàng để được tư vấn phương thức thanh toán.</DialogDescription></DialogHeader><Link to="/contact" className="underline">Liên hệ cửa hàng</Link></DialogContent></Dialog>
  </div></section>
}
