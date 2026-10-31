import { useEffect, useId, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "@/features/storefront/components/product-card"
import { useStoreProductCarousel } from "@/features/storefront/hooks/use-store-product-carousel"
import { mapCatalogProduct } from "@/features/storefront/utils/map-catalog-product"
import { SectionHeading } from "@/features/storefront/components/section-heading"
import type { ProductsQuery } from "@/features/products/types/products"
import "./product-section.css"

const desktopQuery = "(min-width: 1024px)"
function subscribeToWidth(onChange: () => void) {
  const media = window.matchMedia?.(desktopQuery)
  media?.addEventListener("change", onChange)
  return () => media?.removeEventListener("change", onChange)
}
const isDesktop = () => window.matchMedia ? window.matchMedia(desktopQuery).matches : window.innerWidth >= 1024

export function ProductSection({ title, filters, children }: { title: string; filters: Partial<ProductsQuery>; children?: ReactNode }) {
  const [column, setColumn] = useState(0)
  const gridId = useId()
  const desktop = useSyncExternalStore(subscribeToWidth, isDesktop, () => true)
  const visibleColumns = desktop ? 4 : 2
  const query = useStoreProductCarousel(filters)
  const badgeContext = filters.is_best_seller ? "is_best_seller" : filters.is_new ? "is_new" : filters.is_hot ? "is_hot" : "is_home"
  const products = query.data?.pages.flatMap(page => page.data) ?? []
  const total = query.data?.pages[0]?.pagination.total ?? 0
  const lastColumn = Math.max(0, Math.ceil(total / 2) - visibleColumns)
  const currentColumn = Math.min(column, lastColumn)
  const controls = lastColumn > 0
  const slots = Math.max(visibleColumns * 2, Math.ceil(products.length / 2) * 2)
  const busy = query.isFetching
  const { isError, hasNextPage, fetchNextPage } = query

  useEffect(() => {
    if (!busy && !isError && hasNextPage && (currentColumn + visibleColumns) * 2 > products.length) {
      void fetchNextPage()
    }
  }, [busy, isError, hasNextPage, fetchNextPage, currentColumn, visibleColumns, products.length])

  async function moveNext() {
    const nextColumn = Math.min(currentColumn + 1, lastColumn)
    if ((nextColumn + visibleColumns) * 2 > products.length && query.hasNextPage) {
      const result = await query.fetchNextPage()
      if (result.isError) return
    }
    setColumn(nextColumn)
  }

  return <section className="store-container space-y-6 py-12" aria-label={title}>
    <SectionHeading title={title} to="/shop" linkLabel="Xem tất cả" />
    {children}
    <div className="product-carousel relative" aria-busy={busy}>
      {controls && <>
        <button type="button" aria-label={`${title}: Sản phẩm trước`} aria-controls={gridId} disabled={currentColumn === 0 || busy} onClick={() => setColumn(currentColumn - 1)} className="absolute -left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md hover:bg-green-50 cursor-pointer disabled:cursor-default disabled:opacity-40 sm:-left-5"><ChevronLeft size={20} /></button>
        <button type="button" aria-label={`${title}: Sản phẩm tiếp theo`} aria-controls={gridId} disabled={currentColumn >= lastColumn || busy} onClick={() => void moveNext()} className="absolute -right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md hover:bg-green-50 cursor-pointer disabled:cursor-default disabled:opacity-40 sm:-right-5"><ChevronRight size={20} /></button>
      </>}
      <div id={gridId} className="product-carousel-viewport">
        <div className="product-carousel-track" style={{ "--column-offset": currentColumn } as CSSProperties}>
          {Array.from({ length: slots }, (_, index) => {
            const product = products[index]
            const outside = Math.floor(index / 2) < currentColumn || Math.floor(index / 2) >= currentColumn + visibleColumns
            return <div key={product?._id ?? `slot-${index}`} className="product-carousel-item" inert={outside || !product} aria-hidden={outside || !product}>
              {product ? <ProductCard product={mapCatalogProduct(product, badgeContext)} /> : <div className={`product-carousel-placeholder ${query.isPending ? "motion-safe:animate-pulse" : ""}`} />}
            </div>
          })}
        </div>
        {query.isPending && <div className="product-carousel-message" role="status">Đang tải sản phẩm…</div>}
        {!products.length && !query.isPending && !query.isError && <div className="product-carousel-message">Chưa có sản phẩm.</div>}
        {query.isError && <div className="product-carousel-message" role="alert"><p>Không thể tải sản phẩm.</p><button type="button" onClick={() => void (query.isFetchNextPageError ? query.fetchNextPage() : query.refetch())}>Thử lại</button></div>}
      </div>
    </div>
  </section>
}
