import { useMemo } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { ProductCard } from "@/features/storefront/components/product-card"
import { storefrontCategories, storefrontProducts } from "@/features/storefront/data/products"

export default function StorefrontProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get("category") ?? ""
  const brand = searchParams.get("brand") ?? ""
  const budget = searchParams.get("budget") ?? ""
  const search = searchParams.get("search") ?? ""
  const sort = searchParams.get("sort") ?? "featured"
  const selectedCategory = storefrontCategories.find((item) => item.name === category)

  const products = useMemo(() => {
    let result = storefrontProducts.filter((product) => {
      const matchesCategory = !category || product.category === category
      const matchesBrand = !brand || product.brand === brand
      const matchesSearch = !search || `${product.name} ${product.brand} ${product.category}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi"))
      const [minimum, maximum] = budget.split("-").map((value) => value ? Number(value) : undefined)
      const matchesMinimum = minimum === undefined || product.price >= minimum
      const matchesMaximum = maximum === undefined || product.price < maximum
      return matchesCategory && matchesBrand && matchesSearch && matchesMinimum && matchesMaximum
    })

    if (sort === "price-asc") result = [...result].sort((left, right) => left.price - right.price)
    if (sort === "price-desc") result = [...result].sort((left, right) => right.price - left.price)
    if (sort === "name-asc") result = [...result].sort((left, right) => left.name.localeCompare(right.name, "vi"))
    return result
  }, [brand, budget, category, search, sort])

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className="min-h-[60vh] bg-[#fbfcfa]">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-11">
          <nav aria-label="Điều hướng breadcrumb" className="text-xs text-gray-500"><Link to="/" className="hover:text-[#4d9210]">Trang chủ</Link><span className="px-2">/</span>Sản phẩm</nav>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#57952b]">{selectedCategory ? "Danh mục sản phẩm" : "Khám phá cửa hàng"}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">{selectedCategory?.name ?? "Phụ kiện công nghệ"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">{selectedCategory?.description ?? "Khám phá phụ kiện theo nhu cầu, xem hình ảnh và thông tin để tìm sản phẩm phù hợp."}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr] lg:py-12">
        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-5 flex items-center gap-2 font-bold text-gray-900"><SlidersHorizontal size={17} /> Bộ lọc</div>
          <label className="mb-5 block">
            <span className="mb-2 block text-xs font-semibold text-gray-600">Tìm kiếm</span>
            <span className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3">
              <Search size={15} className="text-gray-400" />
              <input value={search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Tên sản phẩm..." className="min-w-0 flex-1 text-sm outline-none" />
            </span>
          </label>
          <label className="mb-5 block">
            <span className="mb-2 block text-xs font-semibold text-gray-600">Danh mục</span>
            <select value={category} onChange={(event) => updateFilter("category", event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#72ae3e]">
              <option value="">Tất cả danh mục</option>
              {storefrontCategories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
            </select>
          </label>
          <label className="mb-5 block">
            <span className="mb-2 block text-xs font-semibold text-gray-600">Thương hiệu</span>
            <select value={brand} onChange={(event) => updateFilter("brand", event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#72ae3e]">
              <option value="">Tất cả thương hiệu</option>
              {[...new Set(storefrontProducts.map((product) => product.brand))].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-gray-600">Khoảng giá</span>
            <select value={budget} onChange={(event) => updateFilter("budget", event.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#72ae3e]">
              <option value="">Mọi mức giá</option>
              <option value="0-2000000">Dưới 2 triệu</option>
              <option value="2000000-10000000">2 – 10 triệu</option>
              <option value="10000000-">Trên 10 triệu</option>
            </select>
          </label>
          {(category || brand || budget || search) && (
            <button type="button" onClick={() => setSearchParams({})} className="mt-5 text-xs font-semibold text-[#4d9210] hover:underline">Xóa bộ lọc</button>
          )}
        </aside>

        <section aria-label="Danh sách sản phẩm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{products.length}</span> sản phẩm</p>
            <label className="flex items-center gap-2 text-xs text-gray-500">
              Sắp xếp
              <select value={sort} onChange={(event) => updateFilter("sort", event.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none">
                <option value="featured">Nổi bật</option>
                <option value="name-asc">Tên A–Z</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </label>
          </div>
          {products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <p className="font-semibold text-gray-900">Chưa tìm thấy sản phẩm phù hợp</p>
              <p className="mt-2 text-sm text-gray-500">Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
              <button type="button" onClick={() => setSearchParams({})} className="mt-5 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white">Xóa bộ lọc</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
