import { Link } from "react-router-dom"
import { ProductCard } from "@/features/storefront/components/product-card"
import { useStoreProducts } from "@/features/storefront/hooks/use-store-products"
import { mapCatalogProduct } from "@/features/storefront/utils/map-catalog-product"
import { SectionHeading } from "@/features/storefront/components/section-heading"

export function FeaturedParts() {
  const query = useStoreProducts({ page: 1, limit: 8 })
  return <section className="store-container space-y-6 py-12" aria-label="Sản phẩm mới">
    <SectionHeading eyebrow="Khám phá cửa hàng" title="Sản phẩm mới" to="/shop" linkLabel="Xem tất cả" />
    {query.isPending ? <p role="status">Đang tải sản phẩm…</p> : query.isError ? <div role="alert"><p>Không thể tải sản phẩm.</p><button onClick={() => void query.refetch()}>Thử lại</button></div> : query.data.data.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{query.data.data.map(product => <ProductCard key={product._id} product={mapCatalogProduct(product)} />)}</div> : <p>Chưa có sản phẩm.</p>}
    <Link to="/shop" className="text-sm font-semibold text-green-700">Đến danh sách sản phẩm</Link>
  </section>
}
