import { useState } from "react"
import { Link } from "react-router-dom"
import { Check, X, Heart, Share2, Minus, Plus, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter } from "@/components/icons/brand-icons"
import { categoryUrl, money, type StoreProduct } from "@/features/storefront/catalog"
import type { ProductOption } from "@/features/storefront/product-options"
import { useStorefront } from "@/features/storefront/store"

interface ProductSummaryProps {
  product: StoreProduct
  options: ProductOption[]
  selected?: ProductOption
  quantity: number
  setQuantity: (value: number | ((previous: number) => number)) => void
  added: boolean
  addSelected: () => void
  buyNow: () => void
  onSelect: (option: ProductOption) => void
}

export function ProductSummary({ product, options, selected, onSelect, quantity, setQuantity, added, addSelected, buyNow }: ProductSummaryProps) {
  const [shareNotice, setShareNotice] = useState("")
  const { toggleWishlist, wishlist } = useStorefront()
  const saved = wishlist.includes(product.slug)
  const price = selected?.price ?? product.price
  const originalPrice = selected?.compareAtPrice ?? product.originalPrice
  const live = product.source === "api"
  const available = selected?.available ?? product.available ?? true
  const shareUrl = `${window.location.origin}${window.location.pathname}`
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setShareNotice("Product link copied.") }
    catch { setShareNotice("Copy the product URL from your address bar to share.") }
  }
  return <div className="pd-summary min-w-0">
    <h1>{product.name}</h1>
    <div className="pd-price flex flex-wrap items-baseline gap-2" aria-live="polite"><strong>{money(price)}</strong><span>USD</span>{originalPrice > price && <del>{money(originalPrice)}</del>}</div>
    <ul className="pd-availability space-y-1"><li className={available ? "pd-stock-available" : "pd-stock-unavailable"} aria-live="polite">{available ? <Check size={14} /> : <X size={14} />}{available ? "In Stock" : "Out of Stock"}</li>{!live && <><li><Check size={14} />FREE delivery available*</li><li><Check size={14} />Sale 30% Off Use Code: SALE30</li></>}</ul>
    {options.length > 0 && <fieldset className="pd-colors flex flex-wrap items-center gap-3"><legend className="sr-only">Product variant</legend><span className="pd-color-label">Color:</span><div className="flex flex-wrap items-center gap-2">{options.map(option => <label key={option.id ?? option.name} className={`pd-swatch relative inline-flex cursor-pointer ${(selected?.id ?? selected?.name) === (option.id ?? option.name) ? "active" : ""} ${!option.available ? "sold-out" : ""}`} title={option.available ? option.name : `${option.name} — Sold Out`}><input className="absolute inset-0 size-full cursor-pointer opacity-0" type="radio" name="product-color" value={option.name} checked={(selected?.id ?? selected?.name) === (option.id ?? option.name)} aria-label={option.available ? option.name : `${option.name} — Sold Out`} onChange={() => { onSelect(option) }} /><span style={{ backgroundColor: option.color }} /></label>)}</div>{live && <span className="pd-variant-label">{selected?.name}</span>}</fieldset>}
    <form className="pd-purchase" onSubmit={event => { event.preventDefault(); addSelected() }}>
      <div className="pd-quantity relative"><Input className="pd-quantity-input rounded-none" type="number" aria-label="Quantity" min={1} max={99} value={quantity} onChange={event => setQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))} /><div className="pd-quantity-buttons absolute inset-y-0 right-0 grid grid-rows-2"><Button type="button" variant="ghost" aria-label="Increase quantity" disabled={quantity === 99} onClick={() => setQuantity(value => Math.min(99, value + 1))}><Plus size={12} /></Button><Button type="button" variant="ghost" aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus size={12} /></Button></div></div>
      <Button className="pd-add-to-cart rounded-none" type="submit" disabled={!available}>{!available ? "Out of Stock" : added ? <><Check size={16} /> Added to Cart</> : "Add to Cart"}</Button>
    </form>
    <Button className="pd-buy-now w-full rounded-none" disabled={!available} onClick={buyNow}>Buy it now</Button>
    {added && <p className="pd-cart-notice" role="status">{quantity} × {product.name}{selected && ` / ${selected.name}`} added. <Link to="/cart">View cart →</Link></p>}
    <div className="pd-meta"><p><span>SKU:</span> {selected?.sku || ""}</p><p><span>Category:</span> {live ? <Link to={categoryUrl(product.category)}>{product.category}</Link> : <><Link to="/shop">all</Link>, <Link to="/shop">Feature</Link>, <Link to="/shop">New Arrival</Link>, <Link to="/shop">Top Rate</Link>, <Link to="/shop">Trending Products</Link>.</>}</p></div>
    <div className="pd-share flex items-center gap-4"><span className="flex items-center gap-2"><Share2 size={17} /> Share</span><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><Facebook width={14} height={14} /></a><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter"><Twitter width={14} height={14} /></a><Button variant="ghost" size="icon" aria-label="Copy product link" onClick={() => void copyLink()}><Copy size={14} /></Button><Button className="pd-wishlist" variant="ghost" size="icon" aria-label={saved ? "Added to Wishlist" : "Add to Wishlist"} aria-pressed={saved} onClick={() => toggleWishlist(product.slug)}><Heart size={16} fill={saved ? "currentColor" : "none"} /></Button></div>
    {shareNotice && <p className="pd-demo-note" role="status">{shareNotice}</p>}
    <p className="pd-demo-note">Checkout is not available yet. Buy it now opens your cart for review.</p>
  </div>
}
