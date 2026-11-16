import { ImageUploadField } from '@/components/image-upload-field';
import { useSelectedImage } from '@/hooks/use-selected-image';
import { uploadEditorImage } from '@/services/editor-image.service';
import { DESCRIPTION_MAX_LENGTH } from '@/constants/text-limits';
import { RequiredMark } from '@/components/required-mark';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { heroSlideSchema } from '@/features/hero-slides/schemas/hero-slide-schema';
import type {
  HeroSlide,
  HeroSlideInput,
} from '@/features/hero-slides/types/hero-slides';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getApiError } from '@/services/api';

export function HeroSlideForm({
  slide,
  pending,
  save,
  reload,
}: {
  slide?: HeroSlide;
  pending: boolean;
  save: (input: HeroSlideInput) => Promise<unknown>;
  reload: () => Promise<void>;
}) {
  const image = useSelectedImage();
  const upload = useRef<AbortController | null>(null);
  useEffect(() => () => upload.current?.abort(), []);
  const [saving, setSaving] = useState(false);
  const busy = pending || saving;
  const categories = useCategories();
  const choices = (categories.data ?? []).filter(
    (item) => item.isActive && !item.isDeleted
  );
  const [draft, setDraft] = useState(() => ({
    category:
      typeof slide?.category === 'string'
        ? slide.category
        : (slide?.category?._id ?? ''),
    title: slide?.title ?? '',
    description: slide?.description ?? '',
    imageUrl: slide?.imageUrl ?? '',
    sortOrder: slide?.sortOrder ?? 0,
    isActive: slide?.isActive ?? true,
  }));
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [conflict, setConflict] = useState(false);
  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (conflict || busy || image.error) return;
    const schema =
      slide && !slide.category && !draft.category
        ? heroSlideSchema.omit({ category: true })
        : heroSlideSchema;
    const result = schema.safeParse(draft);
    if (!result.success) {
      setError(
        result.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; ')
      );
      return;
    }
    try {
      setSaving(true);
      setError('');
      setCategoryError('');
      if (image.selected) {
        const controller = new AbortController();
        upload.current = controller;
        const uploaded = await uploadEditorImage(image.selected.file, controller.signal, 'hero');
        if (controller.signal.aborted) return;
        result.data.imageUrl = uploaded.url;
        setDraft((previous) => ({ ...previous, imageUrl: uploaded.url }));
        image.select(null);
      }
      await save({ ...result.data, category: draft.category });
    } catch (failure) {
      if (upload.current?.signal.aborted) return;
      const apiError = getApiError(failure);
      if (apiError.code === 'CATEGORY_UNAVAILABLE')
        setCategoryError(apiError.message);
      else setError(apiError.message);
      setConflict(apiError.code === 'VERSION_CONFLICT' && !!slide);
    } finally {
      upload.current = null;
      setSaving(false);
    }
  }
  const unavailable =
    draft.category && !choices.some((item) => item._id === draft.category);
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset
        disabled={busy || categories.isPending || categories.isError}
        className="space-y-4 disabled:opacity-70"
      >
        <label className="grid gap-2 text-sm">
          <span>
            Danh mục {(!slide || !!slide.category) && <RequiredMark />}
          </span>
          <select
            required={!slide || !!slide.category}
            aria-invalid={!!categoryError}
            aria-describedby={categoryError ? 'hero-category-error' : undefined}
            aria-busy={categories.isPending}
            className="bg-background h-10 rounded-md border px-3"
            value={draft.category}
            onChange={(event) => {
              setDraft((previous) => ({
                ...previous,
                category: event.target.value,
              }));
              setCategoryError('');
            }}
          >
            <option value="">Chọn danh mục</option>
            {unavailable && (
              <option value={draft.category} disabled>
                Danh mục không khả dụng
              </option>
            )}
            {choices.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        {categoryError && (
          <p
            id="hero-category-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {categoryError}
          </p>
        )}
        <label className="grid gap-2 text-sm">
          <span>
            Tiêu đề <RequiredMark />
          </span>
          <Textarea
            placeholder="Nhập tiêu đề banner"
            required
            maxLength={200}
            value={draft.title}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                title: event.target.value,
              }))
            }
          />
        </label>
        <label className="grid gap-2 text-sm">
          Mô tả
          <Textarea
            placeholder="Nhập mô tả banner"
            maxLength={DESCRIPTION_MAX_LENGTH}
            value={draft.description}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
          />
        </label>
        <ImageUploadField
          id="hero-background"
          label="Ảnh nền"
          selected={image.selected}
          existingUrl={draft.imageUrl}
          error={image.error}
          disabled={busy}
          onSelect={image.select}
          guidance="Để trống để dùng ảnh danh mục."
        />
        <label className="grid gap-2 text-sm">
          <span>
            Thứ tự <RequiredMark />
          </span>
          <Input
            type="number"
            min={0}
            max={10000}
            step={1}
            required
            value={draft.sortOrder}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                sortOrder: event.target.valueAsNumber,
              }))
            }
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                isActive: event.target.checked,
              }))
            }
          />
          Hiển thị slide
        </label>
        <p className="text-muted-foreground text-sm">
          Nút: Khám phá{' '}
          {choices.find((item) => item._id === draft.category)?.name ??
            'tên danh mục'}
        </p>
      </fieldset>
      {categories.isError && (
        <p role="alert">
          Không thể tải danh mục.{' '}
          <Button
            type="button"
            variant="outline"
            onClick={() => void categories.refetch()}
          >
            Thử lại
          </Button>
        </p>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {conflict && slide && (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={async () => {
            try {
              await reload();
            } catch (failure) {
              setError(getApiError(failure).message);
            }
          }}
        >
          Tải lại dữ liệu (bỏ thay đổi)
        </Button>
      )}
      <Button
        type="submit"
        disabled={
          busy || !!image.error || conflict || categories.isPending || categories.isError
        }
      >
        {pending ? 'Đang lưu…' : 'Lưu slide'}
      </Button>
    </form>
  );
}
