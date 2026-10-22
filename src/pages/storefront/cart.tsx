import { Link } from "react-router-dom"
import { ShoppingBag, Trash2 } from "lucide-react"
import { productUrl, money } from "@/features/storefront/catalog"
import { getCartLines } from "@/features/storefront/product-options"
import { useStorefront } from "@/features/storefront/store"

export default function Cart() {
  const { cart, setQuantity, apiProducts } = useStorefront()
  const items = getCartLines(cart, apiProducts)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return <div className="sf-container sf-page">
    <div className="sf-breadcrumb"><Link to="/">Trang chủ</Link><span>/</span>Giỏ hàng</div>
    <div className="sf-page-intro"><span className="sf-kicker">NHỮNG LỰA CHỌN CỦA BẠN</span><h1>Giỏ hàng</h1><p>Một bước gần hơn với trải nghiệm mới.</p></div>
    {items.length ? <div className="sf-cart-layout"><div>
      {items.map(({ key, product, option, price, image, quantity }) => {
        const label = `${product.name}${option ? ` / ${option.name}` : ""}`
        return <article className="sf-cart-item" key={key}>
          <Link to={productUrl(product)}><img src={image} alt={label} /></Link>
          <div><small>{product.brand}</small><Link to={productUrl(product)}><h3>{product.name}</h3></Link>{option && <p style={{ fontSize: 11, color: "#888", marginBottom: 5 }}>Color: {option.name}</p>}<strong>{money(price)}</strong></div>
          <label><span className="sf-sr-only">Số lượng {label}</span><input type="number" min={1} max={99} value={quantity} onChange={event => { if (event.target.value) setQuantity(key, Math.max(1, Number(event.target.value))) }} /></label>
          <strong>{money(price * quantity)}</strong><button aria-label={`Xóa ${label}`} onClick={() => setQuantity(key, 0)}><Trash2 size={18} /></button>
        </article>
      })}
      <Link className="sf-text-button" to="/shop">← Tiếp tục mua sắm</Link>
    </div><aside className="sf-order-summary"><h2>Tóm tắt giỏ hàng</h2><div><span>Tạm tính</span><strong>{money(total)}</strong></div><div><span>Phí giao hàng</span><span>Chưa áp dụng</span></div><div className="sf-summary-total"><span>Tổng ước tính</span><strong>{money(total)}</strong></div><p>Đây là giỏ hàng trải nghiệm giao diện. Chưa hỗ trợ thanh toán hoặc tạo đơn hàng thực tế.</p><Link className="sf-button" to="/contact">Liên hệ tư vấn →</Link></aside></div> : <div className="sf-empty"><ShoppingBag size={42} strokeWidth={1} /><h2>Giỏ hàng đang chờ bạn</h2><p>Khám phá và thêm những sản phẩm bạn yêu thích.</p><Link className="sf-button" to="/shop">Bắt đầu mua sắm →</Link></div>}
  </div>
}
