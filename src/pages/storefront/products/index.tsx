import { useState, type FormEvent } from "react"
import { Filter, RotateCcw, X } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { ListPagination } from "@/components/list-pagination"
import { usePublicBrands } from "@/features/brands/hooks/use-public-brands"
import type { PublicBrand } from "@/features/brands/types/brands"
import { usePublicCategories } from "@/features/categories/hooks/use-public-categories"
import type { PublicCategory } from "@/features/categories/types/categories"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductCard } from "@/features/storefront/components/product-card"
import { useStoreProducts } from "@/features/storefront/hooks/use-store-products"
import { mapCatalogProduct } from "@/features/storefront/utils/map-catalog-product"
import { getApiError } from "@/services/api"

interface FilterDraft {
  brand: string
  category: string
  minPrice: string
  maxPrice: string
}

const PRICE_RANGES = [
  { label: "Dưới 2 triệu", min: "", max: "2000000" },
  { label: "Từ 2 - 4 triệu", min: "2000000", max: "4000000" },
  { label: "Từ 4 - 7 triệu", min: "4000000", max: "7000000" },
  { label: "Từ 7 - 13 triệu", min: "7000000", max: "13000000" },
  { label: "Từ 13 - 20 triệu", min: "13000000", max: "20000000" },
  { label: "Trên 20 triệu", min: "20000000", max: "" },
] as const

function filterDraftFromParams(params: URLSearchParams): FilterDraft {
  return {
    brand: params.get("brand") ?? "",
    category: params.get("category") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
  }
}

