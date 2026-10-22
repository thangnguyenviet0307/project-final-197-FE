import { Heart, Plus, Check } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { productUrl, money, type StoreProduct } from "./catalog"
import { useStorefront } from "./store"

export default function ProductCard({ product }: { product: StoreProduct }) {
  const { addToCart, toggleWishlist, wishlist } = useStorefront()
  const [added, setAdded] = useState(false)
  const saved = wishlist.includes(product.slug)
  return <article className="sf-product">
    <div className="sf-product-image">
      {product.price < product.originalPrice && <span className="sf-discount">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>}
      <button className={`sf-heart ${saved ? "is-saved" : ""}`} aria-label={`${saved ? "Bỏ yêu thích" : "Yêu thích"} ${product.name}`} aria-pressed={saved} onClick={() => toggleWishlist(product.slug)}><Heart size={18} fill={saved ? "currentColor" : "none"} /></button>
      <Link to={productUrl(product)}><img src={product.image} alt={product.name} loading="lazy" /></Link>
    </div>
    <div className="sf-product-body"><small>{product.brand}</small><Link className="sf-product-name" to={productUrl(product)}>{product.name}</Link><div className="sf-rating"><span aria-label="5 sao">★★★★★</span> <small>({product.rating})</small></div><div className="sf-price-row"><div><strong>{money(product.price)}</strong>{product.price < product.originalPrice && <del>{money(product.originalPrice)}</del>}</div><button className="sf-add" aria-label={`Thêm ${product.name} vào giỏ`} onClick={() => { addToCart(product.slug); setAdded(true) }}>{added ? <Check size={18} /> : <Plus size={18} />}</button></div></div>
  </article>
}
