import { Heart } from "lucide-react"
import { Link } from "react-router-dom"
import { products } from "@/features/storefront/catalog"
import ProductCard from "@/features/storefront/product-card"
import { useStorefront } from "@/features/storefront/store"

export default function Wishlist() {
  const wishlist = useStorefront(s => s.wishlist)
  const saved = products.filter(p => wishlist.includes(p.slug))
  return <div className="sf-container sf-page"><div className="sf-breadcrumb"><Link to="/">Trang chủ</Link><span>/</span>Yêu thích</div><div className="sf-page-intro"><span className="sf-kicker">GIỮ LẠI ĐIỀU BẠN THÍCH</span><h1>Sản phẩm yêu thích</h1><p>{saved.length} sản phẩm dành riêng cho bạn.</p></div>{saved.length ? <div className="sf-product-grid sf-four-columns">{saved.map(p => <ProductCard key={p.slug} product={p} />)}</div> : <div className="sf-empty"><Heart size={42} strokeWidth={1} /><h2>Bắt đầu bộ sưu tập của bạn</h2><p>Chạm vào trái tim trên sản phẩm để lưu lại những lựa chọn yêu thích.</p><Link className="sf-button" to="/shop">Khám phá sản phẩm →</Link></div>}</div>
}
