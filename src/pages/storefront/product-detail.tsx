import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Check, Heart, ShieldCheck, Truck, ShoppingBag } from "lucide-react"
import { categoryUrl, money, products } from "@/features/storefront/catalog"
import { useStorefront } from "@/features/storefront/store"
import ProductCard from "@/features/storefront/product-card"

export default function ProductDetail() {
  const { slug } = useParams()
  const product = products.find(p => p.slug === slug)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addToCart, wishlist, toggleWishlist } = useStorefront()
  if (!product) return <div className="sf-container sf-empty"><h1>Không tìm thấy sản phẩm</h1><Link className="sf-button" to="/shop">Quay lại cửa hàng</Link></div>
  const saved = wishlist.includes(product.slug)
  return <div className="sf-container sf-page"><div className="sf-breadcrumb"><Link to="/">Trang chủ</Link><span>/</span><Link to={categoryUrl(product.category)}>{product.category}</Link><span>/</span>{product.name}</div><section className="sf-detail"><div className="sf-detail-image"><img src={product.image} alt={product.name} /></div><div className="sf-detail-info"><span className="sf-kicker">{product.brand}</span><h1>{product.name}</h1><div className="sf-rating"><span>★★★★★</span> {product.rating} / 5</div><p className="sf-stock"><Check size={16} /> Có sẵn trong bộ sưu tập mẫu</p><div className="sf-detail-price"><strong>{money(product.price)}</strong><del>{money(product.originalPrice)}</del></div><p>Thiết kế tinh tế, trải nghiệm tiện lợi. Khám phá sản phẩm đồng hành cùng bạn trong công việc và những khoảnh khắc thư giãn mỗi ngày.</p><div className="sf-detail-buy"><label>Số lượng<input type="number" min={1} max={99} value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))} /></label><button className="sf-button" onClick={() => { addToCart(product.slug, quantity); setAdded(true) }}>{added ? <Check size={18} /> : <ShoppingBag size={18} />}{added ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}</button></div>{added && <Link className="sf-text-button" to="/cart">Xem giỏ hàng →</Link>}<button className="sf-text-button sf-inline" aria-pressed={saved} onClick={() => toggleWishlist(product.slug)}><Heart size={17} fill={saved ? "currentColor" : "none"} />{saved ? "Đã lưu yêu thích" : "Thêm vào yêu thích"}</button><div className="sf-detail-perks"><span><Truck size={19} /> Miễn phí giao hàng từ 2 triệu</span><span><ShieldCheck size={19} /> Hỗ trợ & bảo hành chính hãng</span></div><p className="sf-demo-note">Sản phẩm và chính sách minh họa. Giỏ hàng lưu trên trình duyệt; chưa hỗ trợ đặt hàng thực tế.</p></div></section><section className="sf-section"><div className="sf-section-heading"><h2>Có thể bạn cũng thích</h2><Link to="/shop">Xem tất cả →</Link></div><div className="sf-product-grid sf-four-columns">{products.filter(p => p.slug !== slug).slice(0, 4).map(p => <ProductCard key={p.slug} product={p} />)}</div></section></div>
}
