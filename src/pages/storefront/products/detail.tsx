import { useState } from "react"
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { ProductCard } from "@/features/storefront/components/product-card"
import { SectionHeading } from "@/features/storefront/components/section-heading"
import { storefrontProducts } from "@/features/storefront/data/products"
import { formatStorePrice } from "@/features/storefront/utils/format-price"

export default function StorefrontProductDetailPage() {
  const { slug } = useParams()
  const product = storefrontProducts.find((item) => item.slug === slug)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<"description" | "details">("description")

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h1>
        <p className="mt-2 text-sm text-gray-500">Sản phẩm có thể đã được gỡ khỏi bộ sưu tập.</p>
        <Link to="/shop" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4d9210]"><ArrowLeft size={16} /> Quay lại cửa hàng</Link>
      </div>
    )
  }

  const gallery = product.gallery.length ? product.gallery : [product.image]
  const relatedProducts = storefrontProducts.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4)
  const variant = product.variants[selectedVariant]

  return (
    <div className="bg-[#fbfcfa]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav aria-label="Điều hướng breadcrumb" className="text-xs text-gray-500">
          <Link to="/" className="hover:text-[#4d9210]">Trang chủ</Link><span className="px-2">/</span><Link to="/shop" className="hover:text-[#4d9210]">Sản phẩm</Link><span className="px-2">/</span>{product.name}
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="overflow-hidden rounded-3xl bg-[#f0f2ee]">
            <img src={gallery[selectedImage] ?? product.image} alt={`${product.name} - hình ${selectedImage + 1}`} className="aspect-square w-full object-cover" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {gallery.map((image, index) => (
              <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(index)} aria-label={`Xem hình ${index + 1}`} aria-pressed={selectedImage === index} className={`overflow-hidden rounded-xl border-2 bg-[#f0f2ee] ${selectedImage === index ? "border-[#57952b]" : "border-transparent"}`}>
                <img src={image} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:py-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#57952b]">{product.brand} · {product.category}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-gray-950 sm:text-4xl">{product.name}</h1>
          <div className="mt-5 flex flex-wrap items-baseline gap-5">
            <span>
              <span className="block text-xs font-medium text-gray-400">Giá sỉ tham khảo</span>
              <span className="text-2xl font-bold text-gray-950">{formatStorePrice(product.price)}</span>
            </span>
            {product.cashPrice !== undefined && (
              <span>
                <span className="block text-xs font-medium text-gray-400">Giá CK tham khảo</span>
                <span className="text-lg font-semibold text-[#4d9210]">{formatStorePrice(product.cashPrice)}</span>
              </span>
            )}
          </div>
          <p className="mt-5 text-sm leading-7 text-gray-600">{product.description}</p>
          {product.variants.length > 0 && (
            <fieldset className="mt-7">
              <legend className="text-sm font-semibold text-gray-900">Màu sắc: <span className="font-normal text-gray-500">{variant.name}</span></legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((item, index) => (
                  <button key={item.name} type="button" onClick={() => { setSelectedVariant(index); setSelectedImage(Math.max(0, gallery.indexOf(item.image))) }} aria-pressed={selectedVariant === index} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${selectedVariant === index ? "border-gray-900 bg-white text-gray-900" : "border-gray-200 text-gray-600"}`}>
                    <span className="size-4 rounded-full border border-black/10" style={{ backgroundColor: item.color }} />{item.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center rounded-xl border border-gray-200 bg-white">
              <button type="button" aria-label="Giảm số lượng" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="flex size-11 items-center justify-center text-gray-500 disabled:opacity-40"><Minus size={15} /></button>
              <span aria-live="polite" className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
              <button type="button" aria-label="Tăng số lượng" onClick={() => setQuantity((current) => variant.stock === undefined ? current + 1 : Math.min(variant.stock, current + 1))} disabled={variant.stock !== undefined && quantity >= variant.stock} className="flex size-11 items-center justify-center text-gray-500 disabled:opacity-40"><Plus size={15} /></button>
            </div>
            <button type="button" disabled title="Đặt hàng trực tuyến sẽ được bổ sung khi storefront API sẵn sàng." className="inline-flex h-12 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-300 px-5 text-sm font-bold text-gray-600 sm:flex-none">
              <ShoppingBag size={17} /> Đặt hàng sắp mở
            </button>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-gray-500"><Check size={15} className="text-[#4d9210]" /> {variant.stock === undefined ? `Mẫu ${variant.name}` : `Còn ${variant.stock} sản phẩm · Mẫu ${variant.name}`}</p>

          <div className="mt-8 grid gap-3 border-t border-gray-200 pt-6 sm:grid-cols-2">
            <div className="flex gap-3 rounded-xl bg-white p-4"><Truck size={18} className="shrink-0 text-[#57952b]" /><div><p className="text-sm font-semibold">Thông tin giao hàng</p><p className="mt-1 text-xs leading-5 text-gray-500">Phí và thời gian giao hàng được xác nhận khi đặt mua.</p></div></div>
            <div className="flex gap-3 rounded-xl bg-white p-4"><ShieldCheck size={18} className="shrink-0 text-[#57952b]" /><div><p className="text-sm font-semibold">Hỗ trợ sau mua</p><p className="mt-1 text-xs leading-5 text-gray-500">Liên hệ đội ngũ cửa hàng để được tư vấn.</p></div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:pb-16">
        <div className="flex border-b border-gray-200">
          <button type="button" onClick={() => setActiveTab("description")} className={`border-b-2 px-5 py-3 text-sm font-semibold ${activeTab === "description" ? "border-[#57952b] text-gray-950" : "border-transparent text-gray-500"}`}>Mô tả sản phẩm</button>
          <button type="button" onClick={() => setActiveTab("details")} className={`border-b-2 px-5 py-3 text-sm font-semibold ${activeTab === "details" ? "border-[#57952b] text-gray-950" : "border-transparent text-gray-500"}`}>Thông tin nổi bật</button>
        </div>
        <div className="max-w-3xl py-6 text-sm leading-7 text-gray-600">
          {activeTab === "description" ? (
            <p>{product.description} Chọn màu sắc phù hợp với bạn và khám phá thêm các sản phẩm cùng bộ sưu tập.</p>
          ) : (
            product.features.length > 0 ? (
              <ul className="space-y-3">{product.features.map((feature) => <li key={feature} className="flex items-start gap-2"><Check size={17} className="mt-1 shrink-0 text-[#57952b]" />{feature}</li>)}</ul>
            ) : (
              <p>Thông số, quy cách và khả năng tương thích được cập nhật trên trang sản phẩm của website nguồn.</p>
            )
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:pb-20">
          <SectionHeading eyebrow="Khám phá thêm" title="Sản phẩm liên quan" description={`Thêm lựa chọn từ danh mục ${product.category}.`} to={`/shop?category=${encodeURIComponent(product.category)}`} linkLabel="Xem danh mục" />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div>
        </section>
      )}
    </div>
  )
}
