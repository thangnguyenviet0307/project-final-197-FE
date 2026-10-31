import { useState } from "react"
import { CalendarDays, Eye, Newspaper, UserRound } from "lucide-react"
import type { PublicArticleSummary } from "@/features/storefront/types/article"

export function ArticleCover({ src, className = "" }: { src: string | null; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null)
  return <div className={`relative overflow-hidden rounded-2xl bg-[#eef3e9] ${className}`}>
    {src && failed !== src ? <img src={src} alt="" loading="lazy" onError={() => setFailed(src)} className="absolute inset-0 size-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
      : <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#e7f0de] to-[#f5f8f1]"><Newspaper className="size-10 text-[#85a16a]" strokeWidth={1.3} /></div>}
  </div>
}

export function ArticleViews({ count }: { count: number }) {
  if (!Number.isSafeInteger(count) || count < 0) return null
  return <span className="inline-flex items-center gap-1.5"><Eye size={14} aria-hidden="true" />{new Intl.NumberFormat("vi-VN").format(count)} lượt xem</span>
}

export function ArticleMeta({ article }: { article: PublicArticleSummary }) {
  const date = article.publishedAt ? new Date(article.publishedAt) : null
  return <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs leading-5 text-gray-500">
    {date && Number.isFinite(date.getTime()) && <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" /><time dateTime={article.publishedAt!}>{date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</time></span>}
    {article.authorName && <span className="inline-flex items-center gap-1.5"><UserRound size={14} aria-hidden="true" />{article.authorName}</span>}
    <ArticleViews count={article.viewCount} />
  </div>
}
