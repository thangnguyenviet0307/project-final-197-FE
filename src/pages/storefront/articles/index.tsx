import { useValidListPage } from "@/hooks/use-valid-list-page"
import { Link, useSearchParams } from "react-router-dom"
import { useArticleCatalog } from "@/features/storefront/hooks/use-public-articles"
import { ListPagination } from "@/components/list-pagination"
import { getApiError } from "@/services/api"
export default function StorefrontArticlesPage() {
  const [params, setParams] = useSearchParams()
  const type = params.get("type") === "blog" ? "blog" : "news"
  const requested = Number(params.get("page"))
  const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1
  const query = useArticleCatalog(type, page, params.get("search") ?? "", "")
  useValidListPage(page, query)
  return <main className="store-container space-y-6 py-10 text-gray-900"><Link to="/" className="text-sm text-[#4d9210]">Trang chủ</Link><h1 className="text-3xl font-bold">Tin tức & Blog</h1>
    <div className="flex flex-wrap items-center gap-4"><Link aria-current={type === "news" ? "page" : undefined} className={type === "news" ? "font-bold text-[#4d9210]" : "text-gray-600"} to="/bai-viet">Tin tức</Link><Link aria-current={type === "blog" ? "page" : undefined} className={type === "blog" ? "font-bold text-[#4d9210]" : "text-gray-600"} to="/bai-viet?type=blog">Blog</Link><form className="flex gap-2" onSubmit={e => { e.preventDefault(); const search = String(new FormData(e.currentTarget).get("search") ?? "").trim(); setParams({ type, ...(search ? { search } : {}) }) }}><input key={`${type}:${params.get("search") ?? ""}`} aria-label="Tìm tin tức" name="search" maxLength={120} placeholder="Tìm bài viết…" className="rounded-lg border border-gray-200 bg-white px-3 py-2" defaultValue={params.get("search") ?? ""} /><button type="submit" className="rounded-lg bg-[#4d9210] px-4 text-white">Tìm kiếm</button></form></div>
    {query.isPending ? <p role="status">Đang tải bài viết…</p> : query.isError ? <div role="alert"><p>{getApiError(query.error).message}</p><button onClick={() => void query.refetch()} className="text-[#4d9210] underline">Thử lại</button></div> : <>
      {!query.data.data.length ? <p>Chưa có bài viết phù hợp.</p> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{query.data.data.map(article => <article key={article._id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white"><Link to={`/bai-viet/${encodeURIComponent(article.slug)}`}>{article.imageUrl && <img loading="lazy" src={article.imageUrl} alt="" className="aspect-video w-full object-cover" />}<div className="space-y-2 p-5"><p className="text-xs text-[#4d9210]">{article.category}</p><h2 className="text-lg font-semibold">{article.title}</h2><p className="text-sm text-gray-600">{article.excerpt}</p></div></Link></article>)}</div>}
      <ListPagination label="Phân trang tin tức" page={page} totalPages={Math.max(1, query.data.pagination.totalPages)} disabled={query.isFetching} onPageChange={next => setParams(previous => { const updated = new URLSearchParams(previous); updated.set("page", String(next)); return updated })} />
    </>}
  </main>
}
