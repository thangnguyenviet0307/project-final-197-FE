import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { articleInputSchema, type ArticleInput } from "@/features/articles/schemas/article-schema"
import type { AdminArticle, PostCategory } from "@/features/articles/types/articles"
import { getApiError } from "@/services/api"

export function ArticleForm({ article, categories, save, reload, pending, onDirtyChange }: {
  article?: AdminArticle; categories: PostCategory[]; pending: boolean;
  save: (input: Partial<ArticleInput>) => Promise<unknown>; reload: () => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [initial] = useState(() => ({
    title: article?.title ?? "", slug: article?.slug ?? "", type: article?.type ?? "news",
    category: article?.category ?? "", categoryId: article?.categoryId ?? "",
    excerpt: article?.excerpt ?? "", content: article?.content ?? "", authorName: article?.authorName ?? "Ban biên tập",
    imageUrl: article?.imageUrl ?? "", tags: article?.tags.join(", ") ?? "", status: article?.status ?? "draft",
    publishAt: article?.publishAt ? new Date(Date.parse(article.publishAt) - new Date(article.publishAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
    isFeatured: article?.isFeatured ?? false, sortOrder: article?.sortOrder ?? 0,
    seoTitle: article?.seo.title ?? "", seoDescription: article?.seo.description ?? "",
  }))
  const [draft, setDraft] = useState(initial)
  const dirty = Object.keys(initial).some(key => draft[key as keyof typeof draft] !== initial[key as keyof typeof initial])
  useEffect(() => { onDirtyChange?.(dirty) }, [dirty, onDirtyChange])
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState("")
  const [conflict, setConflict] = useState(false)
  const patch = (value: Partial<typeof draft>) => setDraft(previous => ({ ...previous, ...value }))
  function input(values: typeof draft) {
    return { title: values.title, slug: values.slug.trim() || undefined, type: values.type,
      categoryId: values.categoryId || undefined, category: values.category,
      excerpt: values.excerpt, content: values.content, authorName: values.authorName,
      imageUrl: values.imageUrl.trim() || null, tags: values.tags.split(",").map(item => item.trim()).filter(Boolean),
      status: values.status, publishAt: !values.publishAt ? null : values.publishAt === initial.publishAt && article?.publishAt ? article.publishAt : new Date(values.publishAt).toISOString(),
      isFeatured: values.isFeatured, sortOrder: values.sortOrder, seo: { title: values.seoTitle, description: values.seoDescription },
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (pending || conflict) return
    try {
      const parsed = articleInputSchema.safeParse(input(draft))
      if (!parsed.success) { setError(parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ")); return }
      if (parsed.data.status === "scheduled" && (!article || draft.publishAt !== initial.publishAt || initial.status !== "scheduled") && Date.parse(parsed.data.publishAt ?? "") <= Date.now()) { setError("Thời gian lên lịch phải ở tương lai."); return }
      const baseline = input(initial)
      const changed = Object.fromEntries(Object.entries(parsed.data).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(baseline[key as keyof typeof baseline]))) as Partial<ArticleInput>
      if (article && Object.keys(changed).length === 0) { setError("Chưa có thay đổi để lưu."); return }
      setError("")
      await save(article ? changed : parsed.data)
    } catch (failure) {
      const result = getApiError(failure)
      setError(result.message)
      setConflict(result.code === "VERSION_CONFLICT")
    }
  }
  return <form onSubmit={submit} className="space-y-4">
    <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1 sm:col-span-2">Tiêu đề<Input required minLength={3} maxLength={200} value={draft.title} onChange={e => patch({ title: e.target.value })} /></label>
      <label className="grid gap-1">Loại bài<select className="h-10 rounded-md border bg-background px-3" value={draft.type} onChange={e => patch({ type: e.target.value as typeof draft.type })}><option value="news">Tin tức</option><option value="blog">Blog</option></select></label>
      <label className="grid gap-1">Danh mục<select required={!article || !!article.categoryId} className="h-10 rounded-md border bg-background px-3" value={draft.categoryId} onChange={e => patch({ categoryId: e.target.value, category: categories.find(c => c._id === e.target.value)?.name ?? "" })}><option value="">{article?.category || "Chọn danh mục"}</option>{categories.map(item => <option key={item._id} value={item._id} disabled={!item.isActive}>{item.name}{!item.isActive && " (Đã ẩn)"}</option>)}</select></label>
      <label className="grid gap-1">Slug<Input maxLength={255} value={draft.slug} onChange={e => patch({ slug: e.target.value })} placeholder="Tự tạo khi thêm mới" /></label>
      <label className="grid gap-1">Tác giả<Input required maxLength={120} value={draft.authorName} onChange={e => patch({ authorName: e.target.value })} /></label>
      <label className="grid gap-1 sm:col-span-2">Tóm tắt<Textarea required maxLength={1000} value={draft.excerpt} onChange={e => patch({ excerpt: e.target.value })} /></label>
      <label className="grid gap-1 sm:col-span-2">Nội dung<Textarea aria-label="Nội dung" required rows={12} maxLength={100000} value={draft.content} onChange={e => patch({ content: e.target.value })} /><span className="text-xs text-muted-foreground">Nội dung hiển thị dạng văn bản, giữ xuống dòng.</span></label>
      <label className="grid gap-1 sm:col-span-2">URL ảnh bìa<Input type="url" maxLength={2048} value={draft.imageUrl} onChange={e => patch({ imageUrl: e.target.value })} /></label>
      <label className="grid gap-1">Trạng thái<select className="h-10 rounded-md border bg-background px-3" value={draft.status} onChange={e => patch({ status: e.target.value as typeof draft.status })}><option value="draft">Bản nháp</option><option value="published">Xuất bản</option><option value="scheduled">Lên lịch</option><option value="archived">Lưu trữ / Ẩn</option></select></label>
      <label className="grid gap-1">Thời gian xuất bản<Input type="datetime-local" required={draft.status === "scheduled"} value={draft.publishAt} onChange={e => patch({ publishAt: e.target.value })} /></label>
      <label className="grid gap-1">Thẻ (cách nhau bằng dấu phẩy)<Input value={draft.tags} onChange={e => patch({ tags: e.target.value })} /></label>
      <label className="grid gap-1">Thứ tự trên trang chủ<Input type="number" required min={0} max={10000} value={draft.sortOrder} onChange={e => patch({ sortOrder: e.target.valueAsNumber })} /></label>
      <label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" checked={draft.isFeatured} onChange={e => patch({ isFeatured: e.target.checked })} />Chọn hiển thị trên trang chủ (chỉ Tin tức đã xuất bản, danh mục đang bật)</label>
      <label className="grid gap-1">Tiêu đề SEO<Input maxLength={70} value={draft.seoTitle} onChange={e => patch({ seoTitle: e.target.value })} /></label>
      <label className="grid gap-1">Mô tả SEO<Textarea maxLength={160} value={draft.seoDescription} onChange={e => patch({ seoDescription: e.target.value })} /></label>
    </fieldset>
    <Button type="button" variant="outline" onClick={() => setPreview(!preview)}>{preview ? "Đóng xem trước" : "Xem trước"}</Button>
    {preview && <article aria-label="Xem trước bài viết" className="space-y-3 rounded-lg border p-4"><h2 className="text-xl font-bold">{draft.title}</h2><p>{draft.excerpt}</p><div className="whitespace-pre-wrap break-words">{draft.content}</div></article>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {conflict && <Button type="button" variant="outline" onClick={() => void reload().catch(failure => setError(getApiError(failure).message))}>Tải lại dữ liệu (bỏ thay đổi)</Button>}
    <Button type="submit" disabled={pending || conflict}>{pending ? "Đang lưu…" : "Lưu bài viết"}</Button>
  </form>
}
