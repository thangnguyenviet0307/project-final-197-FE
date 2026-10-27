import { useRelatedProducts } from "@/features/storefront/hooks/use-store-products"
import { ProductCard } from "@/features/storefront/components/product-card"
import { SectionHeading } from "@/features/storefront/components/section-heading"
import { mapCatalogProduct } from "@/features/storefront/utils/map-catalog-product"

export function RelatedProducts({ slug }: { slug: string }) {
  const query = useRelatedProducts(slug)
  return <section className="border-t border-gray-200 pt-10" aria-label="Các sản phẩm liên quan">
    <SectionHeading eyebrow="Có thể bạn sẽ thích" title="Các sản phẩm liên quan" description="Khám phá thêm những lựa chọn trong cùng danh mục với sản phẩm bạn đang xem." to="/shop" linkLabel="Xem tất cả sản phẩm" />
    {query.isPending ? <p role="status">Đang tải sản phẩm liên quan…</p> : query.isError ? <div role="alert"><p>Không thể tải sản phẩm liên quan.</p><button onClick={() => void query.refetch()} className="mt-2 text-sm font-semibold text-[#4d9210]">Thử lại</button></div> : query.data.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-5">{query.data.slice(0, 5).map(product => <ProductCard key={product._id} product={mapCatalogProduct(product)} />)}</div> : <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">Chưa có sản phẩm liên quan.</p>}
  </section>
}
