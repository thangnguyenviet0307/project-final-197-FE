import { ContentBody } from '@/features/support/components/content';
import { RichTextEditor } from '@/components/rich-text-editor';
import { ImageUploadField } from '@/components/image-upload-field';
import { useSelectedImage } from '@/hooks/use-selected-image';
import { uploadEditorImage } from '@/services/editor-image.service';
import { DESCRIPTION_MAX_LENGTH } from '@/constants/text-limits';
import { RequiredMark } from '@/components/required-mark';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  articleInputSchema,
  type ArticleInput,
} from '@/features/articles/schemas/article-schema';
import type {
  AdminArticle,
  PostCategory,
} from '@/features/articles/types/articles';
import { getApiError } from '@/services/api';

export function ArticleForm({
  article,
  categories,
  save,
  reload,
  pending,
  onDirtyChange,
}: {
  article?: AdminArticle;
  categories: PostCategory[];
  pending: boolean;
  save: (input: Partial<ArticleInput>) => Promise<unknown>;
  reload: () => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [initial] = useState(() => ({
    title: article?.title ?? '',
    type: article?.type ?? 'news',
    category: article?.category ?? '',
    categoryId: article?.categoryId ?? '',
    excerpt: article?.excerpt ?? '',
    content: article?.content ?? '',
    authorName: article?.authorName ?? 'Ban biên tập',
    imageUrl: article?.imageUrl ?? '',
    tags: article?.tags.join(', ') ?? '',
    status: article?.status ?? 'draft',
    publishAt: article?.publishAt
      ? new Date(
          Date.parse(article.publishAt) -
            new Date(article.publishAt).getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16)
      : '',
    isFeatured: article?.isFeatured ?? false,
    sortOrder: article?.sortOrder ?? 0,
    seoTitle: article?.seo.title ?? '',
    seoDescription: article?.seo.description ?? '',
  }));
  const image = useSelectedImage();
  const upload = useRef<AbortController | null>(null);
  useEffect(() => () => upload.current?.abort(), []);
  const [saving, setSaving] = useState(false);
  const busy = pending || saving;
  const [draft, setDraft] = useState(initial);
  const dirty = !!image.selected || Object.keys(initial).some(
    (key) =>
      draft[key as keyof typeof draft] !== initial[key as keyof typeof initial]
  );
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const patch = (value: Partial<typeof draft>) =>
    setDraft((previous) => ({ ...previous, ...value }));
  function input(values: typeof draft) {
    return {
      title: values.title,
      type: values.type,
      categoryId: values.categoryId || undefined,
      category: values.category,
      excerpt: values.excerpt,
      content: values.content,
      authorName: values.authorName,
      imageUrl: values.imageUrl.trim() || null,
      tags: values.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      status: values.status,
      publishAt: !values.publishAt
        ? null
        : values.publishAt === initial.publishAt && article?.publishAt
          ? article.publishAt
          : new Date(values.publishAt).toISOString(),
      isFeatured: values.isFeatured,
      sortOrder: values.sortOrder,
      seo: { title: values.seoTitle, description: values.seoDescription },
    };
  }
  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (busy || conflict || image.error) return;
    setSaving(true);
    try {
      const parsed = articleInputSchema.safeParse(input(draft));
      if (!parsed.success) {
        setError(
          parsed.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join('; ')
        );
        return;
      }
      if (
        parsed.data.status === 'scheduled' &&
        (!article ||
          draft.publishAt !== initial.publishAt ||
          initial.status !== 'scheduled') &&
        Date.parse(parsed.data.publishAt ?? '') <= Date.now()
      ) {
        setError('Thời gian lên lịch phải ở tương lai.');
        return;
      }
      if (image.selected) {
        const controller = new AbortController();
        upload.current = controller;
        const uploaded = await uploadEditorImage(image.selected.file, controller.signal, 'articles');
        if (controller.signal.aborted) return;
        parsed.data.imageUrl = uploaded.url;
        patch({ imageUrl: uploaded.url });
        image.select(null);
      }
      const baseline = input(initial);
      const changed = Object.fromEntries(
        Object.entries(parsed.data).filter(
          ([key, value]) =>
            JSON.stringify(value) !==
            JSON.stringify(baseline[key as keyof typeof baseline])
        )
      ) as Partial<ArticleInput>;
      if (article && Object.keys(changed).length === 0) {
        setError('Chưa có thay đổi để lưu.');
        return;
      }
      setError('');
      await save(article ? changed : parsed.data);
    } catch (failure) {
      if (upload.current?.signal.aborted) return;
      const result = getApiError(failure);
      setError(result.message);
      setConflict(result.code === 'VERSION_CONFLICT');
    } finally {
      upload.current = null;
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 sm:col-span-2">
          <span>
            Tiêu đề <RequiredMark />
          </span>
          <Input
            placeholder="Nhập tiêu đề bài viết"
            required
            minLength={3}
            maxLength={200}
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </label>
        <label className="grid gap-1">
          <span>
            Loại bài <RequiredMark />
          </span>
          <select
            className="bg-background h-10 rounded-md border px-3"
            value={draft.type}
            onChange={(e) =>
              patch({ type: e.target.value as typeof draft.type })
            }
          >
            <option value="news">Tin tức</option>
            <option value="blog">Blog</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span>
            Danh mục {(!article || !!article.categoryId) && <RequiredMark />}
          </span>
          <select
            required={!article || !!article.categoryId}
            className="bg-background h-10 rounded-md border px-3"
            value={draft.categoryId}
            onChange={(e) =>
              patch({
                categoryId: e.target.value,
                category:
                  categories.find((c) => c._id === e.target.value)?.name ?? '',
              })
            }
          >
            <option value="">{article?.category || 'Chọn danh mục'}</option>
            {categories.map((item) => (
              <option key={item._id} value={item._id} disabled={!item.isActive}>
                {item.name}
                {!item.isActive && ' (Đã ẩn)'}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span>
            Tác giả <RequiredMark />
          </span>
          <Input
            placeholder="Nhập tên tác giả"
            required
            maxLength={120}
            value={draft.authorName}
            onChange={(e) => patch({ authorName: e.target.value })}
          />
        </label>
        <label className="grid gap-1 sm:col-span-2">
          <span>
            Tóm tắt <RequiredMark />
          </span>
          <Textarea
            placeholder="Nhập mô tả ngắn cho bài viết"
            required
            maxLength={DESCRIPTION_MAX_LENGTH}
            value={draft.excerpt}
            onChange={(e) => patch({ excerpt: e.target.value })}
          />
        </label>
        <div className="grid gap-1 sm:col-span-2">
          <span>Nội dung <RequiredMark /></span>
          <RichTextEditor
            value={draft.content}
            onChange={(content) => patch({ content })}
            disabled={busy}
            label="Nội dung"
          />
        </div>
        <div className="sm:col-span-2">
          <ImageUploadField
            id="article-cover"
            label="Ảnh bìa"
            selected={image.selected}
            existingUrl={draft.imageUrl}
            error={image.error}
            disabled={busy}
            onSelect={image.select}
          />
        </div>
        <label className="grid gap-1">
          <span>
            Trạng thái <RequiredMark />
          </span>
          <select
            className="bg-background h-10 rounded-md border px-3"
            value={draft.status}
            onChange={(e) =>
              patch({ status: e.target.value as typeof draft.status })
            }
          >
            <option value="draft">Bản nháp</option>
            <option value="published">Xuất bản</option>
            <option value="scheduled">Lên lịch</option>
            <option value="archived">Lưu trữ / Ẩn</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span>
            Thời gian xuất bản{' '}
            {draft.status === 'scheduled' && <RequiredMark />}
          </span>
          <Input
            type="datetime-local"
            required={draft.status === 'scheduled'}
            value={draft.publishAt}
            onChange={(e) => patch({ publishAt: e.target.value })}
          />
        </label>
        <label className="grid gap-1">
          Thẻ (cách nhau bằng dấu phẩy)
          <Input
            placeholder="Ví dụ: điện thoại, công nghệ"
            value={draft.tags}
            onChange={(e) => patch({ tags: e.target.value })}
          />
        </label>
        <label className="grid gap-1">
          <span>
            Thứ tự trên trang chủ <RequiredMark />
          </span>
          <Input
            type="number"
            required
            min={0}
            max={10000}
            value={draft.sortOrder}
            onChange={(e) => patch({ sortOrder: e.target.valueAsNumber })}
          />
        </label>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={draft.isFeatured}
            onChange={(e) => patch({ isFeatured: e.target.checked })}
          />
          Chọn hiển thị trên trang chủ (chỉ Tin tức đã xuất bản, danh mục đang
          bật)
        </label>
        <label className="grid gap-1">
          Tiêu đề SEO
          <Input
            placeholder="Nhập tiêu đề SEO"
            maxLength={70}
            value={draft.seoTitle}
            onChange={(e) => patch({ seoTitle: e.target.value })}
          />
        </label>
        <label className="grid gap-1">
          Mô tả SEO
          <Textarea
            placeholder="Nhập mô tả SEO"
            maxLength={160}
            value={draft.seoDescription}
            onChange={(e) => patch({ seoDescription: e.target.value })}
          />
        </label>
      </fieldset>
      <Button
        type="button"
        variant="outline"
        onClick={() => setPreview(!preview)}
      >
        {preview ? 'Đóng xem trước' : 'Xem trước'}
      </Button>
      {preview && (
        <article
          aria-label="Xem trước bài viết"
          className="space-y-3 rounded-lg border p-4"
        >
          <h2 className="text-xl font-bold">{draft.title}</h2>
          <p>{draft.excerpt}</p>
          <ContentBody value={draft.content} />
        </article>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {conflict && (
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            void reload().catch((failure) =>
              setError(getApiError(failure).message)
            )
          }
        >
          Tải lại dữ liệu (bỏ thay đổi)
        </Button>
      )}
      <Button type="submit" disabled={busy || conflict || !!image.error}>
        {pending ? 'Đang lưu…' : 'Lưu bài viết'}
      </Button>
    </form>
  );
}
