import { useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { useStoreProduct } from "@/features/storefront/hooks/use-store-products"
import { ProductDetailGallery } from "@/features/products/components/product-detail-gallery"
import { catalogId, catalogName, formatPrice, type Product } from "@/features/products/types/products"
import { discountedPrice } from "@/features/products/utils/product-price"
import { descriptionToHtml } from "@/features/products/utils/product-description"
import { getApiError } from "@/services/api"
import { Check, Minus, Plus, ShieldCheck, ShoppingBag, Truck, RotateCcw } from "lucide-react"
import { StoreRatingSummary, StoreProductReviews } from "@/features/storefront/components/store-product-feedback"
import { RelatedProducts } from "@/features/storefront/components/related-products"
import "@/features/products/components/product-description.css"

const attributeLabel = (name: string) => name.charAt(0).toLocaleUpperCase("vi") + name.slice(1)

function ProductDetails({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<"description" | "details">("description")
  const [quantity, setQuantity] = useState(product.minimumOrderQuantity ?? 1)
  const [selected, setSelected] = useState(() => {
    const cheapest = product.variants?.reduce<(NonNullable<Product["variants"]>)[number] | undefined>((current, item) => !current || item.price < current.price ? item : current, undefined)
    return cheapest?._id ?? cheapest?.sku ?? ""
  })
  const variant = product.variants?.find(item => (item._id ?? item.sku) === selected)
  const basePrice = variant?.price ?? product.price
  const price = basePrice === undefined ? null : discountedPrice(basePrice, product.discount)
  const stock = variant?.stock ?? product.stock ?? 0
  const minimum = product.minimumOrderQuantity ?? 1
  const displayQuantity = Math.min(Math.max(minimum, quantity), Math.max(minimum, stock))
  return <div className="space-y-12 sm:space-y-16">
    <section aria-label="Tổng quan sản phẩm" className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
    <div className="grid gap-8 md:grid-cols-2">
      <div className="min-w-0 [&_section>div:first-child]:rounded-3xl [&_section>div:first-child]:border-gray-100 [&_section>div:first-child]:bg-white [&_section>div:first-child]:p-4 [&_section>div:first-child]:shadow-sm"><ProductDetailGallery key={variant?._id ?? variant?.sku ?? product._id} product={variant?.image ? { ...product, thumbnail: variant.image } : product} /></div>
      <div className="min-w-0 space-y-6 lg:py-3">
        <div className="space-y-4">
          <h1 className="break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{product.product_name}</h1>
          <nav aria-label="Danh mục sản phẩm" className="flex flex-wrap items-center gap-2"><span className="mr-1 text-sm font-medium text-gray-500">Danh mục:</span><Link to={`/shop?category=${catalogId(product.category)}`} className="rounded-full bg-[#4d9210] px-4 py-2 text-xs font-semibold text-white">{catalogName(product.category)}</Link></nav>
          <p className="text-sm text-gray-500">Thương hiệu: <span className="font-semibold text-gray-800">{catalogName(product.brand)}</span></p>
        </div>
        <StoreRatingSummary slug={product.slug ?? ""} />
        <div className="rounded-2xl border border-[#e5eedf] bg-[#f0f6eb] p-5"><p className="text-xs font-medium text-gray-500">Giá bán · VND</p><p aria-label="Giá bán hiện tại" aria-live="polite" className="mt-2 text-3xl font-bold text-[#4d9210] sm:text-4xl">{price === null ? "Chưa có giá" : formatPrice(price) + " ₫"}</p>
        {!!product.discount && basePrice !== undefined && <p className="mt-3 flex items-center gap-3 text-sm"><span className="text-gray-400 line-through">{formatPrice(basePrice)} ₫</span><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#4d9210]">Tiết kiệm {product.discount}%</span></p>}</div>
        {!!product.variants?.length && <fieldset><legend className="mb-3 font-semibold">Chọn biến thể</legend><div className="flex flex-wrap gap-2">{product.variants.map(item => <button key={item._id ?? item.sku} type="button" aria-pressed={selected === (item._id ?? item.sku)} onClick={() => setSelected(item._id ?? item.sku)} className={`rounded-lg border px-4 py-2 ${selected === (item._id ?? item.sku) ? "border-green-700 bg-green-50" : "border-gray-200"}`}>{item.variant_name || item.sku}{[item.color, item.size].filter(Boolean).length > 0 && " · " + [item.color, item.size].filter(Boolean).join(" / ")}</button>)}</div></fieldset>}
        <p className="flex items-center gap-2 text-sm font-medium text-[#4d9210]"><Check size={16} />{stock > 0 ? "Còn " + stock + " sản phẩm" : "Hết hàng"}</p>
        {variant && <dl className="grid gap-2 text-sm">{Object.entries(variant.attributes ?? {}).map(([name, value]) => <div key={name}><dt className="text-gray-500">{attributeLabel(name)}</dt><dd>{value === null ? "—" : String(value)}</dd></div>)}</dl>}
        <p className="text-sm text-gray-500">Số lượng đặt tối thiểu: {product.minimumOrderQuantity ?? 1}</p>
        <div className="flex flex-wrap gap-3"><div className="flex h-12 items-center rounded-xl border border-gray-200 bg-white"><button type="button" aria-label="Giảm số lượng" disabled={displayQuantity <= minimum || stock < minimum} onClick={() => setQuantity(displayQuantity - 1)} className="flex size-11 items-center justify-center disabled:opacity-30"><Minus size={16} /></button><span className="min-w-9 text-center text-sm font-semibold" aria-live="polite">{displayQuantity}</span><button type="button" aria-label="Tăng số lượng" disabled={displayQuantity >= stock} onClick={() => setQuantity(displayQuantity + 1)} className="flex size-11 items-center justify-center disabled:opacity-30"><Plus size={16} /></button></div><button disabled className="inline-flex h-12 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-200 px-6 text-sm font-semibold text-gray-500"><ShoppingBag size={18} />Đặt hàng sắp mở</button></div>
      </div>
    </div>
        <div id="product-services" className="mt-6 grid scroll-mt-24 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-3">{[
          { Icon: Truck, title: "Giao hàng", text: product.shippingInformation },
          { Icon: ShieldCheck, title: "Bảo hành", text: product.warrantyInformation },
          { Icon: RotateCcw, title: "Đổi trả", text: product.returnPolicy },
        ].map(({ Icon, title, text }) => <div key={title} className="flex items-start gap-3 rounded-2xl bg-[#f7faf4] p-4"><Icon size={20} className="mt-0.5 shrink-0 text-[#57952b]" /><div className="min-w-0"><p className="text-sm font-semibold">{title}</p><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-gray-500">{text || "Liên hệ cửa hàng để được tư vấn."}</p></div></div>)}</div>
    </section>
    <section id="product-details" className="scroll-mt-24 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div role="tablist" aria-label="Thông tin sản phẩm" className="flex gap-2 overflow-x-auto border-b border-gray-100 px-4 sm:px-6">{([
        ["description", "Mô tả sản phẩm"], ["details", "Thông tin chi tiết"],
      ] as const).map(([tab, label]) => <button key={tab} type="button" role="tab" id={`tab-${tab}`} aria-selected={activeTab === tab} aria-controls={`panel-${tab}`} onClick={() => setActiveTab(tab)} onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "description" : event.key === "End" ? "details" : tab === "description" ? "details" : "description"; setActiveTab(next); document.getElementById(`tab-${next}`)?.focus() } }} tabIndex={activeTab === tab ? 0 : -1} className={`shrink-0 border-b-2 px-4 py-5 text-sm font-semibold ${activeTab === tab ? "border-[#57952b] text-[#4d9210]" : "border-transparent text-gray-400"}`}>{label}</button>)}</div>
      <div role="tabpanel" id="panel-description" aria-labelledby="tab-description" hidden={activeTab !== "description"} className="p-6 sm:p-8">{product.description ? <div className="product-description-content text-sm leading-8 text-gray-600" dangerouslySetInnerHTML={{ __html: descriptionToHtml(product.description) }} /> : <p className="text-sm text-gray-500">Chưa có mô tả.</p>}
        {!!product.tags?.length && <div aria-label="Tags sản phẩm" className="mt-6 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-5"><span className="mr-1 text-sm font-medium text-gray-500">Tags:</span>{product.tags.map((tag, index) => <span key={`${tag}-${index}`} className="rounded-full border border-[#dfead6] bg-[#f7faf4] px-3 py-1.5 text-xs font-medium text-[#4d9210]">{tag}</span>)}</div>}
      </div>
      <div role="tabpanel" id="panel-details" aria-labelledby="tab-details" hidden={activeTab !== "details"} className="p-4 sm:p-6"><table className="w-full table-fixed border-collapse text-left text-sm"><caption className="sr-only">Thông tin chi tiết sản phẩm</caption><tbody>{[
          ["Danh mục", catalogName(product.category)], ["Thương hiệu", catalogName(product.brand)],
          ["SKU", variant?.sku ?? product.sku], ["Năm sản xuất", product.model_year],
          ["Mã vạch", product.barcode], ["Số lượng đặt tối thiểu", minimum],
          ["Màu sắc", variant?.color], ["Kích thước phiên bản", variant?.size],
          ["Khối lượng", product.weight == null ? null : product.weight + " kg"],
          ["Kích thước", product.dimensions ? [product.dimensions.width, product.dimensions.height, product.dimensions.depth].join(" × ") + " cm" : null],
          ...Object.entries(variant?.attributes ?? {}).map(([name, value]) => [attributeLabel(name), value === null ? "—" : String(value)]),
        ].map(([label, value], index) => <tr key={`${label}-${index}`} className="border-b border-gray-100 last:border-0 even:bg-gray-50/60"><th scope="row" className="w-2/5 break-words bg-gray-50 px-4 py-3 align-top font-medium text-gray-500">{label}</th><td className="whitespace-pre-wrap break-words px-4 py-3 align-top text-gray-700">{value ?? "Chưa có thông tin"}</td></tr>)}</tbody></table></div>
    </section>
    <StoreProductReviews key={product._id} product={product} />
    <RelatedProducts slug={product.slug ?? ""} />
  </div>
}

