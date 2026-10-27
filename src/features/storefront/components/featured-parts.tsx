import { useMemo, useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { ProductImage } from "@/features/products/components/product-image"
import type { Product, ProductMetrics } from "@/features/products/types/products"
import { useStoreProducts } from "@/features/storefront/hooks/use-store-products"
import { getStoreMetrics } from "@/features/storefront/services/catalog.service"
import { mapCatalogProduct } from "@/features/storefront/utils/map-catalog-product"
import { formatStorePrice } from "@/features/storefront/utils/format-price"

const HOME_CATALOG_QUERY = { page: 1, limit: 24 } as const
const FEATURED_TABS = [
  { id: "sale", label: "Sản phẩm khuyến mãi" },
  { id: "bestsellers", label: "Sản phẩm bán chạy" },
  { id: "top-rated", label: "Sản phẩm đánh giá cao" },
] as const

type FeaturedTab = (typeof FEATURED_TABS)[number]["id"]

function originalPrice(product: Product): number {
  return product.variants?.length
    ? Math.min(...product.variants.map((variant) => variant.price))
    : product.price ?? 0
}

function FeaturedProductCard({ product }: { product: Product }) {
  const storefrontProduct = mapCatalogProduct(product)
  const discount = product.discount ?? 0
  const wasPrice = originalPrice(product)

  return (
    <article className="min-w-0 overflow-hidden border border-[#e8e8e8] bg-white">
      <Link
        to={`/shop/${encodeURIComponent(storefrontProduct.slug)}`}
        className="relative block bg-white"
        aria-label={`Xem ${storefrontProduct.name}`}
      >
        <ProductImage
          src={storefrontProduct.image}
          alt={storefrontProduct.name}
          className="aspect-square w-full object-contain p-6 sm:p-8"
        />
        {discount > 0 && (
          <span className="absolute right-3 top-3 min-w-16 bg-[#f4494d] px-3 py-1.5 text-center text-sm font-bold text-white">
            -{discount}%
          </span>
        )}
      </Link>
      <div className="min-h-28 border-t border-[#ededed] px-4 py-4 sm:px-5">
        <h3 className="line-clamp-2 min-h-12 text-sm font-medium leading-6 text-[#292929]">
          <Link to={`/shop/${encodeURIComponent(storefrontProduct.slug)}`} className="hover:text-[#55b000]">
            {storefrontProduct.name}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-semibold text-[#333]">{formatStorePrice(storefrontProduct.price)}</span>
          {discount > 0 && (
            <span className="text-sm text-[#999] line-through">{formatStorePrice(wasPrice)}</span>
          )}
        </div>
      </div>
    </article>
  )
}

function compareMetricProducts(
  products: Product[],
  metrics: (ProductMetrics | undefined)[],
  metric: "soldCount" | "rating",
): Product[] {
  return products
    .map((product, index) => ({ product, value: metrics[index]?.[metric] ?? 0 }))
    .filter(({ value }) => value > 0)
    .sort((left, right) => right.value - left.value)
    .map(({ product }) => product)
}

export function FeaturedParts() {
  const query = useStoreProducts(HOME_CATALOG_QUERY)
  const [activeTab, setActiveTab] = useState<FeaturedTab>("sale")
  const products = useMemo(() => query.data?.data ?? [], [query.data?.data])
  const saleProducts = useMemo(
    () => [...products].sort((left, right) => (right.discount ?? 0) - (left.discount ?? 0)),
    [products],
  )
  const productsWithSlugs = useMemo(
    () => products.filter((product): product is Product & { slug: string } => Boolean(product.slug)),
    [products],
  )
  const metricsQueries = useQueries({
    queries: activeTab === "sale"
      ? []
      : productsWithSlugs.map((product) => ({
          queryKey: ["products", "public", "metrics", product.slug],
          queryFn: ({ signal }: { signal: AbortSignal }) => getStoreMetrics(product.slug, signal),
        })),
  })

  if (query.isPending) {
    return (
      <section id="featured-parts" className="bg-[#f2f2f2] px-5 py-8 sm:px-8 sm:py-10" aria-label="Sản phẩm nổi bật">
        <p role="status" className="py-16 text-center text-sm text-gray-500">Đang tải sản phẩm…</p>
      </section>
    )
  }

  if (query.isError) {
    return (
      <section id="featured-parts" className="bg-[#f2f2f2] px-5 py-8 sm:px-8 sm:py-10" aria-label="Sản phẩm nổi bật">
        <div role="alert" className="py-16 text-center">
          <p className="font-semibold text-gray-900">Không thể tải sản phẩm cửa hàng.</p>
          <button type="button" onClick={() => void query.refetch()} className="mt-4 border border-gray-300 px-4 py-2 text-sm font-semibold hover:border-[#55b000]">
            Thử tải lại
          </button>
        </div>
      </section>
    )
  }

  const metricsLoading = metricsQueries.some((result) => result.isPending)
  const metricsError = metricsQueries.some((result) => result.isError)
  const metrics = metricsQueries.map((result) => result.data)
  const ratedProducts = compareMetricProducts(productsWithSlugs, metrics, "rating")
  const bestsellers = compareMetricProducts(productsWithSlugs, metrics, "soldCount")
  const visibleProducts = activeTab === "sale"
    ? saleProducts
    : activeTab === "bestsellers"
      ? bestsellers
      : ratedProducts
  const activeTabLabel = FEATURED_TABS.find((tab) => tab.id === activeTab)?.label ?? ""

  return (
    <section id="featured-parts" className="bg-[#f2f2f2] px-5 pb-12 pt-7 sm:px-8 sm:pb-16 sm:pt-8" aria-label="Sản phẩm nổi bật">
      <div className="mx-auto max-w-[1800px]">
        <header className="text-center">
          <h2 className="text-xl font-semibold uppercase tracking-[0.16em] text-[#111] sm:text-[26px]">
            Sản phẩm nổi bật
          </h2>
          <span className="relative mx-auto mt-2 block h-[2px] w-[126px] bg-[#58b40c]" aria-hidden="true">
            <span className="absolute -top-[5px] left-1/2 size-0 -translate-x-1/2 border-b-[6px] border-l-[6px] border-r-[6px] border-b-[#58b40c] border-l-transparent border-r-transparent" />
          </span>

          <div role="tablist" aria-label="Danh mục sản phẩm nổi bật" className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-[18px]">
            {FEATURED_TABS.map((tab) => {
              const selected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-14 rounded-full border px-6 text-xs font-semibold uppercase tracking-[0.14em] transition-colors sm:min-h-16 sm:px-11 sm:text-sm ${
                    selected
                      ? "border-[#58b40c] bg-[#58b40c] text-white"
                      : "border-[#e5e5e5] bg-transparent text-[#5b5b5b] hover:border-[#58b40c] hover:text-[#438e00]"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </header>

        <div className="mt-9 sm:mt-[46px]">
          {activeTab !== "sale" && metricsLoading ? (
            <p role="status" className="py-16 text-center text-sm text-gray-500">Đang tải số liệu sản phẩm…</p>
          ) : activeTab !== "sale" && metricsError ? (
            <div role="alert" className="py-16 text-center">
              <p className="font-semibold text-gray-900">Không thể tải số liệu bán hàng và đánh giá.</p>
              <button
                type="button"
                onClick={() => void Promise.all(metricsQueries.filter((result) => result.isError).map((result) => result.refetch()))}
                className="mt-4 border border-gray-300 px-4 py-2 text-sm font-semibold hover:border-[#55b000]"
              >
                Thử tải lại
              </button>
            </div>
          ) : visibleProducts.length ? (
            <div role="tabpanel" aria-label={activeTabLabel} className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-[38px]">
              {visibleProducts.slice(0, 8).map((product) => (
                <FeaturedProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p role="status" className="py-16 text-center text-sm text-gray-500">
              {activeTab === "sale"
                ? "Hiện chưa có sản phẩm để giới thiệu."
                : activeTab === "bestsellers"
                  ? "Chưa có dữ liệu sản phẩm bán chạy."
                  : "Chưa có sản phẩm được đánh giá."}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
