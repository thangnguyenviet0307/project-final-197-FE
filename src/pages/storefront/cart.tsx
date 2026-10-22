import { Link } from "react-router-dom"
import { ShoppingBag, Trash2 } from "lucide-react"
import { money, products } from "@/features/storefront/catalog"
import { useStorefront } from "@/features/storefront/store"

export default function Cart() {
  const { cart, setQuantity } = useStorefront()
  const items = products.filter(p => (cart[p.slug] ?? 0) > 0)
  const total = items.reduce((sum, p) => sum + p.price * cart[p.slug], 0)
  return <div className="sf-container sf-page"><div className="sf-breadcrumb"><Link to="/">Trang chủ</Link><span>/</span>Giỏ hàng</div><div className="sf-page-intro"><span className="sf-kicker">NHỮNG LỰA CHỌN CỦA BẠN</span><h1>Giỏ hàng</h1><p>Một bước gần hơn với trải nghiệm mới.</p></div>{items.length ? <div className="sf-cart-layout"><div>{items.map(p => <article className="sf-cart-item" key={p.slug}><Link to={`/shop/${p.slug}`}><img src={p.image} alt={p.name} /></Link><div><small>{p.brand}</small><Link to={`/shop/${p.slug}`}><h3>{p.name}</h3></Link><strong>{money(p.price)}</strong></div><label><span className="sf-sr-only">Số lượng {p.name}</span><input type="number" min={1} max={99} value={cart[p.slug]} onChange={e => { if (e.target.value) setQuantity(p.slug, Math.max(1, Number(e.target.value))) }} /></label><strong>{money(p.price * cart[p.slug])}</strong><button aria-label={`Xóa ${p.name}`} onClick={() => setQuantity(p.slug, 0)}><Trash2 size={18} /></button></article>)}<Link className="sf-text-button" to="/shop">← Tiếp tục mua sắm</Link></div><aside className="sf-order-summary"><h2>Tóm tắt giỏ hàng</h2><div><span>Tạm tính</span><strong>{money(total)}</strong></div><div><span>Phí giao hàng</span><span>Chưa áp dụng</span></div><div className="sf-summary-total"><span>Tổng ước tính</span><strong>{money(total)}</strong></div><p>Đây là giỏ hàng trải nghiệm giao diện. Chưa hỗ trợ thanh toán hoặc tạo đơn hàng thực tế.</p><Link className="sf-button" to="/contact">Liên hệ tư vấn →</Link></aside></div> : <div className="sf-empty"><ShoppingBag size={42} strokeWidth={1} /><h2>Giỏ hàng đang chờ bạn</h2><p>Khám phá và thêm những sản phẩm bạn yêu thích.</p><Link className="sf-button" to="/shop">Bắt đầu mua sắm →</Link></div>}</div>
}
