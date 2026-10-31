import { useState } from "react"
import { Link } from "react-router-dom"
import { BaseLayout } from "@/layout/admin/base-layout"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArticleEditorDialog } from "@/features/articles/components/article-editor-dialog"
import { PostCategoryForm } from "@/features/articles/components/category-form"
import { usePostCategories, useArticleMutations } from "@/features/articles/hooks/use-articles"
import type { PostCategory } from "@/features/articles/types/articles"
import { getApiError } from "@/services/api"
export default function PostCategoriesPage() {
  const query = usePostCategories()
  const mutations = useArticleMutations()
  const [editing, setEditing] = useState<PostCategory | "new" | null>(null)
  const [deleting, setDeleting] = useState<PostCategory | null>(null)
  const [error, setError] = useState("")
  const [revision, setRevision] = useState(0)
  const pending = mutations.createCategory.isPending || mutations.updateCategory.isPending
  return <BaseLayout title="Danh mục bài viết" description="Danh mục riêng của Tin tức và Blog."><div className="space-y-4 px-4 lg:px-6"><div className="flex gap-3"><Button onClick={() => setEditing("new")}>Thêm danh mục bài viết</Button><Link to="/auth/articles" className="rounded-md border px-4 py-2 text-sm">Quay lại bài viết</Link><Button variant="outline" onClick={() => void query.refetch()}>Làm mới</Button></div>
    {query.isPending ? <p role="status">Đang tải danh mục…</p> : query.isError ? <p role="alert">{getApiError(query.error).message}<Button onClick={() => void query.refetch()}>Thử lại</Button></p> : !query.data.length ? <p>Chưa có danh mục bài viết.</p> : <div className="overflow-x-auto rounded-lg border"><table className="w-full text-left text-sm"><thead><tr>{["Tên", "Slug", "Trạng thái", "Thao tác"].map(label => <th className="p-3" key={label}>{label}</th>)}</tr></thead><tbody>{query.data.map(item => <tr key={item._id} className="border-t"><td className="p-3">{item.name}</td><td className="p-3">{item.slug}</td><td className="p-3">{item.isActive ? "Đang bật" : "Đã ẩn"}</td><td className="space-x-2 p-3"><Button variant="outline" disabled={query.isFetching} onClick={() => setEditing(item)}>Sửa</Button><Button variant="destructive" disabled={query.isFetching} onClick={() => { setError(""); setDeleting(item) }}>Xóa</Button></td></tr>)}</tbody></table></div>}
    <>{editing !== null && <ArticleEditorDialog key={`${editing === "new" ? "new" : editing._id}-${revision}`} pending={pending} close={() => setEditing(null)}>{onDirtyChange => <DialogContent><DialogHeader><DialogTitle>{editing === "new" ? "Thêm danh mục" : "Sửa danh mục"}</DialogTitle><DialogDescription>Không thể xóa danh mục đang có bài viết.</DialogDescription></DialogHeader>{editing && <PostCategoryForm onDirtyChange={onDirtyChange} key={`${editing === "new" ? "new" : editing._id}-${revision}`} category={editing === "new" ? undefined : editing} pending={pending} save={async input => { if (editing === "new") await mutations.createCategory.mutateAsync(input); else await mutations.updateCategory.mutateAsync({ id: editing._id, input: { ...input, expectedVersion: editing.__v } }); setEditing(null) }} reload={async () => { const result = await query.refetch({ throwOnError: true }); if (editing !== "new") { const next = result.data?.find(item => item._id === editing._id); if (!next) throw new Error("Danh mục đã bị xóa"); setEditing(next); setRevision(value => value + 1) } }} />}</DialogContent>}</ArticleEditorDialog>}</>
    <Dialog open={deleting !== null} onOpenChange={open => { if (!open && !mutations.removeCategory.isPending) setDeleting(null) }}><DialogContent><DialogHeader><DialogTitle>Xóa danh mục bài viết?</DialogTitle><DialogDescription>{deleting?.name} — thao tác không thể hoàn tác.</DialogDescription></DialogHeader>{error && <p role="alert" className="text-destructive">{error}</p>}<Button variant="destructive" disabled={mutations.removeCategory.isPending || !!error} onClick={async () => { if (!deleting) return; try { await mutations.removeCategory.mutateAsync({ id: deleting._id, expectedVersion: deleting.__v }); setDeleting(null) } catch (failure) { setError(getApiError(failure).message) } }}>Xác nhận xóa danh mục</Button>{error && <Button onClick={async () => { await query.refetch(); setDeleting(null) }}>Tải lại danh sách</Button>}</DialogContent></Dialog>
  </div></BaseLayout>
}