function BrandLogo({ brand, compact = false }: { brand: PublicBrand; compact?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(brand.logoUrl && !imageFailed)

  return (
    <span className={`flex min-w-0 items-center justify-center gap-2 ${compact ? "h-12 px-3" : "h-[50px] px-4"}`}>
      {showImage ? (
        <img
          src={brand.logoUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className={`${compact ? "max-h-7 max-w-24" : "max-h-8 max-w-28"} object-contain`}
        />
      ) : (
        <span className={`${compact ? "text-sm" : "text-base"} font-semibold tracking-wide text-gray-800`}>
          {brand.name}
        </span>
      )}
      <span className="sr-only">{brand.name}</span>
    </span>
  )
}

function FilterChoice({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-w-0 rounded-xl border text-sm transition-colors ${
        selected
          ? "border-[#55b000] bg-[#f2f8ec] text-[#377b0c] ring-1 ring-[#55b000]"
          : "border-gray-200 bg-white text-gray-700 hover:border-[#9acb74]"
      }`}
    >
      {children}
    </button>
  )
}

function categoryLabel(category: PublicCategory): string {
  return category.name
}

function parsePrice(value: string): number | undefined {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

export default function StorefrontProductsPage() {
  const [params, setParams] = useSearchParams()
  const requested = Number(params.get("page"))
  const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1
  const search = params.get("search") ?? ""
  const sort = params.get("sort") ?? "newest"
  const brand = params.get("brand") ?? ""
  const category = params.get("category") ?? ""
  const minPriceParam = params.get("minPrice") ?? ""
  const maxPriceParam = params.get("maxPrice") ?? ""
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterError, setFilterError] = useState("")
  const [draftState, setDraftState] = useState<{ key: string; value: FilterDraft } | null>(null)
  const filterKey = [brand, category, minPriceParam, maxPriceParam].join("|")
  const draft = draftState?.key === filterKey ? draftState.value : filterDraftFromParams(params)
  const categories = usePublicCategories(true)
  const brands = usePublicBrands(true)
  const categoryId = /^[a-f\d]{24}$/i.test(category)
    ? category
    : categories.data?.find((item) => item.name === category || item.slug === category)?._id
  const query = useStoreProducts({
    page,
    limit: 12,
    search: search || undefined,
    brand: brand || undefined,
    category: categoryId,
    minPrice: parsePrice(minPriceParam),
    maxPrice: parsePrice(maxPriceParam),
    sortBy: sort.startsWith("price") ? "price" : sort === "name" ? "product_name" : "createdAt",
    sortOrder: sort === "price-asc" || sort === "name" ? "asc" : "desc",
  })

  function updateSort(value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set("sort", value)
      else next.delete("sort")
      next.delete("page")
      return next
    })
  }

  function updateDraft(patch: Partial<FilterDraft>) {
    setDraftState({ key: filterKey, value: { ...draft, ...patch } })
  }

  function chooseQuickBrand(brandId: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (brand === brandId) next.delete("brand")
      else next.set("brand", brandId)
      next.delete("page")
      return next
    })
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const minPrice = parsePrice(draft.minPrice)
    const maxPrice = parsePrice(draft.maxPrice)
    if ((draft.minPrice && minPrice === undefined) || (draft.maxPrice && maxPrice === undefined)) {
      setFilterError("Vui lòng nhập khoảng giá hợp lệ.")
      return
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      setFilterError("Giá tối thiểu không thể lớn hơn giá tối đa.")
      return
    }

    setParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const key of ["brand", "category", "minPrice", "maxPrice"]) next.delete(key)
      if (draft.brand) next.set("brand", draft.brand)
      if (draft.category) next.set("category", draft.category)
      if (draft.minPrice.trim()) next.set("minPrice", String(minPrice))
      if (draft.maxPrice.trim()) next.set("maxPrice", String(maxPrice))
      next.delete("page")
      return next
    })
    setFilterError("")
    setFiltersOpen(false)
  }

  function clearFilters() {
    setDraftState(null)
    setFilterError("")
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const key of ["brand", "category", "minPrice", "maxPrice", "page"]) next.delete(key)
      return next
    })
  }

  const activeFilterCount = Number(Boolean(brand))
    + Number(Boolean(category))
    + Number(Boolean(minPriceParam || maxPriceParam))
  const selectedCategoryInvalid = Boolean(category && !categoryId && categories.data)

  return (
    <div className="min-h-[60vh] bg-[#fbfcfa] text-gray-950">
      <div className="store-container space-y-6 py-8">
        <nav className="text-sm"><Link to="/">Trang chủ</Link> / Khám phá sản phẩm</nav>
        <div>
          <h1 className="text-3xl font-bold">Khám phá sản phẩm</h1>
          <p className="mt-2 text-sm text-gray-500">Chọn phụ kiện phù hợp từ danh sách sản phẩm của cửa hàng.</p>
        </div>

        <section aria-label="Lọc và sắp xếp sản phẩm" className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <Dialog
              open={filtersOpen}
              onOpenChange={(open) => {
                if (open) {
                  setDraftState(null)
                  setFilterError("")
                }
                setFiltersOpen(open)
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (!filtersOpen) {
                    setDraftState(null)
                    setFilterError("")
                  }
                  setFiltersOpen((open) => !open)
                }}
                aria-expanded={filtersOpen}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
                  filtersOpen || activeFilterCount
                    ? "border-[#55b000] bg-[#f2f8ec] text-[#3e8011]"
                    : "border-gray-200 bg-white text-gray-800 hover:border-[#55b000]"
                }`}
              >
                {filtersOpen ? <X size={17} /> : <Filter size={17} />}
                Lọc
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#55b000] text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <DialogContent className="max-h-[88vh] max-w-[min(1120px,calc(100%-24px))] gap-0 overflow-hidden rounded-xl p-0 sm:max-w-[min(1120px,calc(100%-48px))]">
                <DialogHeader className="relative flex min-h-[72px] items-center justify-center border-b border-gray-100 px-5 py-4 sm:px-8">
                  <DialogTitle className="text-lg font-bold text-gray-900">Tất cả bộ lọc</DialogTitle>
                  <DialogClose
                    aria-label="Đóng bộ lọc"
                    className="absolute right-4 top-1/2 inline-flex h-10 -translate-y-1/2 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <X size={16} /> Đóng
                  </DialogClose>
                </DialogHeader>

                <form onSubmit={applyFilters} className="flex max-h-[calc(88vh-72px)] flex-col">
                  <div className="space-y-7 overflow-y-auto px-5 py-6 sm:px-8">
                    <section aria-labelledby="filter-brands-heading">
                      <h3 id="filter-brands-heading" className="mb-3 text-base font-bold text-gray-800">Thương hiệu</h3>
                      {brands.isPending ? (
                        <p role="status" className="py-4 text-sm text-gray-500">Đang tải thương hiệu…</p>
                      ) : brands.isError ? (
                        <div role="alert" className="py-3 text-sm text-red-700">
                          Không thể tải thương hiệu. <button type="button" onClick={() => void brands.refetch()} className="font-semibold underline">Thử lại</button>
                        </div>
                      ) : brands.data?.length ? (
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                          {brands.data.map((item) => (
                            <FilterChoice
                              key={item._id}
                              selected={draft.brand === item._id}
                              onClick={() => updateDraft({ brand: draft.brand === item._id ? "" : item._id })}
                            >
                              <BrandLogo brand={item} />
                            </FilterChoice>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Chưa có thương hiệu đang hoạt động.</p>
                      )}
                    </section>

                    <section aria-labelledby="filter-price-heading">
                      <h3 id="filter-price-heading" className="mb-3 text-base font-bold text-gray-800">Khoảng giá</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {PRICE_RANGES.map((range) => {
                          const selected = draft.minPrice === range.min && draft.maxPrice === range.max
                          return (
                            <FilterChoice
                              key={range.label}
                              selected={selected}
                              onClick={() => updateDraft(selected ? { minPrice: "", maxPrice: "" } : { minPrice: range.min, maxPrice: range.max })}
                            >
                              <span className="inline-flex min-h-11 items-center px-4">{range.label}</span>
                            </FilterChoice>
                          )
                        })}
                      </div>
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-[#3988e9]">Hoặc nhập khoảng giá phù hợp</p>
                        <div className="grid max-w-xl grid-cols-2 gap-3">
                          <label className="grid gap-1 text-xs text-gray-500">
                            Giá từ (₫)
                            <input
                              id="store-min-price"
                              type="number"
                              min="0"
                              step="1000"
                              inputMode="numeric"
                              value={draft.minPrice}
                              onChange={(event) => updateDraft({ minPrice: event.target.value })}
                              placeholder="Thấp nhất"
                              className="h-11 min-w-0 rounded-lg border border-gray-200 px-3 text-sm text-gray-800"
                            />
                          </label>
                          <label className="grid gap-1 text-xs text-gray-500">
                            Giá đến (₫)
                            <input
                              id="store-max-price"
                              type="number"
                              min="0"
                              step="1000"
                              inputMode="numeric"
                              value={draft.maxPrice}
                              onChange={(event) => updateDraft({ maxPrice: event.target.value })}
                              placeholder="Cao nhất"
                              className="h-11 min-w-0 rounded-lg border border-gray-200 px-3 text-sm text-gray-800"
                            />
                          </label>
                        </div>
                      </div>
                    </section>

                    <section aria-labelledby="filter-categories-heading">
                      <h3 id="filter-categories-heading" className="mb-3 text-base font-bold text-gray-800">Danh mục sản phẩm</h3>
                      {categories.isPending ? (
                        <p role="status" className="py-3 text-sm text-gray-500">Đang tải danh mục…</p>
                      ) : categories.isError ? (
                        <div role="alert" className="py-3 text-sm text-red-700">
                          Không thể tải danh mục. <button type="button" onClick={() => void categories.refetch()} className="font-semibold underline">Thử lại</button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2.5">
                          <FilterChoice selected={!draft.category} onClick={() => updateDraft({ category: "" })}>
                            <span className="inline-flex min-h-11 items-center px-4">Tất cả danh mục</span>
                          </FilterChoice>
                          {categories.data?.map((item) => (
                            <FilterChoice
                              key={item._id}
                              selected={draft.category === item._id}
                              onClick={() => updateDraft({ category: draft.category === item._id ? "" : item._id })}
                            >
                              <span className="inline-flex min-h-11 items-center px-4">{categoryLabel(item)}</span>
                            </FilterChoice>
                          ))}
                        </div>
                      )}
                    </section>
                    {filterError && <p role="alert" className="text-sm text-red-700">{filterError}</p>}
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:justify-between sm:px-8">
                    <button type="button" onClick={clearFilters} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      <RotateCcw size={15} /> Xóa bộ lọc
                    </button>
                    <button type="submit" className="h-11 rounded-lg bg-[#55b000] px-7 text-sm font-semibold text-white transition hover:bg-[#469500]">
                      Xem {query.data?.pagination.total ?? ""} sản phẩm
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {brands.data?.length ? (
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1" aria-label="Lọc nhanh theo thương hiệu">
                {brands.data.map((item) => (
                  <FilterChoice
                    key={item._id}
                    selected={brand === item._id}
                    onClick={() => chooseQuickBrand(item._id)}
                  >
                    <BrandLogo brand={item} compact />
                  </FilterChoice>
                ))}
              </div>
            ) : brands.isError ? (
              <p role="alert" className="text-sm text-red-700">Không thể tải thương hiệu.</p>
            ) : null}
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500">Đang lọc:</span>
              {brand && brands.data?.find((item) => item._id === brand) && (
                <span className="rounded-full bg-[#f2f8ec] px-3 py-1 text-xs font-medium text-[#3e8011]">
                  {brands.data.find((item) => item._id === brand)?.name}
                </span>
              )}
              {category && categories.data?.find((item) => item._id === categoryId) && (
                <span className="rounded-full bg-[#f2f8ec] px-3 py-1 text-xs font-medium text-[#3e8011]">
                  {categories.data.find((item) => item._id === categoryId)?.name}
                </span>
              )}
              {(minPriceParam || maxPriceParam) && (
                <span className="rounded-full bg-[#f2f8ec] px-3 py-1 text-xs font-medium text-[#3e8011]">
                  {minPriceParam ? `${Number(minPriceParam).toLocaleString("vi-VN")} ₫` : "0 ₫"}
                  {" – "}
                  {maxPriceParam ? `${Number(maxPriceParam).toLocaleString("vi-VN")} ₫` : "Không giới hạn"}
                </span>
              )}
              <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#438e00]">
                <RotateCcw size={15} /> Xóa bộ lọc
              </button>
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {query.isSuccess ? (
            <p className="text-sm text-gray-500">{query.data.pagination.total} sản phẩm</p>
          ) : <span aria-hidden="true" />}
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Sắp xếp theo:
            <select value={sort} onChange={(event) => updateSort(event.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 font-medium text-gray-800">
              <option value="newest">Mới nhất</option>
              <option value="name">Tên A–Z</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </label>
        </div>

        {query.isPending ? (
          <p role="status" className="py-12 text-center text-gray-500">Đang tải sản phẩm…</p>
        ) : query.isError ? (
          <div role="alert" className="py-12 text-center">
            <p>{getApiError(query.error).message}</p>
            <button type="button" onClick={() => void query.refetch()} className="mt-3 font-semibold text-[#438e00]">Thử lại</button>
          </div>
        ) : (
          <>
            {selectedCategoryInvalid ? (
              <p role="alert">Danh mục không khả dụng. Vui lòng chọn danh mục khác.</p>
            ) : query.data.data.length ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {query.data.data.map((product) => <ProductCard key={product._id} product={mapCatalogProduct(product)} />)}
              </div>
            ) : (
              <p className="py-12 text-center text-gray-500">Không tìm thấy sản phẩm phù hợp với bộ lọc.</p>
            )}
            <ListPagination
              label="Phân trang sản phẩm"
              page={page}
              totalPages={Math.max(1, query.data.pagination.totalPages)}
              disabled={query.isFetching}
              onPageChange={(nextPage) => setParams((previous) => {
                const updated = new URLSearchParams(previous)
                updated.set("page", String(nextPage))
                return updated
              })}
            />
          </>
        )}
      </div>
    </div>
  )
}
