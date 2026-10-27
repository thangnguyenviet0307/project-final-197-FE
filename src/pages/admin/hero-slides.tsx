import { useState } from "react"
import { BaseLayout } from "@/layout/admin/base-layout"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useHeroSlides, useHeroSlideMutations } from "@/features/hero-slides/hooks/use-hero-slides"
import { HeroSlideForm } from "@/features/hero-slides/components/hero-slide-form"
import type { HeroSlide, HeroSlideInput } from "@/features/hero-slides/types/hero-slides"
import { getApiError } from "@/services/api"

export default function AdminHeroSlidesPage() {
  const query = useHeroSlides()
  const mutations = useHeroSlideMutations()
  const [editing, setEditing] = useState<HeroSlide | "new" | null>(null)
  const [deleting, setDeleting] = useState<HeroSlide | null>(null)
  const [editorRevision, setEditorRevision] = useState(0)
  const [deleteError, setDeleteError] = useState("")
  const pending = mutations.create.isPending || mutations.update.isPending
  return <BaseLayout title="Hero trang chủ" description="Quản lý banner theo danh mục."><div className="space-y-4 px-4 lg:px-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Tối đa 50 slide. Thứ tự nhỏ hiển thị trước.</p><Button disabled={query.isPending || (query.data?.length ?? 0) >= 50} onClick={() => setEditing("new")}>Thêm slide</Button></div>
    {query.isPending ? <p role="status">Đang tải slide…</p> : query.isError ? <div role="alert">{getApiError(query.error).message}<Button onClick={() => void query.refetch()}>Thử lại</Button></div> : !query.data.length ? <p>Chưa có slide. Thêm slide để hiển thị hero trang chủ.</p> : <div className="overflow-x-auto rounded-lg border"><table className="w-full text-left text-sm"><thead><tr className="border-b">{["Thứ tự", "Tiêu đề", "Danh mục", "Trạng thái", "Thao tác"].map(title => <th key={title} className="p-3">{title}</th>)}</tr></thead><tbody>{query.data.map(slide => <tr key={slide._id} className="border-b last:border-0">
      <td className="p-3">{slide.sortOrder}</td><td className="max-w-md whitespace-pre-line break-words p-3 font-medium">{slide.title}</td><td className="p-3">{typeof slide.category === "object" ? slide.category?.name ?? "Không khả dụng" : "Không khả dụng"}</td><td className="p-3">{slide.isActive && typeof slide.category === "object" && slide.category?.isActive && !slide.category.isDeleted ? "Đang hiển thị" : "Đã ẩn"}</td>
      <td className="whitespace-nowrap p-3"><Button variant="outline" disabled={query.isFetching} onClick={() => setEditing(slide)}>Sửa</Button> <Button variant="destructive" disabled={query.isFetching} onClick={() => { setDeleteError(""); setDeleting(slide) }}>Xóa</Button></td>
    </tr>)}</tbody></table></div>}
    <Dialog open={editing !== null} onOpenChange={open => { if (!open && !pending) setEditing(null) }}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing === "new" ? "Thêm slide hero" : "Sửa slide hero"}</DialogTitle><DialogDescription>Chọn danh mục và nội dung. Nút khám phá được tạo tự động theo tên danh mục.</DialogDescription></DialogHeader>
      {editing && <HeroSlideForm key={editing === "new" ? "new" : `${editing._id}-${editing.__v}-${editorRevision}`} slide={editing === "new" ? undefined : editing} pending={pending} save={async input => {
        if (editing === "new") await mutations.create.mutateAsync(input)
        else {
          const previous: HeroSlideInput = { category: typeof editing.category === "string" ? editing.category : editing.category?._id ?? "", title: editing.title, description: editing.description, imageUrl: editing.imageUrl, sortOrder: editing.sortOrder, isActive: editing.isActive }
          const changed = Object.fromEntries(Object.entries(input).filter(([key, value]) => previous[key as keyof HeroSlideInput] !== value)) as Partial<HeroSlideInput>
          if (Object.keys(changed).length) await mutations.update.mutateAsync({ id: editing._id, input: { ...changed, expectedVersion: editing.__v } })
        }
        setEditing(null)
      }} reload={async () => {
        const result = await query.refetch({ throwOnError: true })
        if (editing !== "new") { const latest = result.data?.find(item => item._id === editing._id); setEditing(latest ?? null); setEditorRevision(value => value + 1) }
      }} />}
    </DialogContent></Dialog>
    <Dialog open={deleting !== null} onOpenChange={open => { if (!open && !mutations.remove.isPending) setDeleting(null) }}><DialogContent><DialogHeader><DialogTitle>Xóa slide hero?</DialogTitle><DialogDescription>{deleting?.title}</DialogDescription></DialogHeader>
      {deleteError && <p role="alert" className="text-destructive">{deleteError}</p>}
      <Button variant="destructive" disabled={mutations.remove.isPending || !!deleteError} onClick={async () => {
        if (!deleting) return
        try { await mutations.remove.mutateAsync({ id: deleting._id, expectedVersion: deleting.__v }); setDeleting(null) } catch (failure) { setDeleteError(getApiError(failure).message) }
      }}>Xóa slide</Button>
      {deleteError && <Button variant="outline" onClick={async () => { try { await query.refetch({ throwOnError: true }); setDeleting(null) } catch (failure) { setDeleteError(getApiError(failure).message) } }}>Tải lại danh sách để kiểm tra</Button>}
    </DialogContent></Dialog>
  </div></BaseLayout>
}
