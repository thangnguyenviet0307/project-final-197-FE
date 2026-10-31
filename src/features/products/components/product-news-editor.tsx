import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useArticles } from "@/features/articles/hooks/use-articles"
import { useProductNews, useUpdateProductNews } from "@/features/products/hooks/use-product-news"
import type { ProductNewsSelection, ProductNewsArticle } from "@/features/products/types/product-news"
import { useUnsavedForm } from "@/hooks/use-unsaved-form"
import { getApiError } from "@/services/api"

function NewsSelectionForm({ id, initial, reload }: { id: string; initial: ProductNewsSelection; reload: () => Promise<void> }) {
  const [base, setBase] = useState(initial)
  const [ids, setIds] = useState(initial.articleIds)
  const [titles, setTitles] = useState(() => new Map(initial.articles.map(article => [article._id, article])))
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [error, setError] = useState("")
  const [conflict, setConflict] = useState(false)
  const mutation = useUpdateProductNews()
  const choices = useArticles({ page, limit: 10, type: "news", search: search || undefined })
  const dirty = JSON.stringify(ids) !== JSON.stringify(base.articleIds)
  const navigation = useUnsavedForm(dirty)
  function select(article: ProductNewsArticle) {
    setTitles(previous => new Map(previous).set(article._id, article))
    setIds(previous => previous.includes(article._id) ? previous.filter(id => id !== article._id) : previous.length < 5 ? [...previous, article._id] : previous)
  }
  function move(index: number, offset: number) {
    setIds(previous => { const next = [...previous]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; return next })
  }
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Chọn tối đa 5 tin, theo thứ tự hiển thị. Tin nháp, chưa đến lịch, bị ẩn hoặc thuộc danh mục không hoạt động sẽ không xuất hiện trên cửa hàng.</p>
    <fieldset disabled={mutation.isPending || conflict} className="space-y-4">
      <ol aria-label="Tin đã chọn" className="space-y-2">{ids.map((id, index) => <li key={id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3"><span className="min-w-0 flex-1 break-words text-sm">{titles.get(id)?.title ?? `Tin không còn khả dụng (${id})`}</span><Button type="button" variant="outline" size="sm" disabled={index === 0} aria-label={`Đưa tin ${index + 1} lên`} onClick={() => move(index, -1)}>Lên</Button><Button type="button" variant="outline" size="sm" disabled={index === ids.length - 1} aria-label={`Đưa tin ${index + 1} xuống`} onClick={() => move(index, 1)}>Xuống</Button><Button type="button" variant="outline" size="sm" aria-label={`Bỏ tin ${index + 1}`} onClick={() => setIds(previous => previous.filter(value => value !== id))}>Bỏ chọn</Button></li>)}</ol>
      {!ids.length && <p className="text-sm text-muted-foreground">Chưa chọn tin tức nào cho sản phẩm.</p>}
      <form className="flex gap-2" onSubmit={event => { event.preventDefault(); setSearch(String(new FormData(event.currentTarget).get("newsSearch") ?? "").trim()); setPage(1) }}><Input name="newsSearch" aria-label="Tìm tin để gắn sản phẩm" maxLength={120} placeholder="Tìm tin tức…" /><Button type="submit" variant="outline">Tìm tin</Button></form>
      {choices.isPending ? <p role="status">Đang tải danh sách tin…</p> : choices.isError ? <p role="alert">{getApiError(choices.error).message} <Button type="button" onClick={() => void choices.refetch()}>Thử lại danh sách tin</Button></p> : <>
        {!choices.data.data.length && <p className="text-sm text-muted-foreground">Không tìm thấy tin tức.</p>}
        <div className="space-y-2">{choices.data.data.map(article => <label key={article._id} className="flex gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" checked={ids.includes(article._id)} disabled={!ids.includes(article._id) && ids.length >= 5} onChange={() => select(article)} /><span className="min-w-0 break-words">{article.title}<span className="ml-2 text-xs text-muted-foreground">({article.status})</span></span></label>)}</div>
        <div className="flex items-center gap-3"><Button type="button" variant="outline" disabled={page <= 1 || choices.isFetching} onClick={() => setPage(value => value - 1)}>Tin trước</Button><span className="text-sm">Trang {page}</span><Button type="button" variant="outline" disabled={page >= choices.data.pagination.totalPages || choices.isFetching} onClick={() => setPage(value => value + 1)}>Tin sau</Button></div>
      </>}
    </fieldset>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-2"><Button type="button" disabled={!dirty || mutation.isPending || conflict} onClick={async () => {
      setError("")
      try { const result = await mutation.mutateAsync({ id, input: { articleIds: ids, expectedVersion: base.expectedVersion } }); setBase({ ...base, ...result }) }
      catch (failure) { const apiError = getApiError(failure); setError(apiError.message); setConflict(apiError.code === "VERSION_CONFLICT") }
    }}>Lưu tin liên quan</Button><Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => void reload().catch(failure => setError(getApiError(failure).message))}>Tải lại tin đã lưu (bỏ thay đổi)</Button></div>
    {navigation.guard}
  </div>
}

export function ProductNewsEditor({ id }: { id: string }) {
  const query = useProductNews(id)
  const [revision, setRevision] = useState(0)
  const [reloaded, setReloaded] = useState<ProductNewsSelection | null>(null)
  return <section className="space-y-4 rounded-xl border p-4"><h2 className="text-lg font-semibold">Tin tức liên quan của sản phẩm</h2>
    {!query.data && query.isPending ? <p role="status">Đang tải tin đã chọn…</p> : !query.data ? <p role="alert">{getApiError(query.error).message} <Button type="button" onClick={() => void query.refetch()}>Thử lại tin đã chọn</Button></p> : <NewsSelectionForm key={revision} id={id} initial={reloaded ?? query.data} reload={async () => {
      const result = await query.refetch({ throwOnError: true })
      if (!result.data) throw new Error("Không tải được tin đã chọn")
      setReloaded(result.data)
      setRevision(value => value + 1)
    }} />}
  </section>
}
