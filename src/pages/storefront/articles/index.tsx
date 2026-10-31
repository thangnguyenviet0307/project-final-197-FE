import { ArrowUpRight, ChevronRight, Search } from "lucide-react"
import { Link, useLocation, useSearchParams } from "react-router-dom"
import { useValidListPage } from "@/hooks/use-valid-list-page"
import { useArticleCatalog, usePublicArticleCategories } from "@/features/storefront/hooks/use-public-articles"
import { ArticleCover, ArticleMeta } from "@/features/storefront/components/article-preview"
import { ArticleSidebar } from "@/features/storefront/components/article-sidebar"
import { ListPagination } from "@/components/list-pagination"
import { getApiError } from "@/services/api"

export default function StorefrontArticlesPage() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const returnTo = location.pathname + location.search
  const type = params.get("type") === "blog" ? "blog" : "news"
  const requested = Number(params.get("page"))
  const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1
  const search = params.get("search") ?? ""
  const rawCategory = params.get("categoryId") ?? ""
  const categoryId = /^[a-f\d]{24}$/i.test(rawCategory) ? rawCategory : ""
  const categories = usePublicArticleCategories()
  const category = categories.data?.find(item => item._id === categoryId)
  const query = useArticleCatalog(type, page, search, categoryId)
  useValidListPage(page, query)
  const title = category?.name ?? (type === "news" ? "Tin tức mới nhất" : "Góc chia sẻ & Blog")
  const categoryLink = (id: string) => {
    const next = new URLSearchParams({ type })
    if (search) next.set("search", search)
    if (id) next.set("categoryId", id)
    return `/bai-viet?${next}`
  }
  return <main className="bg-[#f6f8f4] text-gray-900">
    <div className="store-container space-y-6 py-6 sm:py-10">
      <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#4d9210]">Trang chủ</Link><ChevronRight size={14} aria-hidden="true" /><span>{type === "news" ? "Tin tức" : "Blog"}</span>{category && <><ChevronRight size={14} aria-hidden="true" /><span className="text-gray-900">{category.name}</span></>}
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-5">
        <nav aria-label="Loại bài viết" className="inline-flex gap-1 rounded-2xl border border-gray-200 bg-white p-1">
          {([['news', 'Tin tức', '/bai-viet'], ['blog', 'Blog', '/bai-viet?type=blog']] as const).map(([value, label, href]) => <Link key={value} to={href} aria-current={type === value ? "page" : undefined} className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors ${type === value ? "bg-[#4d9210] text-white" : "text-gray-600 hover:bg-[#f0f6e9]"}`}>{label}</Link>)}
        </nav>
        <form className="flex w-full gap-2 sm:w-auto" onSubmit={event => {
          event.preventDefault()
          const value = String(new FormData(event.currentTarget).get("search") ?? "").trim()
          setParams({ type, ...(categoryId ? { categoryId } : {}), ...(value ? { search: value } : {}) })
        }}>
          <div className="relative min-w-0 flex-1"><Search size={17} aria-hidden="true" className="absolute left-3.5 top-3.5 text-gray-400" /><input key={`${type}:${search}`} aria-label="Tìm tin tức" name="search" maxLength={120} placeholder="Tìm bài viết…" className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#4d9210] focus:ring-2 focus:ring-[#4d9210]/15 sm:w-64" defaultValue={search} /></div>
          <button type="submit" className="shrink-0 rounded-xl bg-[#4d9210] px-4 text-sm font-semibold text-white hover:bg-[#3d760c]">Tìm kiếm</button>
        </form>
      </div>
      <nav aria-label="Danh mục bài viết" className="flex flex-wrap gap-2">
        <Link to={categoryLink("")} aria-current={!categoryId ? "page" : undefined} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${!categoryId ? "border-[#4d9210] bg-[#edf5e5] text-[#4d9210]" : "border-gray-200 bg-white text-gray-600 hover:border-[#4d9210]"}`}>Tất cả</Link>
        {categories.data?.map(item => <Link key={item._id} to={categoryLink(item._id)} aria-current={categoryId === item._id ? "page" : undefined} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${categoryId === item._id ? "border-[#4d9210] bg-[#edf5e5] text-[#4d9210]" : "border-gray-200 bg-white text-gray-600 hover:border-[#4d9210]"}`}>{item.name}</Link>)}
        {categories.isPending && <span role="status" className="p-2 text-sm text-gray-500">Đang tải danh mục…</span>}
        {categories.isError && <button type="button" onClick={() => void categories.refetch()} className="text-sm text-[#4d9210] underline">Thử tải lại danh mục</button>}
      </nav>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Danh sách bài viết" className="min-w-0 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-6 sm:px-6"><h1 className="text-2xl font-bold tracking-tight">{title}</h1>{query.isSuccess && <span className="text-sm text-gray-500">{query.data.pagination.total} bài viết</span>}</header>
          {query.isPending ? <p role="status" className="p-6 text-gray-500">Đang tải bài viết…</p> : query.isError ? <div role="alert" className="space-y-3 p-6"><p>{getApiError(query.error).message}</p><button type="button" onClick={() => void query.refetch()} className="font-semibold text-[#4d9210] underline">Thử lại</button></div> : <>
            {!query.data.data.length ? <p className="p-8 text-gray-500">Chưa có bài viết phù hợp.</p> : <div className="divide-y divide-gray-100 px-5 sm:px-6">{query.data.data.map(article => <article key={article._id} className="py-6"><Link to={`/bai-viet/${encodeURIComponent(article.slug)}`} state={{ returnTo }} className="group grid gap-5 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
              <ArticleCover src={article.imageUrl} className="aspect-[16/10] w-full" />
              <div className="min-w-0 space-y-3">{article.category && <p className="text-xs font-semibold uppercase tracking-wide text-[#4d9210]">{article.category}</p>}<h2 className="text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#4d9210]">{article.title}</h2>{article.excerpt && <p className="line-clamp-3 text-sm leading-6 text-gray-600">{article.excerpt}</p>}<ArticleMeta article={article} /><span className="inline-flex items-center gap-1 text-sm font-semibold text-[#4d9210]">Đọc tiếp<ArrowUpRight size={15} aria-hidden="true" /></span></div>
            </Link></article>)}</div>}
            <div className="border-t border-gray-100 p-5"><ListPagination label="Phân trang tin tức" page={page} totalPages={Math.max(1, query.data.pagination.totalPages)} disabled={query.isFetching} onPageChange={next => setParams(previous => { const updated = new URLSearchParams(previous); updated.set("page", String(next)); return updated })} /></div>
          </>}
        </section>
        <ArticleSidebar type={type} returnTo={returnTo} />
      </div>
    </div>
  </main>
}
