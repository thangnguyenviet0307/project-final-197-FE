import { useEffect, useState, type SubmitEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { categoryInputSchema } from "@/features/articles/schemas/article-schema"
import type { CategoryInput, PostCategory } from "@/features/articles/types/articles"
import { getApiError } from "@/services/api"
export function PostCategoryForm({ category, pending, save, reload, onDirtyChange }: { category?: PostCategory; pending: boolean; save: (input: CategoryInput) => Promise<unknown>; reload: () => Promise<void>; onDirtyChange?: (dirty: boolean) => void }) {
  const [initial] = useState(() => ({ name: category?.name ?? "", slug: category?.slug ?? "", description: category?.description ?? "", isActive: category?.isActive ?? true }))
  const [draft, setDraft] = useState(initial)
  const dirty = Object.keys(initial).some(key => draft[key as keyof typeof draft] !== initial[key as keyof typeof initial])
  useEffect(() => { onDirtyChange?.(dirty) }, [dirty, onDirtyChange])
  const [error, setError] = useState("")
  const [conflict, setConflict] = useState(false)
  async function submit(e: SubmitEvent) {
    e.preventDefault()
    if (pending || conflict) return
    const parsed = categoryInputSchema.safeParse(draft)
    if (!parsed.success) { setError(parsed.error.issues.map(issue => issue.message).join("; ")); return }
    try { await save(parsed.data) } catch (failure) { const apiError = getApiError(failure); setError(apiError.message); setConflict(apiError.code === "VERSION_CONFLICT") }
  }
  return <form onSubmit={submit} className="space-y-4"><fieldset disabled={pending} className="space-y-4"><label className="grid gap-1">Tên danh mục<Input required maxLength={80} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label><label className="grid gap-1">Slug danh mục<Input required maxLength={255} placeholder="vi-du-phu-kien" value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })} /></label><label className="grid gap-1">Mô tả danh mục<Input maxLength={500} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label><label className="flex gap-2"><input type="checkbox" checked={draft.isActive} onChange={e => setDraft({ ...draft, isActive: e.target.checked })} />Bật danh mục (tắt sẽ ẩn các bài thuộc danh mục)</label></fieldset>{error && <p role="alert" className="text-destructive">{error}</p>}{conflict && <Button type="button" variant="outline" onClick={() => void reload().catch(failure => setError(getApiError(failure).message))}>Tải lại danh mục (bỏ thay đổi)</Button>}<Button disabled={pending || conflict} type="submit">Lưu danh mục</Button></form>
}
