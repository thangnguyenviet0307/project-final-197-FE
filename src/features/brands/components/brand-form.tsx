import { DESCRIPTION_MAX_LENGTH } from '@/constants/text-limits';
import { useUnsavedForm } from '@/hooks/use-unsaved-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { ImageUploadField } from '@/components/image-upload-field';
import { useSelectedImage } from '@/hooks/use-selected-image';
import { imageUrlSchema } from '@/utils/image-url';
import { getApiError } from '@/services/api';
import type { IBrand, CreateBrandInput } from '@/features/brands/types/brands';

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên thương hiệu.')
    .max(100, 'Tên thương hiệu không được vượt quá 100 ký tự.'),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH),
  logoUrl: imageUrlSchema,
  isActive: z.boolean(),
});
type Values = z.infer<typeof schema>;
export function BrandForm({
  brand,
  onSubmit,
  onSaved,
  onCancel,
  submitLabel = 'Tạo thương hiệu',
}: {
  brand?: IBrand;
  onSubmit: (values: CreateBrandInput) => Promise<unknown> | void;
  onSaved?: () => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: brand?.name ?? '',
      description: brand?.description ?? '',
      logoUrl: brand?.logoUrl ?? '',
      isActive: brand?.isActive ?? true,
    },
  });
  const image = useSelectedImage();
  const navigation = useUnsavedForm(
    form.formState.isDirty || !!image.selected || form.formState.isSubmitting
  );
  const busy = form.formState.isSubmitting;
  return (
    <>
      <form
        aria-label={brand ? 'Chỉnh sửa thương hiệu' : 'Tạo thương hiệu'}
        noValidate
        className="max-w-3xl space-y-6"
        onSubmit={form.handleSubmit(async (values) => {
          form.clearErrors();
          try {
            await onSubmit({
              ...values,
              ...(image.selected ? { image: image.selected.file } : {}),
            });
            navigation.allowSavedNavigation();
            onSaved?.();
          } catch (error) {
            form.setError('root', { message: getApiError(error).message });
          }
        })}
      >
        <fieldset disabled={busy} className="space-y-4">
          <Field>
            <FieldLabel required htmlFor="brand-name">
              Tên thương hiệu
            </FieldLabel>
            <Input
              placeholder="Nhập tên thương hiệu"
              id="brand-name"
              {...form.register('name')}
              aria-invalid={!!form.formState.errors.name}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <ImageUploadField
            id="brand-logo"
            guidance="Lưu ý: Logo trên web store hiển thị trong khung vuông 36 × 36 px. Nên dùng ảnh vuông tỷ lệ 1:1 (ví dụ 256 × 256 px), đặt logo ở giữa và hạn chế khoảng trắng thừa. Ảnh ngang hoặc dọc sẽ có khoảng trống để giữ trọn ảnh, không bị cắt hay kéo méo."
            label="Ảnh thương hiệu"
            selected={image.selected}
            existingUrl={brand?.logoUrl}
            error={image.error}
            disabled={busy}
            onSelect={image.select}
          />
          <Field>
            <FieldLabel htmlFor="brand-description">Mô tả</FieldLabel>
            <Textarea
              placeholder="Nhập mô tả thương hiệu"
              id="brand-description"
              maxLength={DESCRIPTION_MAX_LENGTH}
              rows={5}
              {...form.register('description')}
            />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('isActive')} />
            Thương hiệu đang hoạt động
          </label>
        </fieldset>
        {form.formState.errors.root && (
          <p role="alert" className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy || !!image.error}>
            {busy ? 'Đang lưu…' : submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => navigation.confirmDiscard(onCancel)}
          >
            Hủy
          </Button>
        </div>
      </form>
      {navigation.guard}
    </>
  );
}
