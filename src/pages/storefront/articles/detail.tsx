import { ArrowLeft, CalendarDays, Newspaper } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { usePublicArticle } from "@/features/storefront/hooks/use-public-articles"
import { getApiError } from "@/services/api"

export default function StorefrontArticleDetailPage() {
  const { slug = "" } = useParams()
  const article = usePublicArticle(slug)

  if (article.isPending) {
    return <main className="store-container py-16"><p role="status" className="text-center text-sm text-gray-500">Đang tải bài viết...</p></main>
  }

  if (article.isError) {
    return (
      <main className="store-container py-16">
        <div role="alert" className="mx-auto max-w-xl space-y-4 text-center">
          <p className="text-gray-700">Không thể tải bài viết. {getApiError(article.error).message}</p>
          <div className="flex justify-center gap-4">
            <button type="button" className="font-semibold text-[#4d9210] underline" onClick={() => void article.refetch()}>Thử tải lại</button>
            <Link to="/" className="font-semibold text-[#4d9210] underline">Về trang chủ</Link>
          </div>
        </div>
      </main>
    )
  }

  const post = article.data
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })
    : null

  return (
    <main className="store-container py-10 sm:py-16">
      <article className="mx-auto max-w-4xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#4d9210] hover:underline">
          <ArrowLeft size={16} aria-hidden="true" />
          Về trang chủ
        </Link>
        <header>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#57952b]">
            <Newspaper size={15} aria-hidden="true" />
            {post.category}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-950 sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
            <span>{post.authorName}</span>
            {publishedDate && <span className="inline-flex items-center gap-2"><CalendarDays size={15} aria-hidden="true" />{publishedDate}</span>}
          </div>
        </header>
        {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="mt-8 aspect-[16/9] w-full rounded-lg object-cover" />}
        <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8 text-gray-800">{post.content}</div>
        {post.tags.length > 0 && (
          <ul aria-label="Thẻ bài viết" className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => <li key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{tag}</li>)}
          </ul>
        )}
      </article>
    </main>
  )
}
