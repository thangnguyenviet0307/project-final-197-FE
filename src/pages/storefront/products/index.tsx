import { Link, useSearchParams } from "react-router-dom"
import { useStoreProducts } from "@/features/storefront/hooks/use-store-products"
import { ProductCard } from "@/features/storefront/components/product-card"
import { mapCatalogProduct } from "@/features/storefront/utils/map-catalog-product"
import { ListPagination } from "@/components/list-pagination"
import { getApiError } from "@/services/api"
import { usePublicCategories } from "@/features/categories/hooks/use-public-categories"

export default function StorefrontProductsPage() {
  const [params, setParams] = useSearchParams()
  const requested = Number(params.get("page"))
  const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1
  const search = params.get("search") ?? ""
  const sort = params.get("sort") ?? "newest"
  const category = params.get("category") ?? ""
  const categories = usePublicCategories(true)
  const categoryId = /^[a-f\d]{24}$/i.test(category) ? category : categories.data?.find(item => item.name === category || item.slug === category)?._id
  const query = useStoreProducts({ page, limit: 12, search: search || undefined,
    category: categoryId,
    sortBy: sort.startsWith("price") ? "price" : sort === "name" ? "product_name" : "createdAt",
    sortOrder: sort === "price-asc" || sort === "name" ? "asc" : "desc" })
  function update(key: string, value: string) {
    setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); next.delete("page"); return next })
  }
  return <div className="min-h-[60vh] bg-[#fbfcfa] text-gray-950"><div className="store-container space-y-6 py-8">
    <nav className="text-sm"><Link to="/">Trang chủ</Link> / Sản phẩm</nav>
    <h1 className="text-3xl font-bold">Sản phẩm</h1>
    <div className="flex flex-wrap gap-3">
      <label className="flex items-center gap-2">Danh mục<select value={categoryId ?? ""} onChange={event => update("category", event.target.value)} className="rounded-lg border bg-white p-2"><option value="">Tất cả danh mục</option>{categories.data?.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
      <label className="flex flex-1 items-center gap-2">Tìm kiếm<input maxLength={255} value={search} onChange={event => update("search", event.target.value)} className="min-w-0 flex-1 rounded-lg border bg-white p-2" placeholder="Tên sản phẩm…" /></label>
      <label className="flex items-center gap-2">Sắp xếp<select value={sort} onChange={event => update("sort", event.target.value)} className="rounded-lg border bg-white p-2"><option value="newest">Mới nhất</option><option value="name">Tên A–Z</option><option value="price-asc">Giá tăng dần</option><option value="price-desc">Giá giảm dần</option></select></label>
    </div>
    {query.isPending ? <p role="status">Đang tải sản phẩm…</p> : query.isError ? <div role="alert"><p>{getApiError(query.error).message}</p><button onClick={() => void query.refetch()}>Thử lại</button></div> : <>
      <p className="text-sm text-gray-500">{query.data.pagination.total} sản phẩm</p>
      {category && !categoryId ? <p>Danh mục không khả dụng. Vui lòng chọn danh mục khác.</p> : query.data.data.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{query.data.data.map(product => <ProductCard key={product._id} product={mapCatalogProduct(product)} />)}</div> : <p>Không tìm thấy sản phẩm phù hợp.</p>}
      <ListPagination label="Phân trang sản phẩm" page={page} totalPages={Math.max(1, query.data.pagination.totalPages)} disabled={query.isFetching} onPageChange={next => setParams(previous => { const updated = new URLSearchParams(previous); updated.set("page", String(next)); return updated })} />
    </>}
  </div></div>
}
