import { Link } from "react-router-dom"
import { usePublicProductNews } from "@/features/products/hooks/use-product-news"
import { ProductImage } from "@/features/products/components/product-image"
import { getApiError } from "@/services/api"

export function ProductNewsSidebar({ slug }: { slug: string }) {
  const query = usePublicProductNews(slug)
  return <aside aria-label="Tin tức liên quan" className="h-fit rounded-3xl border border-gray-100 bg-white p-5 shadow-sm xl:sticky xl:top-6">
    <h2 className="mb-5 text-lg font-bold text-gray-900">Tin tức liên quan</h2>
    {query.isPending ? <p role="status" className="text-sm text-gray-500">Đang tải tin tức…</p> : query.isError ? <div role="alert" className="space-y-2 text-sm text-gray-600"><p>{getApiError(query.error).message}</p><button type="button" className="text-[#4d9210] underline" onClick={() => void query.refetch()}>Thử lại tin tức</button></div> : !query.data.length ? <p className="text-sm text-gray-500">Chưa có tin tức liên quan.</p> : <ul className="divide-y divide-gray-100">{query.data.map(article => <li key={article._id} className="py-4 first:pt-0 last:pb-0">
      <Link to={`/bai-viet/${encodeURIComponent(article.slug)}`} className="group flex gap-3">
        <ProductImage src={article.imageUrl} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0"><h3 className="line-clamp-3 text-sm font-semibold leading-5 text-gray-900 group-hover:text-[#4d9210]">{article.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{article.excerpt}</p></div>
      </Link>
    </li>)}</ul>}
  </aside>
}
