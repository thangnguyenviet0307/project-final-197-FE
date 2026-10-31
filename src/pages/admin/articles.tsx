import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { BaseLayout } from "@/layout/admin/base-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ListPagination } from "@/components/list-pagination"
import { useArticles, usePostCategories, useArticleMutations } from "@/features/articles/hooks/use-articles"
import { ArticleForm } from "@/features/articles/components/article-form"
import { getArticle } from "@/features/articles/services/articles.service"
import type { ArticleInput } from "@/features/articles/schemas/article-schema"
import type { AdminArticle, ArticleStatus } from "@/features/articles/types/articles"
import { getApiError } from "@/services/api"
import { ArticleEditorDialog } from "@/features/articles/components/article-editor-dialog"
import { useValidListPage } from "@/hooks/use-valid-list-page"
const statuses: Record<ArticleStatus, string> = { draft: "Bản nháp", published: "Xuất bản", scheduled: "Lên lịch", archived: "Lưu trữ / Ẩn" }
export default function AdminArticlesPage() {
  const [params, setParams] = useSearchParams()
  const requestedPage = Number(params.get("page"))
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const type = params.get("type")
  const status = params.get("status")
  const query = useArticles({ page, limit: 10, search: params.get("search") || undefined,
    type: type === "news" || type === "blog" ? type : undefined,
    status: status && status in statuses ? status as ArticleStatus : undefined,
    categoryId: /^[a-fA-F0-9]{24}$/.test(params.get("categoryId") ?? "") ? params.get("categoryId")! : undefined,
    isFeatured: params.get("featured") === "true" ? true : undefined,
  })
  useValidListPage(page, query)
  const categories = usePostCategories()
  const mutations = useArticleMutations()
  const [editing, setEditing] = useState<AdminArticle | "new" | null>(null)
  const [deleting, setDeleting] = useState<AdminArticle | null>(null)
  const [error, setError] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [loadingEditor, setLoadingEditor] = useState(false)
  const [revision, setRevision] = useState(0)
  const saving = mutations.create.isPending || mutations.update.isPending
  function filter(key: string, value: string) { setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); next.delete("page"); return next }) }
  async function edit(id: string) { setLoadingEditor(true); setError(""); try { setEditing(await getArticle(id)) } catch (failure) { setError(getApiError(failure).message) } finally { setLoadingEditor(false) } }
  return <BaseLayout title="Tin tức & Blog" description="Quản lý nội dung và chọn tin hiển thị trên cửa hàng."><div className="space-y-5 px-4 lg:px-6">
    <div className="flex flex-wrap gap-3"><Button onClick={() => setEditing("new")}>Thêm bài viết</Button><Link to="/auth/post-categories" className="rounded-md border px-4 py-2 text-sm">Quản lý danh mục bài viết</Link><Button variant="outline" onClick={() => void query.refetch()}>Làm mới</Button></div>
    <div className="flex flex-wrap gap-3"><form onSubmit={e => { e.preventDefault(); filter("search", String(new FormData(e.currentTarget).get("search") ?? "").trim()) }} className="flex gap-2"><Input key={params.get("search") ?? ""} name="search" aria-label="Tìm bài viết" maxLength={120} placeholder="Tìm tiêu đề, nội dung…" defaultValue={params.get("search") ?? ""} /><Button type="submit" variant="outline">Tìm kiếm</Button></form>
      <select aria-label="Lọc loại bài" className="rounded-md border bg-background p-2" value={type ?? ""} onChange={e => filter("type", e.target.value)}><option value="">Tất cả loại bài</option><option value="news">Tin tức</option><option value="blog">Blog</option></select>
      <select aria-label="Lọc trạng thái" className="rounded-md border bg-background p-2" value={status ?? ""} onChange={e => filter("status", e.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(statuses).map(([key, title]) => <option key={key} value={key}>{title}</option>)}</select>
      <select aria-label="Lọc danh mục bài" className="rounded-md border bg-background p-2" value={params.get("categoryId") ?? ""} onChange={e => filter("categoryId", e.target.value)}><option value="">Tất cả danh mục</option>{categories.data?.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={params.get("featured") === "true"} onChange={e => filter("featured", e.target.checked ? "true" : "")} />Bài đã chọn cho trang chủ</label>
    </div>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {query.isPending ? <p role="status">Đang tải bài viết…</p> : query.isError ? <p role="alert">{getApiError(query.error).message}<Button variant="outline" onClick={() => void query.refetch()}>Thử lại</Button></p> : <>
      {!query.data.data.length ? <p>Chưa có bài viết phù hợp.</p> : <div className="overflow-x-auto rounded-lg border"><table className="w-full text-left text-sm"><thead><tr>{["Tiêu đề", "Loại / Danh mục", "Trạng thái", "Trang chủ / Thứ tự", "Thao tác"].map(title => <th key={title} className="p-3">{title}</th>)}</tr></thead><tbody>{query.data.data.map(article => <tr key={article._id} className="border-t"><td className="max-w-sm break-words p-3 font-medium">{article.title}</td><td className="p-3">{article.type === "news" ? "Tin tức" : "Blog"}<br />{article.category}</td><td className="p-3">{statuses[article.status]}{article.status === "scheduled" && article.publishAt && <p className="text-xs">{new Date(article.publishAt).toLocaleString("vi-VN")}</p>}</td><td className="p-3">{article.isFeatured ? "Đã chọn" : "Không chọn"} / {article.sortOrder ?? 0}</td><td className="space-x-2 whitespace-nowrap p-3"><Button variant="outline" disabled={loadingEditor || query.isFetching} onClick={() => void edit(article._id)}>Sửa</Button><Button variant="destructive" disabled={query.isFetching} onClick={() => { setDeleteError(""); setDeleting(article) }}>Xóa</Button>{["published", "scheduled"].includes(article.status) && <a className="text-primary underline" href={`/bai-viet/${encodeURIComponent(article.slug)}`} target="_blank" rel="noopener noreferrer">Mở bài viết</a>}</td></tr>)}</tbody></table></div>}
      <ListPagination label="Phân trang bài viết" page={page} totalPages={Math.max(1, query.data.pagination.totalPages)} disabled={query.isFetching} onPageChange={value => setParams(previous => { const next = new URLSearchParams(previous); next.set("page", String(value)); return next })} />
    </>}
    {editing !== null && <ArticleEditorDialog key={editing === "new" ? "new" : `${editing._id}-${revision}`} pending={saving} close={() => setEditing(null)}>{onDirtyChange => <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{editing === "new" ? "Thêm bài viết" : "Sửa bài viết"}</DialogTitle><DialogDescription>Chỉ bài xuất bản đúng thời gian và thuộc danh mục đang bật mới xuất hiện công khai.</DialogDescription></DialogHeader>
      {categories.isPending ? <p role="status">Đang tải danh mục…</p> : categories.isError ? <p role="alert">Không tải được danh mục. <Button onClick={() => void categories.refetch()}>Thử lại</Button></p> : <ArticleForm article={editing === "new" ? undefined : editing} categories={categories.data} pending={saving} onDirtyChange={onDirtyChange} save={async input => {
        if (editing === "new") await mutations.create.mutateAsync(input as ArticleInput)
        else await mutations.update.mutateAsync({ id: editing._id, input: { ...input, expectedVersion: editing.__v } })
        setEditing(null)
      }} reload={async () => { if (editing !== "new") { setEditing(await getArticle(editing._id)); setRevision(value => value + 1) } }} />}
    </DialogContent>}</ArticleEditorDialog>}
    <Dialog open={deleting !== null} onOpenChange={open => { if (!open && !mutations.remove.isPending) setDeleting(null) }}><DialogContent><DialogHeader><DialogTitle>Xóa bài viết?</DialogTitle><DialogDescription>{deleting?.title} — Bài sẽ bị xóa vĩnh viễn.</DialogDescription></DialogHeader>{deleteError && <p role="alert" className="text-destructive">{deleteError}</p>}<Button variant="destructive" disabled={mutations.remove.isPending || !!deleteError} onClick={async () => { if (!deleting) return; try { await mutations.remove.mutateAsync({ id: deleting._id, expectedVersion: deleting.__v }); setDeleting(null) } catch (failure) { setDeleteError(getApiError(failure).message) } }}>Xác nhận xóa</Button>{deleteError && <Button variant="outline" onClick={async () => { await query.refetch(); setDeleting(null) }}>Tải lại danh sách để kiểm tra</Button>}</DialogContent></Dialog>
  </div></BaseLayout>
}
