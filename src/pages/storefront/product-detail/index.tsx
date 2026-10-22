import { useEffect, useState } from "react"
import { Link, Navigate, useParams, useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { productUrl, type StoreProduct } from "@/features/storefront/catalog"
import { blueSilenceImages, getProductOptions } from "@/features/storefront/product-options"
import { ProductGallery } from "./components/product-gallery"
import { ProductSummary } from "./components/product-summary"
import { ProductTabs } from "./components/product-tabs"
import { LatestProducts } from "./components/product-recommendations"
import { ProductPolicies } from "./components/product-policies"
import { StickyPurchase } from "./components/sticky-purchase"
import "./product-detail.css"
import { useStorefrontProduct } from "@/features/storefront/hooks/use-storefront-product"
import { useStorefront } from "@/features/storefront/store"
import { getApiError } from "@/utils/api-error"

function ProductDetailContent({ product }: { product: StoreProduct }) {
  const options = product.options ?? getProductOptions(product.slug)
  const [optionKey, setOptionKey] = useState<string>()
  const selected = options.find(option => (option.id ?? option.name) === optionKey) ?? options.find(option => option.available) ?? options[0]
  const variantImages = [...new Set(options.flatMap(option => option.images ?? [option.image]))]
  const images = product.source === "api" && variantImages.length > 0
    ? variantImages
    : product.images?.length ? product.images : product.slug === "blue-silence" ? blueSilenceImages : [product.image]
  const [image, setImage] = useState(selected?.image ?? product.image)

  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const navigate = useNavigate()
  const available = selected?.available ?? product.available ?? true
  const addSelected = () => {
    if (!available) return
    const store = useStorefront.getState()
    if (product.source === "api") store.cacheProduct(product)
    store.addToCart(product.slug, quantity, selected?.id ?? selected?.name)
    setAdded(true)
  }
  const buyNow = () => { if (available) { addSelected(); navigate("/cart") } }
  return <div className="pd-page pb-16 text-black">
    <div className="pd-container mx-auto">
      <nav className="pd-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={12} /><span>{product.name}</span></nav>
      <section className="pd-overview grid items-start" aria-label="Product information">
        <ProductGallery name={product.name} images={images} activeImage={image} fallbackImage={product.image} onImageChange={setImage} />
        <ProductSummary product={product} options={options} selected={selected} quantity={quantity} setQuantity={setQuantity} added={added} addSelected={addSelected} buyNow={buyNow} onSelect={option => { setOptionKey(option.id ?? option.name); setImage(option.image); setAdded(false) }} />
        <ProductPolicies />
      </section>
      <ProductTabs product={product} />
      <LatestProducts slug={product.slug} product={product} />
    </div>
    <StickyPurchase product={product} selected={selected} quantity={quantity} available={available} addSelected={addSelected} buyNow={buyNow} />
  </div>
}

export default function ProductDetail() {
  const { categorySlug, slug } = useParams()
  const query = useStorefrontProduct(slug)
  const cacheProduct = useStorefront(state => state.cacheProduct)
  useEffect(() => { if (query.data) cacheProduct(query.data) }, [query.data, cacheProduct])
  if (query.isPending && slug) return <div className="sf-container pd-loading" role="status" aria-label="Loading product"><div className="pd-loading-image" /><div className="pd-loading-copy"><h1>Loading product…</h1><p>Please wait while we load the latest product information.</p></div></div>
  if (query.isError) {
    const missing = getApiError(query.error).statusCode === 404
    return <div className="sf-container sf-empty" role="alert"><h1>{missing ? "Product not found" : "Unable to load product"}</h1><p>{missing ? "This product is unavailable or no longer published." : "Please check your connection and try again."}</p>{!missing && <button className="sf-button" onClick={() => void query.refetch()}>Try again</button>}<Link to="/shop">Back to shop</Link></div>
  }
  if (!query.data) return <div className="sf-container sf-empty"><h1>Product not found</h1><Link to="/shop">Back to shop</Link></div>
  if (query.data.source === "api" && query.data.categorySlug && categorySlug !== query.data.categorySlug) return <Navigate to={productUrl(query.data)} replace />
  return <ProductDetailContent key={`${query.data.id}:${query.data.slug}`} product={query.data} />
}
