import { useState } from "react"
import { Link } from "react-router-dom"
import { Check, Heart, Search, ShoppingBag, ArrowLeftRight } from "lucide-react"
import { productUrl, money, type StoreProduct } from "@/features/storefront/catalog"
import { useStorefront } from "@/features/storefront/store"

export function HomeProductCard({ product, compact = false }: { product: StoreProduct; compact?: boolean }) {
  const { addToCart, toggleWishlist, wishlist } = useStorefront()
  const [added, setAdded] = useState(false)
  const saved = wishlist.includes(product.slug)
  const discounted = product.price < product.originalPrice

  return (
    <article className={`am-product${compact ? " am-product-compact" : ""}`}>
      <div className="am-product-image">
        <Link to={productUrl(product)} tabIndex={-1} aria-hidden="true">
          <img src={product.image} alt="" loading="lazy" />
        </Link>
        {discounted && !compact && <span className="am-product-discount">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>}
      </div>
      <div className="am-product-info">
        {!compact && <p className="am-product-category">all, New Arrival</p>}
        <h3><Link to={productUrl(product)}>{product.name}</Link></h3>
        <div className="am-product-price">
          {discounted && <del>{money(product.originalPrice)}</del>}
          <strong>{money(product.price)}</strong>
        </div>
      </div>
      {!compact && <div className="am-product-actions">
        <button aria-label={`${saved ? "Bỏ yêu thích" : "Yêu thích"} ${product.name}`} aria-pressed={saved} onClick={() => toggleWishlist(product.slug)}><Heart size={19} fill={saved ? "currentColor" : "none"} /></button>
        <button aria-label={`Thêm ${product.name} vào giỏ`} onClick={() => { addToCart(product.slug); setAdded(true) }}>{added ? <Check size={19} /> : <ShoppingBag size={19} />}</button>
        <Link to={productUrl(product)} aria-label={`View ${product.name}`}><Search size={19} /></Link>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} aria-label={`More ${product.category}`}><ArrowLeftRight size={19} /></Link>
      </div>}
    </article>
  )
}