export default function StorefrontProductDetailPage() {
  const { slug = "" } = useParams()
  const location = useLocation()
  const state: unknown = location.state
  const candidate = state && typeof state === "object" && "returnTo" in state ? state.returnTo : undefined
  const returnTo = typeof candidate === "string" && /^\/shop(?:\?|$)/.test(candidate) ? candidate : "/shop"
  const query = useStoreProduct(slug)
  return <div className="bg-[#fbfcfa] text-gray-950"><div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500"><ol className="flex flex-wrap items-center gap-2"><li><Link to="/" className="hover:text-[#4d9210]">Trang chủ</Link></li>{query.data && !query.isError && <><li aria-hidden="true">/</li><li>{catalogId(query.data.category) ? <Link to={`/shop?category=${catalogId(query.data.category)}`} className="hover:text-[#4d9210]">{catalogName(query.data.category)}</Link> : <span>Chưa có danh mục</span>}</li><li aria-hidden="true">/</li><li aria-current="page" className="break-words font-medium text-gray-800">{query.data.product_name}</li></>}</ol></nav>
    <Link to={returnTo} className="inline-flex text-sm font-medium text-[#4d9210] hover:underline">Quay lại danh sách</Link>
    {slug.length < 3 || slug.length > 255 ? <p role="alert">Đường dẫn sản phẩm không hợp lệ.</p> : query.isPending ? <p role="status">Đang tải sản phẩm…</p> : query.isError ? <div role="alert"><p>{getApiError(query.error).statusCode === 404 ? "Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng hoạt động." : getApiError(query.error).message}</p><button onClick={() => void query.refetch()}>Thử lại</button></div> : <ProductDetails key={query.data._id} product={query.data} />}
  </div></div>
}
