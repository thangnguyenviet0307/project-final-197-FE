import { useState } from "react"
import { Star } from "lucide-react"
import { useStoreMetrics, useStoreReviews } from "@/features/storefront/hooks/use-store-products"
import { ListPagination } from "@/components/list-pagination"
import type { Product } from "@/features/products/types/products"
import { WriteProductReview } from "@/features/storefront/components/write-product-review"

export function RatingStars({ rating }: { rating: number }) {
  return <span className="inline-flex gap-0.5 text-amber-400" role="img" aria-label={`${rating} trên 5 sao`}>{[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} className={rating >= star ? "fill-current" : "text-gray-200"} />)}</span>
}
export function StoreRatingSummary({ slug }: { slug: string }) {
  const query = useStoreMetrics(slug)
  if (query.isPending) return <p role="status" className="text-sm text-gray-500">Đang tải điểm đánh giá…</p>
  if (query.isError) return <button onClick={() => void query.refetch()} className="text-sm text-gray-500 underline">Tải lại điểm đánh giá</button>
  return <div className="flex flex-wrap items-center gap-3 text-sm"><RatingStars rating={query.data.rating} /><span className="font-semibold">{query.data.reviewCount ? query.data.rating.toFixed(1) : "Chưa có đánh giá"}</span><a href="#product-reviews" className="text-gray-500 underline underline-offset-4">{query.data.reviewCount} đánh giá</a><span className="text-gray-300">|</span><span className="text-gray-500">Đã bán {query.data.soldCount}</span></div>
}
export function StoreRatingBreakdown({ slug }: { slug: string }) {
  const query = useStoreMetrics(slug)
  if (query.isPending) return <p role="status" className="mb-6 text-sm text-gray-500">Đang tải thống kê đánh giá…</p>
  if (query.isError) return <div role="alert" className="mb-6 text-sm text-gray-500">Không thể tải thống kê đánh giá. <button onClick={() => void query.refetch()} className="font-medium text-[#4d9210] underline">Thử lại</button></div>
  const { rating, reviewCount, ratingDistribution } = query.data
  const positive = (ratingDistribution?.[4] ?? 0) + (ratingDistribution?.[5] ?? 0)
  return <div aria-label="Thống kê đánh giá" className="mb-8 grid gap-6 rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-10">
    <div className="flex flex-col items-center justify-center gap-3 text-center"><div className="flex items-baseline gap-2"><Star size={26} className="self-center fill-amber-400 text-amber-400" /><span className="text-5xl font-bold tracking-tight text-gray-900">{reviewCount ? rating.toFixed(1) : "0.0"}</span><span className="text-lg text-gray-400">/5</span></div><p className="text-sm font-medium text-gray-600">{reviewCount.toLocaleString("vi-VN")} đánh giá</p>{ratingDistribution && <p className="text-xs text-gray-500">{positive.toLocaleString("vi-VN")} đánh giá tích cực (4–5 sao)</p>}</div>
    <div className="space-y-2.5">{ratingDistribution ? ([5, 4, 3, 2, 1] as const).map(star => {
      const count = ratingDistribution[star]
      const percent = reviewCount ? Math.round(count / reviewCount * 1000) / 10 : 0
      return <div key={star} className="flex items-center gap-3 text-sm"><span className="flex w-9 shrink-0 items-center gap-1"><Star size={15} className="fill-amber-400 text-amber-400" />{star}</span><div role="progressbar" aria-label={`${star} sao`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${count} đánh giá, ${percent}%`} className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-[#3284ea] transition-[width]" style={{ width: `${percent}%` }} /></div><span className="w-14 text-right font-semibold text-gray-700">{percent}%</span></div>
    }) : <p className="text-sm text-gray-500">Chưa có dữ liệu phân bố số sao.</p>}</div>
  </div>
}
export function StoreProductReviews({ product }: { product: Product }) {
  const slug = product.slug ?? ""
  const [page, setPage] = useState(1)
  const query = useStoreReviews(slug, page)
  return <section id="product-reviews" className="scroll-mt-24 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
    <h2 className="mb-6 text-2xl font-bold">Đánh giá sản phẩm</h2>
    <StoreRatingBreakdown slug={slug} />
    {query.isPending ? <p role="status">Đang tải đánh giá…</p> : query.isError ? <div role="alert"><p>Không thể tải đánh giá.</p><button onClick={() => void query.refetch()} className="mt-2 text-sm font-semibold text-[#4d9210]">Thử lại</button></div> : <>
      {query.data.data.length ? <div className="divide-y divide-gray-100">{query.data.data.slice(0, 5).map((review, index) => <article key={`${page}-${index}`} className="py-5 first:pt-0"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#edf5e6] font-semibold text-[#4d9210]">{review.reviewerName.trim().slice(0, 1).toLocaleUpperCase("vi") || "K"}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="break-words font-semibold">{review.reviewerName}</h3><RatingStars rating={review.rating} /></div><p className="mt-1 text-xs text-gray-400">{review.date && !Number.isNaN(Date.parse(review.date)) ? new Date(review.date).toLocaleDateString("vi-VN") : "Chưa có ngày"} · {review.source === "storefront" ? "Người dùng gửi" : review.source === "dummyjson" ? "Nhập từ DummyJSON" : "Quản trị viên ghi nhận"}</p><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">{review.comment}</p></div></div></article>)}</div> : <div className="rounded-2xl bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">Sản phẩm chưa có đánh giá nào.</div>}
      {query.data.pagination.totalPages > 1 && <ListPagination label="Phân trang đánh giá" page={page} totalPages={query.data.pagination.totalPages} disabled={query.isFetching} onPageChange={setPage} />}
    </>}
    <WriteProductReview product={product} onSubmitted={() => setPage(1)} />
  </section>
}
