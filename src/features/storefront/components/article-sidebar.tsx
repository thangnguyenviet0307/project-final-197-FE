import { Link } from "react-router-dom"
import { ArrowUpRight, Clock3, TrendingUp } from "lucide-react"
import { useArticleSidebar } from "@/features/storefront/hooks/use-public-articles"
import { ArticleCover, ArticleViews } from "@/features/storefront/components/article-preview"
import type { ArticleType } from "@/features/storefront/types/article"
import { getApiError } from "@/services/api"

export function ArticleSidebar({ type, returnTo }: { type: ArticleType; returnTo: string }) {
  const popular = useArticleSidebar(type, "popular")
  const latest = useArticleSidebar(type, "newest")
  return <aside aria-label="Gợi ý đọc bài" className="space-y-6">
    <section aria-label="Bạn đọc xem nhiều" className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <h2 className="flex items-center gap-2 border-b border-gray-100 px-5 py-5 text-lg font-bold text-gray-950"><TrendingUp size={20} className="text-[#4d9210]" />Bạn đọc xem nhiều</h2>
      {popular.isPending ? <p role="status" className="p-5 text-sm text-gray-500">Đang tải bài được đọc nhiều…</p> : popular.isError ? <div role="alert" className="space-y-2 p-5 text-sm text-gray-600"><p>{getApiError(popular.error).message}</p><button type="button" className="font-semibold text-[#4d9210] underline" onClick={() => void popular.refetch()}>Thử lại bài đọc nhiều</button></div> : !popular.data.data.length ? <p className="p-5 text-sm text-gray-500">Chưa có bài viết được công bố.</p> : <ol className="divide-y divide-gray-100 px-5">{popular.data.data.map((article, index) => <li key={article._id} className="py-5"><Link to={`/bai-viet/${encodeURIComponent(article.slug)}`} state={{ returnTo }} className="group flex gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#f0f6e9] text-base font-bold tabular-nums text-[#4d9210]">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><h3 className="text-sm font-semibold leading-6 text-gray-800 group-hover:text-[#4d9210]">{article.title}</h3><div className="mt-2 text-xs text-gray-500"><ArticleViews count={article.viewCount} /></div></div></Link></li>)}</ol>}
    </section>
    <section aria-label="Bài mới nhất" className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-950"><Clock3 size={20} className="text-[#4d9210]" />{type === "news" ? "Tin mới nhất" : "Blog mới nhất"}</h2>
      {latest.isPending ? <p role="status" className="text-sm text-gray-500">Đang tải bài mới…</p> : latest.isError ? <div role="alert" className="space-y-2 text-sm text-gray-600"><p>{getApiError(latest.error).message}</p><button type="button" className="font-semibold text-[#4d9210] underline" onClick={() => void latest.refetch()}>Thử lại bài mới</button></div> : !latest.data.data.length ? <p className="text-sm text-gray-500">Chưa có bài mới.</p> : <ul className="space-y-5">{latest.data.data.map((article, index) => <li key={article._id}><Link to={`/bai-viet/${encodeURIComponent(article.slug)}`} state={{ returnTo }} className="group block">
        <ArticleCover src={article.imageUrl} className={index === 0 ? "mb-3 aspect-[16/10] w-full" : "float-left mr-3 mt-1 h-16 w-20 rounded-xl"} />
        <h3 className="text-sm font-semibold leading-6 text-gray-800 group-hover:text-[#4d9210]">{article.title}</h3><span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#4d9210]">Đọc bài viết<ArrowUpRight size={13} aria-hidden="true" /></span><div className="clear-both" />
      </Link></li>)}</ul>}
    </section>
  </aside>
}
