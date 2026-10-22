import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { productUrl, products, money, type StoreProduct } from "@/features/storefront/catalog"
import { getStorefrontRecommendations } from "@/features/storefront/services/products.service"
import { useStorefront } from "@/features/storefront/store"
import { ChevronLeft, ChevronRight, Heart, ShoppingBag } from "lucide-react"

function useRecommendations(slug: string) {
  return useQuery({ queryKey: ['storefront', 'recommendations', slug], queryFn: ({ signal }) => getStorefrontRecommendations(slug, signal), staleTime: 60_000, retry: false, meta: { suppressGlobalErrorToast: true } })
}
function RecommendationCard({ product }: { product: StoreProduct }) {
  const { cacheProduct, addToCart, toggleWishlist, wishlist } = useStorefront()
  const [added, setAdded] = useState(false)
  return <article className="pd-recommendation group relative min-w-0 overflow-hidden"><Link to={productUrl(product)} className="block bg-white"><img src={product.image} alt={product.name} className="aspect-square w-full object-contain" loading="lazy" onError={event => { if (!event.currentTarget.src.endsWith("/storefront/product-placeholder.svg")) event.currentTarget.src = "/storefront/product-placeholder.svg" }} /></Link>{product.originalPrice > product.price && <span className="pd-card-discount absolute right-2 top-2">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>}<div className="pd-card-info text-center"><p>{product.category}</p><h3><Link to={productUrl(product)}>{product.name}</Link></h3><div className="flex flex-wrap items-center justify-center gap-1.5"><strong>{money(product.price)}</strong>{product.originalPrice > product.price && <del>{money(product.originalPrice)}</del>}</div></div><div className="pd-card-actions absolute flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"><Button size="icon" variant="outline" aria-label={`Yêu thích ${product.name}`} aria-pressed={wishlist.includes(product.slug)} onClick={() => { if (product.source === 'api') cacheProduct(product); toggleWishlist(product.slug) }}><Heart /></Button><Button size="icon" variant="outline" disabled={product.available === false} aria-label={`Thêm ${product.name} vào giỏ`} onClick={() => { if (product.source === 'api') cacheProduct(product); const option = product.options?.find(item => item.available); addToCart(product.slug, 1, option?.id ?? option?.name); setAdded(true) }}><ShoppingBag /></Button></div>{added && <span role="status" className="sr-only">Added to cart</span>}</article>
}
function ProductCarousel({ title, items }: { title: string; items: StoreProduct[] }) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(items.length / 4))
  const current = Math.min(page, pages - 1)
  return <section className="pd-latest" aria-label={title}><div className="pd-latest-heading relative text-center"><h2>{title}</h2><div className="absolute right-0 top-0 flex gap-2"><Button variant="ghost" size="icon" aria-label={`Previous ${title.toLowerCase()}`} disabled={current === 0} onClick={() => setPage(current - 1)}><ChevronLeft /></Button><Button variant="ghost" size="icon" aria-label={`Next ${title.toLowerCase()}`} disabled={current >= pages - 1} onClick={() => setPage(current + 1)}><ChevronRight /></Button></div></div><div className="pd-latest-grid grid grid-cols-2 gap-5 lg:grid-cols-4">{items.slice(current * 4, current * 4 + 4).map(product => <RecommendationCard key={product.slug} product={product} />)}</div><div className="pd-latest-dots flex justify-center gap-2">{Array.from({ length: pages }, (_, index) => <Button variant="ghost" key={index} aria-label={`${title} page ${index + 1}`} aria-pressed={current === index} onClick={() => setPage(index)} />)}</div></section>
}
function LiveCollections({ slug }: { slug: string }) {
  const query = useRecommendations(slug)
  const items = query.data ?? []
  if (!items.length) return null
  return <><ProductCarousel title="Latest products" items={items} /><ProductCarousel title="Upsell products" items={[...items].reverse()} /></>
}
export function LatestProducts({ slug, product }: { slug: string; product?: StoreProduct }) {
  if (product?.source === 'api') return <LiveCollections slug={slug} />
  return <><ProductCarousel title="Latest products" items={[products[19], products[22], products[23], products[21]]} /><ProductCarousel title="Upsell products" items={products.slice(8, 14).filter(item => item.slug !== slug)} /></>
}
